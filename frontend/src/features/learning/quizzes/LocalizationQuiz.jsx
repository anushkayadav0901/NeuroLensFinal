import MultipleChoiceQuiz from "./MultipleChoiceQuiz";

export default function LocalizationQuiz(props) {
  return (
    <div>
      <div className="lq-stage-tag">Localization — where is the lesion?</div>
      <MultipleChoiceQuiz {...props} />
    </div>
  );
}
