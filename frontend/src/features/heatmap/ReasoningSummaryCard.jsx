export default function ReasoningSummaryCard({ reasoning }) {
  if (!reasoning) return null;
  const {
    primary_driver,
    secondary_signal,
    asymmetry_pct,
    boundary_discontinuity_pct,
    final_confidence,
  } = reasoning;

  return (
    <div className="hm-summary-card">
      <div className="hm-summary-label">AI Reasoning Trace</div>
      <ul className="hm-summary-list">
        <li>
          <span className="hm-key">Primary driver</span>
          <span className="hm-val">{primary_driver || "—"}</span>
        </li>
        <li>
          <span className="hm-key">Secondary signal</span>
          <span className="hm-val">{secondary_signal || "—"}</span>
        </li>
        <li>
          <span className="hm-key">Asymmetry</span>
          <span className="hm-val">
            {asymmetry_pct != null ? `${asymmetry_pct.toFixed(1)}%` : "—"}
          </span>
        </li>
        <li>
          <span className="hm-key">Boundary discontinuity</span>
          <span className="hm-val">
            {boundary_discontinuity_pct != null
              ? `${boundary_discontinuity_pct.toFixed(1)}%`
              : "—"}
          </span>
        </li>
        <li>
          <span className="hm-key">Final confidence</span>
          <span className="hm-val hm-conf">
            {final_confidence != null
              ? `${(final_confidence * 100).toFixed(0)}%`
              : "—"}
          </span>
        </li>
      </ul>
      <p className="hm-summary-caveat">
        Heatmap is derived from observable signals (mask, asymmetry, boundary,
        modality intensity). Synthesized for explainability — not a live model
        Grad-CAM. Always interpret with the original imaging.
      </p>
    </div>
  );
}
