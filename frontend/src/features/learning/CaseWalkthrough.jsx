import { useMemo, useState } from "react";
import FirstImpressionQuiz from "./quizzes/FirstImpressionQuiz";
import ModalitySelectQuiz from "./quizzes/ModalitySelectQuiz";
import LocalizationQuiz from "./quizzes/LocalizationQuiz";
import CompareAnswerQuiz from "./quizzes/CompareAnswerQuiz";
import { useProgress } from "./ProgressContext";

const STAGES = ["history", "first_impression", "modality", "localization", "compare", "summary"];

function quizFor(question, props) {
  switch (question.type) {
    case "first_impression":
      return <FirstImpressionQuiz question={question} {...props} />;
    case "modality":
      return <ModalitySelectQuiz question={question} {...props} />;
    case "localization":
      return <LocalizationQuiz question={question} {...props} />;
    default:
      return null;
  }
}

export default function CaseWalkthrough({ caseData, onClose }) {
  const { recordCompletion } = useProgress();
  const [stageIndex, setStageIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [compareScore, setCompareScore] = useState(null);

  const stage = STAGES[stageIndex];
  const goNext = () => setStageIndex((i) => Math.min(STAGES.length - 1, i + 1));

  const quizQuestions = useMemo(() => {
    const map = {};
    for (const q of caseData.quiz || []) map[q.type] = q;
    return map;
  }, [caseData]);

  const onAnswer = (qid) => ({ correct, picked }) => {
    setAnswers((prev) => [...prev, { qid, correct, picked }]);
    setTimeout(goNext, 800);
  };

  const onCompare = ({ correct, picked, dice }) => {
    setCompareScore(dice);
    setAnswers((prev) => {
      const next = [...prev, { qid: "compare", correct, picked, dice }];
      const score = aggregateScore(next);
      recordCompletion(caseData.id, score);
      return next;
    });
    setTimeout(goNext, 800);
  };

  return (
    <div className="lc-walkthrough">
      <header className="lc-walk-header">
        <div>
          <div className="lc-walk-id">{caseData.id} · {caseData.difficulty}</div>
          <div className="lc-walk-title">{caseData.title}</div>
        </div>
        <div className="lc-walk-progress">
          Step {stageIndex + 1} / {STAGES.length}
        </div>
        <button type="button" className="rp-close" onClick={onClose}>×</button>
      </header>

      <div className="lc-walk-body">
        {stage === "history" && (
          <div className="lc-history">
            <h3>Patient History</h3>
            <p><strong>{caseData.patient.age}{caseData.patient.sex === "female" ? "F" : "M"}</strong> · {caseData.patient.presenting_complaint}</p>
            <p><strong>Past medical history:</strong> {caseData.patient.history}</p>
            <p><strong>Exam:</strong> {caseData.patient.exam}</p>
            <button type="button" className="dra-btn dra-btn-validate" onClick={goNext}>
              Build hypothesis →
            </button>
          </div>
        )}

        {stage === "first_impression" && quizQuestions.first_impression && (
          quizFor(quizQuestions.first_impression, { onAnswer: onAnswer("q1") })
        )}

        {stage === "modality" && quizQuestions.modality && (
          quizFor(quizQuestions.modality, { onAnswer: onAnswer("q2") })
        )}

        {stage === "localization" && quizQuestions.localization && (
          <>
            <div className="lc-modality-reveal">
              <div className="lc-modality-tag">Imaging revealed</div>
              <p>{caseData.imaging.modality_notes}</p>
            </div>
            {quizFor(quizQuestions.localization, { onAnswer: onAnswer("q3") })}
          </>
        )}

        {stage === "compare" && (
          <CompareAnswerQuiz
            groundTruthRegion={caseData.ground_truth.region}
            onAnswer={onCompare}
          />
        )}

        {stage === "summary" && (
          <div className="lc-summary">
            <h3>Summary</h3>
            <ul className="lc-summary-stats">
              <li>Correct answers: {answers.filter((a) => a.correct).length} / {answers.length}</li>
              {compareScore != null && (
                <li>Localization Dice: {(compareScore * 100).toFixed(0)}%</li>
              )}
            </ul>
            <h4>Teaching points</h4>
            <ul className="lc-teaching">
              {(caseData.teaching_points || []).map((p, i) => <li key={i}>{p}</li>)}
            </ul>
            <button type="button" className="dra-btn dra-btn-validate" onClick={onClose}>
              Back to library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function aggregateScore(answers) {
  if (!answers.length) return 0;
  const correct = answers.filter((a) => a.correct).length / answers.length;
  const dice = answers.find((a) => a.qid === "compare")?.dice;
  if (dice != null) return Math.min(1, 0.7 * correct + 0.3 * dice);
  return correct;
}
