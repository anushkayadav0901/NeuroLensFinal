import useReveal from "./useReveal";
import logoImg from "../../components/logo.png";

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
            NeuroLens isn&apos;t trying to replace clinicians — it&apos;s trying to take 80% of
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
          <div className="li-pillar-head">
            <span className="li-pillar-head-spacer" />
            <span className="li-pillar-head-label">Today</span>
            <span className="li-pillar-head-logo">
              <img src={logoImg} alt="NeuroLens" className="li-pillar-product-logo" />
            </span>
          </div>

          <div className="li-pillar-dual">
            <span className="li-pillar-metric-label">Measurement burden</span>
            <div className="li-pillar-bar">
              <div
                className="li-pillar-fill"
                style={{ ["--w"]: "78%", background: "#64748b" }}
              />
            </div>
            <div className="li-pillar-bar">
              <div
                className="li-pillar-fill"
                style={{ ["--w"]: "22%", background: "#2dd4bf" }}
              />
            </div>
            <span className="li-pillar-val">78% vs 22%</span>
          </div>

          <div className="li-pillar-dual">
            <span className="li-pillar-metric-label">Reasoning headroom</span>
            <div className="li-pillar-bar">
              <div
                className="li-pillar-fill"
                style={{ ["--w"]: "22%", background: "#64748b" }}
              />
            </div>
            <div className="li-pillar-bar">
              <div
                className="li-pillar-fill"
                style={{ ["--w"]: "81%", background: "#22c55e" }}
              />
            </div>
            <span className="li-pillar-val">22% vs 81%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
