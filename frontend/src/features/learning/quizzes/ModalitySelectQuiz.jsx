import MultipleChoiceQuiz from "./MultipleChoiceQuiz";

export default function ModalitySelectQuiz(props) {
  return (
    <div>
      <div className="lq-stage-tag">Modality choice — what reveals the most?</div>
      <MultipleChoiceQuiz {...props} />
    </div>
  );
}
