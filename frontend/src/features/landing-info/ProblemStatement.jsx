import useReveal from "./useReveal";

const PROBLEMS = [
  {
    icon: "⏱",
    stat: "20–40 min",
    body: "average per MRI for manual interpretation, slowing throughput in busy radiology departments.",
  },
  {
    icon: "❍",
    stat: "10–15%",
    body: "of subtle findings are missed under cognitive load and time pressure.",
  },
  {
    icon: "✕",
    stat: "0%",
    body: "of patients ever see what their actual scan looks like — only worded reports.",
  },
];

export default function ProblemStatement() {
  const [ref, revealed] = useReveal();
  return (
    <section ref={ref} className={`li-section ${revealed ? "li-revealed" : ""}`}>
      <div className="li-inner">
        <div className="li-eyebrow">The problem</div>
        <h2 className="li-title">Brain MRIs are slow, dense, and opaque.</h2>
        <p className="li-lede">
          Modern MRI captures millions of voxels of detail. The bottleneck isn't the
          scanner — it's the time and clarity required to interpret what it produces
          and explain it to the people who matter most.
        </p>
        <div className="li-stat-grid">
          {PROBLEMS.map((p) => (
            <div key={p.stat} className="li-stat-card">
              <div className="li-stat-icon">{p.icon}</div>
              <div className="li-stat-num">{p.stat}</div>
              <div className="li-stat-body">{p.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
