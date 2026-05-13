import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../AppContext";
import { useValidation } from "../../state/ValidationContext";
import { buildChatbotReportSection } from "../validation/ReportValidationManager";
import ReportTemplate from "./ReportTemplate";
import {
  buildFilename,
  generatePdf,
  generateReportId,
} from "./reportGenerator";
import {
  capture3DView,
  captureSlices,
  captureHeatmaps,
} from "./snapshotCapture";

const TODAY_ISO = new Date().toISOString().slice(0, 10);

export default function ReportPreviewModal({ open, onClose }) {
  const { result, activePatientName } = useApp();
  const { findings, messages, doctorName: vDoctorName } = useValidation();

  const [reportId] = useState(generateReportId);
  const [metadata, setMetadata] = useState({
    patientId: "",
    patientName: "",
    dob: "",
    sex: "",
    doctorName: "",
    hospital: "",
    scanDate: TODAY_ISO,
    modality: "Multimodal MRI",
    clinicalNotes: "",
    appVersion: "1.0.0",
  });

  const [sectionToggles, setSectionToggles] = useState({
    threeD: true,
    slices: true,
    heatmaps: true,
    radar: true,
    chat: true,
    reasoning: true,
  });
  const [selectedFindingIds, setSelectedFindingIds] = useState([]);
  const [snapshots, setSnapshots] = useState({ threeD: null, axial: null, coronal: null, sagittal: null });
  const [heatmaps, setHeatmaps] = useState({ axial: null, coronal: null, sagittal: null });
  const [capturing, setCapturing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const reportRef = useRef(null);

  const verifiedFindings = useMemo(
    () => findings.filter((f) => f.status === "verified"),
    [findings],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedFindingIds(verifiedFindings.map((f) => f.id));
    setMetadata((m) => ({
      ...m,
      doctorName: m.doctorName || vDoctorName || "",
      patientName: m.patientName || activePatientName || "",
    }));
    captureAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const captureAll = async () => {
    setCapturing(true);
    setError(null);
    try {
      const sliceInfo = result.slice_info;
      const [threeD, twoD, hm] = await Promise.all([
        capture3DView(),
        captureSlices(sliceInfo),
        sectionToggles.heatmaps && (result.heatmap?.modalities || []).length > 0
          ? captureHeatmaps(sliceInfo, result.heatmap.modalities[0] || "flair", 0.6)
          : Promise.resolve({}),
      ]);
      setSnapshots({ threeD, ...twoD });
      setHeatmaps(hm);
    } catch (err) {
      setError(`Snapshot capture failed: ${err.message}`);
    } finally {
      setCapturing(false);
    }
  };

  const handleToggleSection = (key) =>
    setSectionToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleToggleFinding = (id) =>
    setSelectedFindingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const chatExchanges = useMemo(
    () =>
      buildChatbotReportSection(findings, messages, {
        selectedIds: selectedFindingIds,
      }),
    [findings, messages, selectedFindingIds],
  );

  const handleGenerate = async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    setError(null);
    try {
      const filename = buildFilename({
        patientId: metadata.patientId,
        scanDate: metadata.scanDate,
        reportId,
      });
      await generatePdf(reportRef.current, filename);
    } catch (err) {
      setError(`PDF export failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="rp-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
        <header className="rp-header">
          <h3>Generate PDF Report — {reportId}</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="dra-btn"
              onClick={captureAll}
              disabled={capturing || generating}
            >
              {capturing ? "Capturing..." : "Refresh snapshots"}
            </button>
            <button
              type="button"
              className="dra-btn dra-btn-validate"
              onClick={handleGenerate}
              disabled={generating || capturing}
            >
              {generating ? "Generating PDF..." : "Download PDF"}
            </button>
            <button type="button" className="rp-close" onClick={onClose}>×</button>
          </div>
        </header>

        <div className="rp-body rp-body-grid">
          <aside className="rp-sidebar">
            <h4>Patient & Encounter</h4>
            <FieldInput label="Patient ID" value={metadata.patientId} onChange={(v) => setMetadata({ ...metadata, patientId: v })} />
            <FieldInput label="Patient Name" value={metadata.patientName} onChange={(v) => setMetadata({ ...metadata, patientName: v })} />
            <FieldInput label="DOB" type="date" value={metadata.dob} onChange={(v) => setMetadata({ ...metadata, dob: v })} />
            <FieldInput label="Sex" value={metadata.sex} onChange={(v) => setMetadata({ ...metadata, sex: v })} />
            <FieldInput label="Reviewing Clinician" value={metadata.doctorName} onChange={(v) => setMetadata({ ...metadata, doctorName: v })} />
            <FieldInput label="Institution" value={metadata.hospital} onChange={(v) => setMetadata({ ...metadata, hospital: v })} />
            <FieldInput label="Scan Date" type="date" value={metadata.scanDate} onChange={(v) => setMetadata({ ...metadata, scanDate: v })} />
            <FieldInput label="Modality" value={metadata.modality} onChange={(v) => setMetadata({ ...metadata, modality: v })} />
            <label className="rp-field">
              <span>Clinician Notes</span>
              <textarea
                rows={4}
                value={metadata.clinicalNotes}
                onChange={(e) => setMetadata({ ...metadata, clinicalNotes: e.target.value })}
              />
            </label>

            <h4>Sections</h4>
            <div className="rp-toggles">
              {[
                ["threeD", "3D snapshot"],
                ["slices", "2D slice set"],
                ["heatmaps", "AI heatmaps"],
                ["radar", "Risk Radar table"],
                ["chat", "Verified Q&A"],
                ["reasoning", "Reasoning trace"],
              ].map(([key, label]) => (
                <label key={key} className="rp-toggle">
                  <input
                    type="checkbox"
                    checked={sectionToggles[key]}
                    onChange={() => handleToggleSection(key)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <h4>Verified findings to include</h4>
            {verifiedFindings.length === 0 && (
              <div className="rp-empty">
                No findings are verified yet. Validate findings inside the AI panel
                before generating the report.
              </div>
            )}
            {verifiedFindings.map((f) => (
              <label key={f.id} className="rp-toggle">
                <input
                  type="checkbox"
                  checked={selectedFindingIds.includes(f.id)}
                  onChange={() => handleToggleFinding(f.id)}
                />
                <span style={{ flex: 1 }}>
                  {f.title}
                  <span className="rp-finding-meta">
                    {f.sourceQuestion ? ` — ${f.sourceQuestion}` : ""}
                  </span>
                </span>
              </label>
            ))}

            {error && <div className="rp-error">{error}</div>}
          </aside>

          <div className="rp-preview-wrap">
            <ReportTemplate
              ref={reportRef}
              metadata={{
                ...metadata,
                reportId,
                generatedAt: new Date().toLocaleString(),
              }}
              summary={result.summary}
              metrics={result.metrics}
              proximity={result.anatomical_proximity || []}
              surgicalNote={result.surgical_note}
              reasoning={result.reasoning}
              heatmapReasoning={result.heatmap?.reasoning || null}
              chatExchanges={chatExchanges}
              snapshots={snapshots}
              heatmaps={heatmaps}
              sectionToggles={sectionToggles}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="rp-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
