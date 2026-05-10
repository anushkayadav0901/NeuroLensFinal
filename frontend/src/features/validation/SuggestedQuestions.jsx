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
  return (
    <div className="sq-root">
      <div className="sq-label">Suggested questions</div>
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
  );
}
