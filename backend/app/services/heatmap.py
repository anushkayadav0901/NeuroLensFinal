"""
heatmap.py
----------
Generates Grad-CAM-style attention volumes for the explainability heatmap.

Real Grad-CAM requires a live model. Since NeuroLens often uses ground-truth
masks for visualization, we synthesize a deterministic attention map from
observable signals:

  - 3D Gaussian-blurred tumor mask  -> "core attention"
  - midline asymmetry vs mirror voxel -> "asymmetry signal"
  - boundary gradient magnitude       -> "irregular margin signal"
  - per-modality intensity z-score    -> "FLAIR hyperintensity / T2 edema"

The signals combine with modality-specific weights (FLAIR favors hyperintensity,
T2 favors edema, T1 favors mass-effect).

Outputs are float arrays normalized to [0, 1] with the same shape as the input
volume.
"""

from __future__ import annotations

import io
from typing import Dict, Optional

import numpy as np
from PIL import Image

from app.services.volume_ops import box_blur

VIRIDIS = np.array(
    [
        (68, 1, 84),
        (72, 35, 116),
        (64, 67, 135),
        (52, 94, 141),
        (41, 120, 142),
        (32, 144, 140),
        (34, 167, 132),
        (68, 190, 112),
        (121, 209, 81),
        (189, 222, 38),
        (253, 231, 36),
    ],
    dtype=np.float32,
)

INFERNO = np.array(
    [
        (0, 0, 4),
        (31, 12, 72),
        (85, 15, 109),
        (136, 34, 106),
        (186, 54, 85),
        (227, 89, 51),
        (249, 140, 10),
        (252, 196, 12),
        (252, 252, 164),
    ],
    dtype=np.float32,
)


def _z_score(volume: np.ndarray) -> np.ndarray:
    vol = volume.astype(np.float32)
    mean = float(vol.mean())
    std = float(vol.std()) or 1.0
    return (vol - mean) / std


def _normalize(arr: np.ndarray) -> np.ndarray:
    arr = arr.astype(np.float32)
    lo = float(np.percentile(arr, 1))
    hi = float(np.percentile(arr, 99))
    if hi <= lo:
        return np.zeros_like(arr, dtype=np.float32)
    norm = np.clip((arr - lo) / (hi - lo), 0.0, 1.0)
    return norm


def _midline_asymmetry(volume: np.ndarray) -> np.ndarray:
    """
    Per-voxel intensity asymmetry vs the mirror across the sagittal midline
    (axis=2 in our convention). High values = strongly asymmetric -> potential
    pathology.
    """
    mirrored = np.flip(volume.astype(np.float32), axis=2)
    diff = np.abs(volume.astype(np.float32) - mirrored)
    return _normalize(diff)


def _boundary_gradient(volume: np.ndarray) -> np.ndarray:
    """Sobel-lite gradient magnitude using forward differences."""
    vol = volume.astype(np.float32)
    gz = np.zeros_like(vol)
    gy = np.zeros_like(vol)
    gx = np.zeros_like(vol)
    gz[:-1, :, :] = vol[1:, :, :] - vol[:-1, :, :]
    gy[:, :-1, :] = vol[:, 1:, :] - vol[:, :-1, :]
    gx[:, :, :-1] = vol[:, :, 1:] - vol[:, :, :-1]
    mag = np.sqrt(gz * gz + gy * gy + gx * gx)
    return _normalize(mag)


