import { useState } from "react";

export default function MultipleChoiceQuiz({ question, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handlePick = (opt) => {
    if (revealed) return;
    setPicked(opt);
    setRevealed(true);
    const correct = opt === question.answer;
    onAnswer?.({ correct, picked: opt });
  };

  return (
    <div className="lq-card">
      <div className="lq-prompt">{question.prompt}</div>
      <div className="lq-options">
        {question.options.map((opt) => {
          const isCorrect = revealed && opt === question.answer;
          const isWrong = revealed && opt === picked && opt !== question.answer;
          return (
            <button
              key={opt}
              type="button"
              className={`lq-option ${isCorrect ? "lq-correct" : ""} ${isWrong ? "lq-wrong" : ""}`}
              onClick={() => handlePick(opt)}
              disabled={revealed}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && question.rationale && (
        <div className="lq-rationale">
          <strong>{picked === question.answer ? "Correct." : "Not quite."}</strong>{" "}
          {question.rationale}
        </div>
      )}
    </div>
  );
}
