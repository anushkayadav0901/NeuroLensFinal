import { OUT_OF_SCOPE_MESSAGE } from "../../services/aiValidator";

function Section({ icon, title, children }) {
  return (
    <div className="vb-section">
      <div className="vb-section-head">
        <span className="vb-section-icon">{icon}</span>
        <span className="vb-section-title">{title}</span>
      </div>
      <div className="vb-section-body">{children}</div>
    </div>
  );
}

export default function ValidationBlock({ payload }) {
  if (!payload) return null;

  if (payload.status === "out_of_scope") {
    return (
      <div className="vb-out-of-scope">
        <span className="vb-oos-tag">Out of scope</span>
        <p>{payload.out_of_scope_message || OUT_OF_SCOPE_MESSAGE}</p>
      </div>
    );
  }

  const obs = payload.supporting_observations || [];
  const vals = payload.validations || [];
  const ctx = payload.anatomical_context || [];
  const limits = payload.limitations || [];
  const conf = payload.confidence || {};

  return (
    <div className="vb-root">
      {payload.answer_summary && (
        <div className="vb-summary">{payload.answer_summary}</div>
      )}

      <Section icon="●" title="Primary Finding">
        <div className="vb-primary">{payload.primary_finding || "—"}</div>
      </Section>

      {obs.length > 0 && (
        <Section icon="◇" title="Supporting Observations">
          <ul className="vb-list">
            {obs.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </Section>
      )}

      {vals.length > 0 && (
        <Section icon="✓" title="Internal Validations Performed">
          <ul className="vb-list vb-list-checks">
            {vals.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </Section>
      )}

      {ctx.length > 0 && (
        <Section icon="◎" title="Anatomical Context">
          <ul className="vb-list">
            {ctx.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Section>
      )}

      {(conf.segmentation || conf.classification) && (
        <Section icon="▲" title="Confidence">
          <div className="vb-confidence-row">
            <span className="vb-conf-key">Segmentation</span>
            <span className="vb-conf-val">{conf.segmentation || "n/a"}</span>
          </div>
          <div className="vb-confidence-row">
            <span className="vb-conf-key">Classification</span>
            <span className="vb-conf-val">{conf.classification || "n/a"}</span>
          </div>
        </Section>
      )}

      {limits.length > 0 && (
        <Section icon="!" title="Limitations & Caveats">
          <ul className="vb-list vb-list-limits">
            {limits.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