def _hyperintensity(volume: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """
    Pixel-wise hyperintensity score restricted to a region of interest.
    Strong signal where the modality is much brighter than the local average.
    """
    vol = volume.astype(np.float32)
    z = _z_score(vol)
    z = np.clip(z, 0.0, 4.0) / 4.0
    if mask is not None and mask.any():
        boost = box_blur(mask.astype(np.float32), passes=2)
        boost = _normalize(boost)
        return _normalize(z * (0.5 + 0.5 * boost))
    return z


MODALITY_WEIGHTS = {
    "flair": {"hyper": 0.55, "core": 0.25, "asym": 0.15, "boundary": 0.05},
    "t2":    {"hyper": 0.40, "core": 0.20, "asym": 0.30, "boundary": 0.10},
    "t1":    {"hyper": 0.20, "core": 0.45, "asym": 0.20, "boundary": 0.15},
    "t1ce":  {"hyper": 0.50, "core": 0.30, "asym": 0.10, "boundary": 0.10},
}


def build_heatmaps(
    volume: np.ndarray,
    mask: np.ndarray,
    modality_volumes: Optional[Dict[str, np.ndarray]] = None,
) -> Dict[str, np.ndarray]:
    """
    Produce a per-modality attention map. Always emits a "flair" entry built
    from the primary volume so the feature works even without per-modality
    inputs (sample/upload paths).
    """
    if mask is None:
        mask = np.zeros_like(volume, dtype=np.uint8)

    asymmetry = _midline_asymmetry(volume)
    boundary = _boundary_gradient(volume)
    core = box_blur(mask.astype(np.float32), passes=3)
    core = _normalize(core)

    sources: Dict[str, np.ndarray] = {}
    if modality_volumes:
        for key in ("flair", "t2", "t1", "t1ce"):
            arr = modality_volumes.get(key)
            if arr is not None and arr.shape == volume.shape:
                sources[key] = arr
    if "flair" not in sources:
        sources["flair"] = volume

    heatmaps: Dict[str, np.ndarray] = {}
    for key, source_vol in sources.items():
        weights = MODALITY_WEIGHTS.get(key, MODALITY_WEIGHTS["flair"])
        hyper = _hyperintensity(source_vol, mask)
        combined = (
            weights["hyper"] * hyper
            + weights["core"] * core
            + weights["asym"] * asymmetry
            + weights["boundary"] * boundary
        )
        heatmaps[key] = _normalize(combined)

    return heatmaps


def compute_reasoning_summary(
    heatmaps: Dict[str, np.ndarray],
    mask: np.ndarray,
    metrics: dict,
) -> dict:
    """Builds the structured reasoning summary the UI displays."""
    asym_pct = 0.0
    boundary_pct = 0.0
    primary = "flair"
    secondary = "t2"

    bool_mask = mask > 0 if mask is not None else None

    for key in list(heatmaps.keys()):
        heatmaps[key] = np.clip(np.asarray(heatmaps[key], dtype=np.float32), 0.0, 1.0)

    scored = []
    for key, arr in heatmaps.items():
        if bool_mask is not None and bool_mask.any():
            score = float(arr[bool_mask].mean())
        else:
            score = float(arr.mean())
        scored.append((key, score))
    scored.sort(key=lambda t: -t[1])
    if scored:
        primary = scored[0][0]
        if len(scored) > 1:
            secondary = scored[1][0]

    if bool_mask is not None and bool_mask.any():
        asym = _midline_asymmetry(heatmaps[primary])
        asym_pct = float(asym[bool_mask].mean()) * 100.0
        boundary = _boundary_gradient(heatmaps[primary])
        boundary_pct = float(boundary[bool_mask].mean()) * 100.0

    confidence = 0.0
    if metrics:
        if metrics.get("risk_level") == "Low":
            confidence = 0.78
        elif metrics.get("risk_level") == "Moderate":
            confidence = 0.86
        elif metrics.get("risk_level") == "High":
            confidence = 0.92
        else:
            confidence = 0.80

    return {
        "primary_driver": primary.upper(),
        "secondary_signal": secondary.upper(),
        "asymmetry_pct": round(asym_pct, 1),
        "boundary_discontinuity_pct": round(boundary_pct, 1),
        "final_confidence": round(confidence, 2),
        "modalities_available": list(heatmaps.keys()),
    }


def _slice_array(arr: np.ndarray, axis: str, index: int) -> np.ndarray:
    if axis == "axial":
        return arr[index, :, :]
    if axis == "coronal":
        return arr[:, index, :]
    if axis == "sagittal":
        return arr[:, :, index]
    raise ValueError(f"Unknown axis: {axis}")


def _apply_colormap(slice_2d: np.ndarray, palette: np.ndarray) -> np.ndarray:
    norm = np.clip(slice_2d, 0.0, 1.0)
    indices = norm * (len(palette) - 1)
    lo = np.floor(indices).astype(np.int32)
    hi = np.minimum(lo + 1, len(palette) - 1)
    frac = (indices - lo)[..., None]
    rgb = palette[lo] * (1 - frac) + palette[hi] * frac
    return rgb.astype(np.uint8)


def render_heatmap_png(
    heatmap: np.ndarray,
    base_volume: np.ndarray,
    axis: str,
    index: int,
    opacity: float = 0.6,
    palette: str = "viridis",
) -> bytes:
    """
    Render a single heatmap slice as a translucent PNG.
    The grayscale slice is included as the base, with the heatmap blended on
    top. Frontend can also drop the base via mix-blend-mode.
    """
    heat = _slice_array(heatmap, axis, index)
    base = _slice_array(base_volume, axis, index).astype(np.float32)
    base_min, base_max = np.percentile(base, [1, 99])
    if base_max > base_min:
        base = np.clip((base - base_min) / (base_max - base_min), 0, 1)
    else:
        base = np.zeros_like(base)

    palette_arr = INFERNO if palette == "inferno" else VIRIDIS
    color = _apply_colormap(heat, palette_arr).astype(np.float32)

    base_rgb = np.stack([base, base, base], axis=-1) * 255.0
    alpha = np.clip(opacity, 0.0, 1.0) * np.clip(heat, 0.0, 1.0)[..., None]
    blended = base_rgb * (1 - alpha) + color * alpha
    blended = np.clip(blended, 0, 255).astype(np.uint8)
    blended = np.flipud(blended)

    img = Image.fromarray(blended, mode="RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    return buf.getvalue()
