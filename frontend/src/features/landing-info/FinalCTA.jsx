import { useNavigate } from "react-router-dom";
import useReveal from "./useReveal";

export default function FinalCTA() {
  const navigate = useNavigate();
  const [ref, revealed] = useReveal();
  return (
    <section ref={ref} className={`li-section li-cta ${revealed ? "li-revealed" : ""}`}>
      <div className="li-inner li-cta-inner">
        <div className="li-eyebrow">Pick your view</div>
        <h2 className="li-title">Three ways into NeuroLens.</h2>
        <p className="li-lede">
          Each entry point is built for the questions a different audience needs to
          answer. Pick the one that matches your job today.
        </p>

        <div className="li-cta-grid">
          <button type="button" className="li-cta-card" onClick={() => navigate("/doctor")}>
            <div className="li-cta-card-title">Doctor View</div>
            <div className="li-cta-card-body">
              Upload a scan, run analysis, validate AI findings, generate the PDF.
            </div>
            <span className="li-cta-card-go">Open →</span>
          </button>
          <button type="button" className="li-cta-card" onClick={() => navigate("/patient")}>
            <div className="li-cta-card-title">Patient View</div>
            <div className="li-cta-card-body">
              Plain-language explanation of an analyzed scan with a calm 3D
              visualization.
            </div>
            <span className="li-cta-card-go">Open →</span>
          </button>
          <button type="button" className="li-cta-card" onClick={() => navigate("/learn")}>
            <div className="li-cta-card-title">Learning Mode</div>
            <div className="li-cta-card-body">
              Real BraTS-style cases with progressive quizzes, spaced repetition,
              and Dice scoring against the ground truth.
            </div>
            <span className="li-cta-card-go">Open →</span>
          </button>
        </div>

        <p className="li-disclaimer">
          NeuroLens is a research and education prototype for decision support.
          It is not a medical device and does not replace clinical judgment.
        </p>
      </div>
    </section>
  );
}
