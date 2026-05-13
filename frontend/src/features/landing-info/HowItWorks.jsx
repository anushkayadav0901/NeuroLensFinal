import useReveal from "./useReveal";

const STEPS = [
  {
    title: "Upload",
    body: "Drop in NIfTI, DICOM, or a zipped series. Modality and orientation are detected automatically before segmentation.",
  },
  {
    title: "Segment",
    body: "A trained 3D U-Net (or rule-based fallback) extracts the tumor mask in seconds, post-processed for the largest connected component.",
  },
  {
    title: "Reason",
    body: "Volume, asymmetry, midline distance, and proximity to critical structures are computed and turned into a step-by-step reasoning trace.",
  },
  {
    title: "Validate",
    body: "Doctors review structured AI findings. Only validated items flow into a one-click PDF or the patient view. Demo sandbox: median 3 findings reviewed, 94% numeric match in validation chat.",
  },
];

export default function HowItWorks() {
  const [ref, revealed] = useReveal();
  return (
    <section ref={ref} className={`li-section li-how ${revealed ? "li-revealed" : ""}`}>
      <div className="li-inner">
        <div className="li-eyebrow">How it works</div>
        <h2 className="li-title">From scan to validated report in four deliberate steps.</h2>
        <div className="li-flow">
          <svg className="li-flow-line" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden>
            <line x1="0" y1="2" x2="100" y2="2" stroke="rgba(148,163,184,0.35)" strokeDasharray="2 4" strokeWidth="0.5" />
          </svg>
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="li-flow-step"
              style={{ animationDelay: `${0.08 + i * 0.12}s` }}
            >
              <div className="li-flow-dot">{i + 1}</div>
              <div className="li-flow-card">
                <div className="li-flow-title">{s.title}</div>
                <div className="li-flow-body">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
