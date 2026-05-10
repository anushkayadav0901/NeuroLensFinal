"""
anatomical_atlas.py
-------------------
Bundled reference of critical brain structures for the Risk Radar feature.

Each structure carries a normalized centroid in [0, 1]^3 over the analyzed
volume (axes are (axial, coronal, sagittal) to match numpy/MRI conventions),
an approximate radius in mm, and a plain-language functional impact note.

These are coarse approximations meant to drive proximity warnings — they are
NOT a substitute for radiologist-level neuronavigation. Coordinates were
chosen so the structures sit roughly where one would expect in a normalized
brain volume; they are NOT registered MNI coordinates.
"""

from __future__ import annotations

# Coordinate convention:
#   axial  -> 0.0 superior (top of head)   .. 1.0 inferior (base)
#   coronal-> 0.0 anterior (forehead)      .. 1.0 posterior (back of head)
#   sagit. -> 0.0 left hemisphere          .. 1.0 right hemisphere
#
# These match the orientation used in metrics.py:
#   centroid_normalized[0] -> axial   (superior/inferior)
#   centroid_normalized[1] -> coronal (anterior/posterior)
#   centroid_normalized[2] -> sagittal(left/right; midline at 0.5)
ANATOMICAL_STRUCTURES = [
    {
        "id": "motor_cortex_l",
        "name": "Motor Cortex (Left)",
        "centroid_normalized": (0.30, 0.40, 0.32),
        "radius_mm": 14.0,
        "function": "Voluntary motor control of the right side of the body.",
        "impact": "Damage may cause right-sided motor weakness or paralysis.",
        "category": "eloquent",
    },
    {
        "id": "motor_cortex_r",
        "name": "Motor Cortex (Right)",
        "centroid_normalized": (0.30, 0.40, 0.68),
        "radius_mm": 14.0,
        "function": "Voluntary motor control of the left side of the body.",
        "impact": "Damage may cause left-sided motor weakness or paralysis.",
        "category": "eloquent",
    },
    {
        "id": "broca",
        "name": "Broca's Area",
        "centroid_normalized": (0.45, 0.30, 0.30),
        "radius_mm": 10.0,
        "function": "Speech production and expressive language.",
        "impact": "Damage may cause expressive aphasia (difficulty producing speech).",
        "category": "eloquent",
    },
    {
        "id": "wernicke",
        "name": "Wernicke's Area",
        "centroid_normalized": (0.50, 0.62, 0.30),
        "radius_mm": 11.0,
        "function": "Language comprehension and auditory processing.",
        "impact": "Damage may cause receptive aphasia (impaired comprehension).",
        "category": "eloquent",
    },
    {
        "id": "visual_cortex",
        "name": "Visual Cortex",
        "centroid_normalized": (0.55, 0.90, 0.50),
        "radius_mm": 16.0,
        "function": "Primary visual processing (occipital lobe).",
        "impact": "Damage may cause visual field defects or cortical blindness.",
        "category": "eloquent",
    },
    {
        "id": "optic_chiasm",
        "name": "Optic Chiasm",
        "centroid_normalized": (0.65, 0.45, 0.50),
        "radius_mm": 5.0,
        "function": "Crossing point of optic nerves.",
        "impact": "Damage may cause bitemporal hemianopia (loss of peripheral vision).",
        "category": "critical",
    },
    {
        "id": "brainstem",
        "name": "Brainstem",
        "centroid_normalized": (0.78, 0.60, 0.50),
        "radius_mm": 13.0,
        "function": "Vital functions: breathing, heart rate, consciousness.",
        "impact": "Damage is potentially life-threatening — extreme caution required.",
        "category": "critical",
    },
    {
        "id": "thalamus_l",
        "name": "Thalamus (Left)",
        "centroid_normalized": (0.55, 0.55, 0.46),
        "radius_mm": 9.0,
        "function": "Sensory and motor relay station; consciousness modulation.",
        "impact": "Damage may cause sensory loss, contralateral hemiparesis, or coma.",
        "category": "critical",
    },
    {
        "id": "thalamus_r",
        "name": "Thalamus (Right)",
        "centroid_normalized": (0.55, 0.55, 0.54),
        "radius_mm": 9.0,
        "function": "Sensory and motor relay station; consciousness modulation.",
        "impact": "Damage may cause sensory loss, contralateral hemiparesis, or coma.",
        "category": "critical",
    },
    {
        "id": "hippocampus_l",
        "name": "Hippocampus (Left)",
        "centroid_normalized": (0.62, 0.60, 0.40),
        "radius_mm": 8.0,
        "function": "Verbal memory consolidation.",
        "impact": "Damage may cause anterograde memory deficits, especially verbal.",
        "category": "eloquent",
    },
    {
        "id": "hippocampus_r",
        "name": "Hippocampus (Right)",
        "centroid_normalized": (0.62, 0.60, 0.60),
        "radius_mm": 8.0,
        "function": "Spatial and visual memory consolidation.",
        "impact": "Damage may cause spatial memory and navigation deficits.",
        "category": "eloquent",
    },
    {
        "id": "corpus_callosum",
        "name": "Corpus Callosum",
        "centroid_normalized": (0.40, 0.50, 0.50),
        "radius_mm": 12.0,
        "function": "Inter-hemispheric communication.",
        "impact": "Damage may cause disconnection syndromes between hemispheres.",
        "category": "important",
    },
    {
        "id": "cerebellum",
        "name": "Cerebellum",
        "centroid_normalized": (0.85, 0.85, 0.50),
        "radius_mm": 22.0,
        "function": "Motor coordination, balance, and fine motor control.",
        "impact": "Damage may cause ataxia, dysmetria, and balance disturbances.",
        "category": "important",
    },
    {
        "id": "mca_l",
        "name": "Middle Cerebral Artery (Left)",
        "centroid_normalized": (0.50, 0.45, 0.30),
        "radius_mm": 6.0,
        "function": "Major vessel supplying lateral cerebral hemisphere.",
        "impact": "Vessel injury risks ischemic stroke in MCA territory.",
        "category": "vascular",
    },
]


def get_structures():
    """Return the bundled list of anatomical structures."""
    return ANATOMICAL_STRUCTURES


def risk_zone_for_distance(distance_mm: float, overlap: bool) -> str:
    """Classify proximity into risk zones used by the UI."""
    if overlap or distance_mm < 5.0:
        return "critical"
    if distance_mm < 10.0:
        return "high"
    if distance_mm < 20.0:
        return "moderate"
    return "low"
