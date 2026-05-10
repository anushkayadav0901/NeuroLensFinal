import useReveal from "./useReveal";

const POINTS = [
  "AI does the pixel-level grunt work — segmentation, volumes, asymmetry — in seconds.",
  "Doctors stay in the driver's seat: every AI finding requires explicit clinician validation before it enters a report.",
  "Patients see a calm, plain-language version of the same evidence so they can ask better questions.",
];

export default function CognitiveLoadSection() {
  const [ref, revealed] = useReveal();
  return (
    <section ref={ref} className={`li-section li-cognitive ${revealed ? "li-revealed" : ""}`}>
      <div className="li-inner li-grid-2">
        <div>
          <div className="li-eyebrow">Cognitive load, redistributed</div>
          <h2 className="li-title">Free up the radiologist's mind for the part only humans should do.</h2>
          <p className="li-lede">
            NeuroLens isn't trying to replace clinicians — it's trying to take 80% of
            the rote measurement work off their plate so the remaining 20% (the
            judgment) gets the attention it deserves.
          </p>
          <ul className="li-list">
            {POINTS.map((p, i) => (
              <li key={i}>
                <span className="li-bullet" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="li-pillar">
          <div className="li-pillar-row">
            <div className="li-pillar-label">Today</div>
            <div className="li-pillar-bar">
              <div className="li-pillar-fill" style={{ width: "78%", background: "#94A3B8" }} />
            </div>
            <div className="li-pillar-val">78% measurement</div>
          </div>
          <div className="li-pillar-row">
            <div className="li-pillar-label">With NeuroLens</div>
            <div className="li-pillar-bar">
              <div className="li-pillar-fill" style={{ width: "22%", background: "#0EA5E9" }} />
            </div>
            <div className="li-pillar-val">22% measurement</div>
          </div>
          <div className="li-pillar-row">
            <div className="li-pillar-label">Today</div>
            <div className="li-pillar-bar">
              <div className="li-pillar-fill" style={{ width: "22%", background: "#94A3B8" }} />
            </div>
            <div className="li-pillar-val">22% reasoning</div>
          </div>
          <div className="li-pillar-row">
            <div className="li-pillar-label">With NeuroLens</div>
            <div className="li-pillar-bar">
              <div className="li-pillar-fill" style={{ width: "78%", background: "#22C55E" }} />
            </div>
            <div className="li-pillar-val">78% reasoning</div>
          </div>
        </div>
      </div>
    </section>
  );
}
