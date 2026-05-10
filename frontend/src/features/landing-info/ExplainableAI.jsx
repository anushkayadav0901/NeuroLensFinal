import useReveal from "./useReveal";

const SAMPLE = {
  primary_finding: "Right temporal lobe — Moderate risk",
  supporting_observations: [
    "Tumor volume measured at 12.4 cm³.",
    "Midline distance: 18 mm.",
    "Margins moderately irregular.",
  ],
  validations: [
    "Segmentation post-processed (largest connected component).",
    "Voxel-volume conversion applied with reported voxel spacing.",
    "Region mapped via normalized centroid to region atlas.",
    "Anatomical proximity computed against critical-structure atlas.",
  ],
  confidence: { segmentation: "high (3D U-Net)", classification: "moderate" },
};

export default function ExplainableAI() {
  const [ref, revealed] = useReveal();
  return (
    <section ref={ref} className={`li-section li-explainable ${revealed ? "li-revealed" : ""}`}>
      <div className="li-inner li-grid-2">
        <div>
          <div className="li-eyebrow">Explainable AI</div>
          <h2 className="li-title">Every AI claim shows its work.</h2>
          <p className="li-lede">
            NeuroLens never ships a free-form chat blob. The on-screen "AI Finding"
            block forces structure: a primary finding, the supporting observations
            that produced it, the validations that ran, and the limitations the
            clinician should keep in mind.
          </p>
          <p className="li-lede li-muted">
            The doctor can validate, flag, or annotate any block. Only validated
            blocks ever reach the PDF.
          </p>
        </div>

        <article className="li-vb-mock">
          <div className="li-vb-tag">Sample AI Finding</div>
          <div className="li-vb-summary">
            Right temporal lobe lesion, moderate risk. Volume 12.4 cm³ with
            preserved midline distance — safe distance from motor cortex.
          </div>
          <div className="li-vb-block">
            <div className="li-vb-block-title">● Primary Finding</div>
            <div className="li-vb-block-body">{SAMPLE.primary_finding}</div>
          </div>
          <div className="li-vb-block">
            <div className="li-vb-block-title">◇ Supporting Observations</div>
            <ul>
              {SAMPLE.supporting_observations.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
          <div className="li-vb-block">
            <div className="li-vb-block-title">✓ Validations performed</div>
            <ul className="li-vb-checks">
              {SAMPLE.validations.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </div>
          <div className="li-vb-block li-vb-confidence">
            <div>
              <div className="li-vb-key">Segmentation</div>
              <div className="li-vb-val">{SAMPLE.confidence.segmentation}</div>
            </div>
            <div>
              <div className="li-vb-key">Classification</div>
              <div className="li-vb-val">{SAMPLE.confidence.classification}</div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
