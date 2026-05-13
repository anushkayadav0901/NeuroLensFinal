import { forwardRef } from "react";

/**
 * ReportTemplate
 * --------------
 * Print-optimized A4 layout (210mm x 297mm). The PDF generator hands this
 * subtree off to html2pdf, which photographs it at 2x scale and tiles to
 * paged PDF pages.
 *
 * Sections (9):
 *   1. Header                 (clinic / patient identity)
 *   2. Executive Summary
 *   3. Anatomical Findings
 *   4. 3D Visualization
 *   5. 2D Slice Set
 *   6. Heatmap Visualization
 *   7. Risk Radar Proximity
 *   8. Verified AI Q&A
 *   9. Clinical Reasoning + Disclaimer + Signatures
 */

const PALETTE = {
  text: "#0F172A",
  muted: "#475569",
  border: "#CBD5E1",
  accent: "#0EA5E9",
};

function Section({ title, children, breakBefore }) {
  return (
    <section
      style={{
        marginBottom: 18,
        breakBefore: breakBefore ? "page" : "auto",
        pageBreakInside: "avoid",
      }}
    >
      <h2
        style={{
          fontSize: 13,
          margin: "0 0 8px",
          color: PALETTE.text,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          borderBottom: `2px solid ${PALETTE.accent}`,
          paddingBottom: 4,
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: 11, color: PALETTE.text, lineHeight: 1.55 }}>
        {children}
      </div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 11, marginBottom: 4 }}>
      <span style={{ color: PALETTE.muted, minWidth: 110 }}>{label}</span>
      <span style={{ color: PALETTE.text, fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

function ImageCard({ src, label }) {
  if (!src) {
    return (
      <div
        style={{
          width: "100%",
          paddingTop: "75%",
          background: "#E2E8F0",
          border: `1px solid ${PALETTE.border}`,
          borderRadius: 6,
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: PALETTE.muted,
          }}
        >
          {label}: image unavailable
        </span>
      </div>
    );
  }
  return (
    <figure style={{ margin: 0, breakInside: "avoid" }}>
      <img
        src={src}
        alt={label}
        style={{
          width: "100%",
          border: `1px solid ${PALETTE.border}`,
          borderRadius: 6,
          background: "#0B1220",
        }}
      />
      <figcaption
        style={{
          fontSize: 9,
          color: PALETTE.muted,
          textAlign: "center",
          marginTop: 4,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </figcaption>
    </figure>
  );
}

const ReportTemplate = forwardRef(function ReportTemplate(props, ref) {
  const {
    metadata = {},
    summary = {},
    metrics = {},
    proximity = [],
    surgicalNote = "",
    reasoning = [],
    chatExchanges = [],
    snapshots = {},
    heatmaps = {},
    sectionToggles = {},
    heatmapReasoning = null,
  } = props;

  const visible = {
    threeD: sectionToggles.threeD !== false,
    slices: sectionToggles.slices !== false,
    heatmaps: sectionToggles.heatmaps !== false,
    radar: sectionToggles.radar !== false,
    chat: sectionToggles.chat !== false,
    reasoning: sectionToggles.reasoning !== false,
  };

  return (
    <div
      ref={ref}
      className="report-page"
      style={{
        width: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        padding: "16mm 14mm",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#FFFFFF",
        color: PALETTE.text,
      }}
    >
      {/* 1. Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: `1px solid ${PALETTE.border}`,
          paddingBottom: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: PALETTE.accent,
              letterSpacing: "0.04em",
            }}
          >
            NeuroLens
          </div>
          <div style={{ fontSize: 10, color: PALETTE.muted, marginTop: 2 }}>
            Brain MRI Intelligence — Decision Support Report
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: PALETTE.muted }}>
          <div>
            <strong style={{ color: PALETTE.text }}>Report ID:</strong> {metadata.reportId || "—"}
          </div>
          <div>
            <strong style={{ color: PALETTE.text }}>Generated:</strong>{" "}
            {metadata.generatedAt || "—"}
          </div>
          <div>
            <strong style={{ color: PALETTE.text }}>Version:</strong>{" "}
            {metadata.appVersion || "1.0.0"}
          </div>
        </div>
      </header>

      <Section title="Patient & Encounter">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <Field label="Patient ID" value={metadata.patientId} />
          <Field label="Patient Name" value={metadata.patientName} />
          <Field label="Date of Birth" value={metadata.dob} />
          <Field label="Sex" value={metadata.sex} />
          <Field label="Reviewing Clinician" value={metadata.doctorName} />
          <Field label="Institution" value={metadata.hospital} />
          <Field label="Scan Date" value={metadata.scanDate} />
          <Field label="Modality" value={metadata.modality} />
        </div>
      </Section>

      {/* 2. Executive Summary */}
      <Section title="Executive Summary">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <Field label="Region" value={summary.region} />
          <Field label="Risk Level" value={summary.risk_level} />
          <Field label="Volume" value={summary.volume} />
          <Field label="Dimensions" value={summary.dimensions} />
          <Field label="Laterality" value={summary.laterality} />
          <Field label="Depth" value={summary.depth} />
        </div>
      </Section>

      <Section title="Clinical Impression (Draft for Review)" breakBefore>
        <p style={{ margin: "0 0 8px", fontSize: 11, lineHeight: 1.55 }}>
          {[
            summary.region && `Lesion context: ${summary.region}.`,
            summary.risk_level && `Pipeline risk band: ${summary.risk_level}.`,
            metrics.tumor_volume_cm3 != null && `Estimated tumor volume ${metrics.tumor_volume_cm3} cm³.`,
            metrics.midline_distance_mm != null && `Midline distance ${metrics.midline_distance_mm} mm.`,
            surgicalNote && `Atlas proximity / planning note: ${surgicalNote}`,
          ]
            .filter(Boolean)
            .join(" ") || "Structured metrics are listed in adjacent sections; add clinician impression in notes."}
        </p>
        <p style={{ margin: 0, fontSize: 9.5, color: PALETTE.muted, fontStyle: "italic" }}>
          Auto-generated synopsis from NeuroLens metrics — must be edited or superseded by the signing clinician.
        </p>
      </Section>

      <Section title="Pre-operative Documentation Checklist">
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 10.5, lineHeight: 1.55 }}>
          <li>Image quality &amp; sequence completeness suitable for planning</li>
          <li>Neuronavigation / stereotaxis dataset export (if applicable)</li>
          <li>Molecular / pathology correlation when tissue available</li>
          <li>Multidisciplinary tumor board documentation (if institutional policy)</li>
          <li>Informed consent discussion aligned with findings below</li>
        </ul>
      </Section>
      <Section title="Anatomical Findings">
        <Field label="Tumor volume (cm³)" value={metrics.tumor_volume_cm3} />
        <Field label="Region function" value={metrics.region_function} />
        <Field label="Midline distance (mm)" value={metrics.midline_distance_mm} />
        <Field
          label="Risk factors"
          value={(metrics.risk_factors || []).join("; ") || "none"}
        />
        <Field label="Risk note" value={metrics.risk_note} />
      </Section>

      {/* 4. 3D Visualization */}
      {visible.threeD && (
        <Section title="3D Visualization">
          <ImageCard src={snapshots.threeD} label="3D rendered tumor + brain" />
        </Section>
      )}

      {/* 5. 2D Slice Set */}
      {visible.slices && (
        <Section title="2D Slice Set" breakBefore>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            <ImageCard src={snapshots.axial} label="Axial (mid)" />
            <ImageCard src={snapshots.coronal} label="Coronal (mid)" />
            <ImageCard src={snapshots.sagittal} label="Sagittal (mid)" />
          </div>
        </Section>
      )}

      {/* 6. Heatmap Visualization */}
      {visible.heatmaps && (
        <Section title="AI Attention Heatmap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <ImageCard src={heatmaps.axial} label="Axial heatmap" />
            <ImageCard src={heatmaps.coronal} label="Coronal heatmap" />
            <ImageCard src={heatmaps.sagittal} label="Sagittal heatmap" />
          </div>
          {heatmapReasoning && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <Field label="Primary driver" value={heatmapReasoning.primary_driver} />
              <Field label="Secondary signal" value={heatmapReasoning.secondary_signal} />
              <Field
                label="Asymmetry"
                value={heatmapReasoning.asymmetry_pct != null ? `${heatmapReasoning.asymmetry_pct}%` : "—"}
              />
              <Field
                label="Boundary discontinuity"
                value={heatmapReasoning.boundary_discontinuity_pct != null ? `${heatmapReasoning.boundary_discontinuity_pct}%` : "—"}
              />
              <Field
                label="Final confidence"
                value={heatmapReasoning.final_confidence != null ? `${Math.round(heatmapReasoning.final_confidence * 100)}%` : "—"}
              />
            </div>
          )}
        </Section>
      )}

      {/* 7. Risk Radar */}
      {visible.radar && proximity.length > 0 && (
        <Section title="Anatomical Proximity (Risk Radar)" breakBefore>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: `1px solid ${PALETTE.border}`, padding: "4px 6px" }}>Structure</th>
                <th style={{ textAlign: "left", borderBottom: `1px solid ${PALETTE.border}`, padding: "4px 6px" }}>Distance (mm)</th>
                <th style={{ textAlign: "left", borderBottom: `1px solid ${PALETTE.border}`, padding: "4px 6px" }}>Risk Zone</th>
                <th style={{ textAlign: "left", borderBottom: `1px solid ${PALETTE.border}`, padding: "4px 6px" }}>Functional Impact</th>
              </tr>
            </thead>
            <tbody>
              {proximity.slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${PALETTE.border}` }}>{p.name}</td>
                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${PALETTE.border}` }}>
                    {p.surface_distance_mm.toFixed(1)}
                  </td>
                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${PALETTE.border}`, textTransform: "capitalize" }}>
                    {p.risk_zone}
                  </td>
                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${PALETTE.border}` }}>
                    {p.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {surgicalNote && (
            <p style={{ marginTop: 8, fontSize: 10.5, color: PALETTE.text }}>
              <strong>Surgical context:</strong> {surgicalNote}
            </p>
          )}
        </Section>
      )}

      {/* 8. Verified AI Q&A */}
      {visible.chat && chatExchanges.length > 0 && (
        <Section title="Doctor-Validated AI Findings" breakBefore>
          {chatExchanges.map((ex, i) => (
            <div
              key={i}
              style={{
                marginBottom: 10,
                pageBreakInside: "avoid",
                border: `1px solid ${PALETTE.border}`,
                borderRadius: 6,
                padding: 8,
              }}
            >
              <div style={{ fontSize: 10, color: PALETTE.muted, marginBottom: 4 }}>
                <strong>Q:</strong> {ex.question || "(initial AI seed)"}
              </div>
              <div style={{ fontSize: 10.5, color: PALETTE.text }}>
                <strong>{ex.answer?.primary_finding || "Finding"}.</strong>{" "}
                {ex.answer?.answer_summary || ""}
              </div>
              {ex.notes && (
                <div style={{ marginTop: 4, fontSize: 10, fontStyle: "italic", color: PALETTE.muted }}>
                  Doctor note: {ex.notes}
                </div>
              )}
              <div style={{ marginTop: 4, fontSize: 9, color: "#0EA5E9" }}>
                Verified by {ex.verifiedBy || "Clinician"}
                {ex.verifiedAt ? ` at ${new Date(ex.verifiedAt).toLocaleString()}` : ""}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* 9. Clinical Reasoning + Disclaimer */}
      {visible.reasoning && reasoning.length > 0 && (
        <Section title="Clinical Reasoning Trace">
          <ol style={{ paddingLeft: 18, margin: 0 }}>
            {reasoning.map((r, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                <strong>{r.title}</strong>{" "}
                <span style={{ color: PALETTE.muted }}>({r.confidence})</span>
                <div style={{ fontSize: 10 }}>{r.detail}</div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Clinician notes & signature */}
      <Section title="Clinician Notes & Sign-off">
        <div style={{ minHeight: 60, fontSize: 10.5 }}>
          {metadata.clinicalNotes || (
            <span style={{ color: PALETTE.muted, fontStyle: "italic" }}>
              No additional notes provided.
            </span>
          )}
        </div>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ borderTop: `1px solid ${PALETTE.text}`, paddingTop: 4, width: 220, fontSize: 10, color: PALETTE.muted }}>
              {metadata.doctorName || "Reviewing Clinician"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ borderTop: `1px solid ${PALETTE.text}`, paddingTop: 4, width: 160, fontSize: 10, color: PALETTE.muted }}>
              Date
            </div>
          </div>
        </div>
      </Section>

      <footer
        style={{
          marginTop: 14,
          paddingTop: 8,
          borderTop: `1px solid ${PALETTE.border}`,
          fontSize: 9,
          color: PALETTE.muted,
          lineHeight: 1.45,
        }}
      >
        <p style={{ margin: 0 }}>
          NeuroLens output is decision-support only and does not constitute a
          clinical diagnosis. The reviewing clinician is responsible for
          interpretation, treatment, and patient communication. AI-generated
          findings included in this report were explicitly validated by the
          named clinician.
        </p>
      </footer>
    </div>
  );
});

export default ReportTemplate;
