import useReveal from "./useReveal";

const BEFORE = [
  "30+ minutes scrolling through 2D slices.",
  "Manually measuring tumor with electronic calipers.",
  "Mentally translating numbers into a worded report.",
  "Patients leave with a paragraph they can't picture.",
];

const AFTER = [
  "Volume, dimensions, and asymmetry computed automatically.",
  "Anatomical proximity mapped against a critical-structure atlas.",
  "Validated AI findings dropped straight into a one-click PDF.",
  "Patients see a calm 3D visualization with plain-language context.",
];

export default function BeforeAfter() {
  const [ref, revealed] = useReveal();
  return (
    <section ref={ref} className={`li-section li-before-after ${revealed ? "li-revealed" : ""}`}>
      <div className="li-inner">
        <div className="li-eyebrow">Before / after</div>
        <h2 className="li-title">Same scan. Very different workflow.</h2>
        <div className="li-grid-2">
          <div className="li-card li-card-before">
            <div className="li-card-tag">Today</div>
            <ul className="li-list">
              {BEFORE.map((t, i) => (
                <li key={i}>
                  <span className="li-bullet li-bullet-warn" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="li-card li-card-after">
            <div className="li-card-tag">With NeuroLens</div>
            <ul className="li-list">
              {AFTER.map((t, i) => (
                <li key={i}>
                  <span className="li-bullet li-bullet-good" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
