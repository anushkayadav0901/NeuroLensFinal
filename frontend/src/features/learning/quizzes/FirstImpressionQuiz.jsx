import MultipleChoiceQuiz from "./MultipleChoiceQuiz";

export default function FirstImpressionQuiz(props) {
  return (
    <div>
      <div className="lq-stage-tag">First Impression — based only on the history</div>
      <MultipleChoiceQuiz {...props} />
    </div>
  );
}
