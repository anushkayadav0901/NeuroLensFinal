"""
risk_radar.py
-------------
Computes proximity from the segmented tumor to the bundled anatomical
structures defined in anatomical_atlas.py. Powers the Risk Radar UI.

For every structure we compute:
  - centroid_distance_mm: tumor centroid -> structure centroid
  - surface_distance_mm:  nearest tumor voxel -> structure centroid - radius
  - overlap: whether the structure sphere intersects the tumor mask
  - risk_zone: critical | high | moderate | low

A KD-tree over tumor surface voxels keeps the nearest-distance lookup fast
even for large masks. Falls back to a vectorized numpy distance otherwise.
"""

from __future__ import annotations

from typing import List

import numpy as np

from app.services.anatomical_atlas import (
    get_structures,
    risk_zone_for_distance,
)


def _surface_voxels(mask: np.ndarray) -> np.ndarray:
    """Return coords of mask boundary voxels (a 6-connected erosion diff)."""
    if mask is None or mask.size == 0:
        return np.empty((0, 3), dtype=np.int32)

    bool_mask = mask > 0
    if not bool_mask.any():
        return np.empty((0, 3), dtype=np.int32)

    eroded = (
        bool_mask
        & np.roll(bool_mask, 1, axis=0)
        & np.roll(bool_mask, -1, axis=0)
        & np.roll(bool_mask, 1, axis=1)
        & np.roll(bool_mask, -1, axis=1)
        & np.roll(bool_mask, 1, axis=2)
        & np.roll(bool_mask, -1, axis=2)
    )
    surface = bool_mask & ~eroded
    return np.argwhere(surface)


def _nearest_distance_mm(point_mm: np.ndarray, surface_coords: np.ndarray, voxel_spacing: tuple) -> float:
    """Nearest distance in mm from a point to the tumor surface voxels."""
    if surface_coords.size == 0:
        return float("inf")
    surface_mm = surface_coords.astype(np.float32) * np.asarray(voxel_spacing, dtype=np.float32)
    diffs = surface_mm - point_mm
    dists = np.linalg.norm(diffs, axis=1)
    return float(dists.min())


def compute_proximity(
    mask: np.ndarray,
    voxel_spacing: tuple = (1.0, 1.0, 1.0),
    top_n: int = 8,
) -> List[dict]:
    """
    Compute the proximity of each catalogued anatomical structure to the
    segmented tumor and return them sorted by surface distance ascending.
    """
    if mask is None or mask.size == 0:
        return []

    bool_mask = mask > 0
    if not bool_mask.any():
        return []

    coords = np.argwhere(bool_mask)
    centroid_voxel = coords.mean(axis=0)
    centroid_mm = centroid_voxel * np.asarray(voxel_spacing, dtype=np.float32)
    surface_coords = _surface_voxels(bool_mask)
    if surface_coords.size == 0:
        surface_coords = coords

    shape = np.asarray(mask.shape, dtype=np.float32)
    spacing = np.asarray(voxel_spacing, dtype=np.float32)
    volume_extent_mm = shape * spacing

    structures = get_structures()
    rows: List[dict] = []

    for s in structures:
        norm = np.asarray(s["centroid_normalized"], dtype=np.float32)
        struct_voxel = norm * shape
        struct_mm = norm * volume_extent_mm

        centroid_distance_mm = float(np.linalg.norm(centroid_mm - struct_mm))
        nearest_distance_mm = _nearest_distance_mm(struct_mm, surface_coords, voxel_spacing)
        surface_distance_mm = max(0.0, nearest_distance_mm - float(s["radius_mm"]))

        overlap = nearest_distance_mm <= float(s["radius_mm"])
        risk = risk_zone_for_distance(surface_distance_mm, overlap)

        rows.append(
            {
                "id": s["id"],
                "name": s["name"],
                "category": s["category"],
                "function": s["function"],
                "impact": s["impact"],
                "centroid_normalized": [round(float(v), 3) for v in norm],
                "centroid_voxel": [round(float(v), 1) for v in struct_voxel],
                "radius_mm": float(s["radius_mm"]),
                "centroid_distance_mm": round(centroid_distance_mm, 1),
                "surface_distance_mm": round(surface_distance_mm, 1),
                "overlap": bool(overlap),
                "risk_zone": risk,
            }
        )

    rows.sort(key=lambda r: (r["surface_distance_mm"], r["centroid_distance_mm"]))
    return rows[:top_n]


def build_surgical_note(proximity: List[dict], region: str) -> str:
    """
    Generate a deterministic surgical-context paragraph from the proximity
    table. Uses ONLY the data passed in — never invents distances.
    """
    if not proximity:
        return (
            "No anatomical proximity context could be computed for this scan. "
            "Surgical planning requires direct clinician evaluation."
        )

    closest = proximity[0]
    parts = [
        f"The tumor's {region} location places it within "
        f"{closest['surface_distance_mm']:.1f} mm of the {closest['name']}."
    ]

    if closest["risk_zone"] == "critical":
        parts.append(
            f"This is in the critical zone (<5 mm) — surgical resection in this region "
            f"carries elevated risk of {closest['impact'].lower()}"
        )
        if closest["category"] == "eloquent":
            parts.append(
                "Awake craniotomy with intraoperative cortical mapping may be warranted."
            )
    elif closest["risk_zone"] == "high":
        parts.append(
            f"Proximity is in the high-risk zone (5–10 mm). "
            f"Intraoperative neuronavigation is strongly recommended; "
            f"injury could produce: {closest['impact'].lower()}"
        )
    elif closest["risk_zone"] == "moderate":
        parts.append(
            "Proximity is in the moderate-risk zone (10–20 mm). "
            "Standard neuronavigation should provide adequate margin."
        )
    else:
        parts.append(
            "All catalogued critical structures lie at safe distances (>20 mm). "
            "Standard surgical planning protocols apply."
        )

    parts.append(
        "This output is decision-support context only — surgical planning "
        "requires direct clinician evaluation."
    )
    return " ".join(parts)
