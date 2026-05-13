import { useState } from "react";

const SUGGESTIONS = [
  "Why was this region flagged?",
  "What modality contributed most?",
  "What validations were performed?",
  "What is the confidence level?",
  "Which structures are at risk?",
  "Could this be a false positive?",
  "Summarize the reasoning chain",
];

export default function SuggestedQuestions({ onPick, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`sq-root ${open ? "sq-open" : "sq-collapsed"}`}>
      <button
        type="button"
        className="sq-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>Suggested prompts</span>
        <span className="sq-chevron">{open ? "▾" : "▸"}</span>
        <span className="sq-count">{SUGGESTIONS.length}</span>
      </button>
      {open && (
        <div className="sq-panel">
          <div className="sq-chips">
            {SUGGESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                className="sq-chip"
                disabled={disabled}
                onClick={() => onPick?.(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
