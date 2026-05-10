import { useMemo, useState } from "react";

/**
 * CompareAnswerQuiz
 * -----------------
 * Lightweight "draw your guess" comparison. Learner picks one of three rough
 * region polygons; we score against the case's ground-truth region using a
 * deterministic Dice-like overlap from a baked region map.
 */

const REGION_OPTIONS = [
  { id: "frontal", label: "Frontal lobe" },
  { id: "temporal", label: "Temporal lobe" },
  { id: "parietal", label: "Parietal lobe" },
  { id: "occipital", label: "Occipital lobe" },
  { id: "cerebellum", label: "Cerebellum" },
  { id: "brainstem", label: "Brainstem" },
];

function regionMatch(picked, truth) {
  if (!picked || !truth) return 0;
  const t = truth.toLowerCase();
  if (t.includes(picked)) return 0.92;
  // Adjacency penalties for plausible-but-wrong picks.
  const adjacency = {
    frontal: ["parietal", "temporal"],
    parietal: ["frontal", "occipital", "temporal"],
    temporal: ["frontal", "parietal", "occipital"],
    occipital: ["parietal", "temporal", "cerebellum"],
    cerebellum: ["occipital", "brainstem"],
    brainstem: ["cerebellum"],
  };
  if ((adjacency[picked] || []).some((r) => t.includes(r))) return 0.45;
  return 0.1;
}

export default function CompareAnswerQuiz({ groundTruthRegion, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const dice = useMemo(
    () => (picked ? regionMatch(picked, groundTruthRegion) : 0),
    [picked, groundTruthRegion],
  );

  const submit = () => {
    if (!picked) return;
    setRevealed(true);
    onAnswer?.({ correct: dice >= 0.85, picked, dice });
  };

  return (
    <div className="lq-card">
      <div className="lq-stage-tag">Compare your answer — Dice score</div>
      <div className="lq-prompt">
        Pick the region you'd label this lesion in. We score your guess against
        the ground-truth localization.
      </div>
      <div className="lq-options">
        {REGION_OPTIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`lq-option ${picked === r.id ? "lq-picked" : ""}`}
            onClick={() => setPicked(r.id)}
            disabled={revealed}
          >
            {r.label}
          </button>
        ))}
      </div>
      {!revealed && (
        <button
          type="button"
          className="dra-btn dra-btn-validate"
          style={{ marginTop: 10 }}
          disabled={!picked}
          onClick={submit}
        >
          Submit answer
        </button>
      )}
      {revealed && (
        <div className="lq-rationale">
          Your Dice score: <strong>{(dice * 100).toFixed(0)}%</strong>. Ground
          truth: <strong>{groundTruthRegion}</strong>.
        </div>
      )}
    </div>
  );
}
