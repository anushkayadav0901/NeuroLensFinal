"""
learning.py
-----------
Lightweight catalogue endpoint for Learning Mode. Returns the list of
BraTS cases that have local data on disk so the frontend can deep-link
into the existing /api/analyze flow if a learner requests "load this
case into the viewer".
"""

from __future__ import annotations

from fastapi import APIRouter

from app.services.brats_loader import list_brats_cases

router = APIRouter()


@router.get("/learning/cases")
async def list_cases():
    cases = list_brats_cases()
    return {
        "count": len(cases),
        "cases": cases,
    }
