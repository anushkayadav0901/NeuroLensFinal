"""
heatmap.py (routes)
-------------------
Returns Grad-CAM-style attention heatmaps for the active analysis.
"""

from fastapi import APIRouter, HTTPException, Response

from app.services.heatmap import render_heatmap_png
from app.services.slice_server import (
    get_base_volume_for,
    get_heatmap_volume,
    get_reasoning_summary,
)

router = APIRouter()


@router.get("/heatmap/{axis}/{index}")
async def heatmap_slice(
    axis: str,
    index: int,
    modality: str = "flair",
    opacity: float = 0.6,
    palette: str = "viridis",
):
    if axis not in ("axial", "coronal", "sagittal"):
        raise HTTPException(status_code=400, detail="axis must be axial, coronal, or sagittal")

    heatmap = get_heatmap_volume(modality)
    if heatmap is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "No heatmap data for the requested modality. Run an analysis first or "
                "request a different modality."
            ),
        )
    base = get_base_volume_for(modality)
    if base is None:
        raise HTTPException(status_code=404, detail="No analyzed volume available.")

    try:
        png = render_heatmap_png(
            heatmap=heatmap,
            base_volume=base,
            axis=axis,
            index=index,
            opacity=max(0.0, min(1.0, float(opacity))),
            palette=palette if palette in ("viridis", "inferno") else "viridis",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except IndexError:
        raise HTTPException(status_code=400, detail=f"Slice index {index} out of range for axis '{axis}'.")
    return Response(content=png, media_type="image/png")


@router.get("/heatmap-reasoning")
async def heatmap_reasoning():
    summary = get_reasoning_summary()
    if summary is None:
        raise HTTPException(status_code=404, detail="No reasoning summary available — run an analysis first.")
    return summary
