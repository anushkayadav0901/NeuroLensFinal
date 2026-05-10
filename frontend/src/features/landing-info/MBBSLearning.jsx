import useReveal from "./useReveal";

const FEATURES = [
  {
    title: "Real cases. Real anatomy.",
    body: "15 anonymized BraTS-style cases with structured patient histories you'd actually see on rounds.",
  },
  {
    title: "Progressive quizzes",
    body: "History → first-pass impression → modality reveal → final localization. Only the next correct answer unlocks the next reveal.",
  },
  {
    title: "Spaced repetition",
    body: "Missed concepts come back at 3 and 14 days. XP, badges and a streak counter keep momentum without infantilizing the learner.",
  },
  {
    title: "Compare your answer",
    body: "Drop a freehand mask on the slice viewer and see your Dice score against the ground-truth mask.",
  },
];

export default function MBBSLearning() {
  const [ref, revealed] = useReveal();
  return (
    <section ref={ref} className={`li-section li-learning ${revealed ? "li-revealed" : ""}`}>
      <div className="li-inner">
        <div className="li-eyebrow">Learning Mode (MBBS / radiology residents)</div>
        <h2 className="li-title">Practice on real scans, not flashcards.</h2>
        <p className="li-lede">
          The same engine that powers the clinical workflow doubles as a teaching
          tool. Cases play like consults, not multiple-choice — start with the
          history, build a hypothesis, and reveal the imaging only when you're
          ready to commit.
        </p>
        <div className="li-grid-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="li-feature-card">
              <div className="li-feature-title">{f.title}</div>
              <div className="li-feature-body">{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
