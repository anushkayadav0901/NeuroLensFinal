import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { API_BASE, useApp } from "../AppContext";
import Viewer from "../components/Viewer";
import SliceViewer from "../components/SliceViewer";
import RiskRadarPanel from "../features/risk-radar/RiskRadarPanel";
import StructureMarkers2D from "../features/risk-radar/StructureMarkers2D";
import AIValidationPanel from "../features/validation/AIValidationPanel";
import HeatmapControls from "../features/heatmap/HeatmapControls";
import ReasoningSummaryCard from "../features/heatmap/ReasoningSummaryCard";
import ReportButton from "../features/report/ReportButton";
import { useVoice } from "../features/voice/VoiceContext";
import DoctorHome from "./DoctorHome";
import DoctorHistory from "./DoctorHistory";

function DoctorStudyShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasResults, activePatientName, endPatientStudy, doctorAuthed } = useApp();

  if (!doctorAuthed) {
    return <Navigate to="/doctor" replace />;
  }
  if (!activePatientName?.trim()) {
    return <Navigate to="/doctor" replace state={{ needPatient: true }} />;
  }

  const path = location.pathname;
  const activeTab = path.includes("/clinical")
    ? "clinical"
    : path.includes("/results")
      ? "results"
      : "upload";

  return (
    <div className="dashboard dh-study-root">
      <div className="dh-study-banner">
        <div className="dh-study-banner-main">
          <span className="dh-study-label">Active patient</span>
          <strong>{activePatientName}</strong>
        </div>
        <div className="dh-study-banner-actions">
          <button type="button" className="dh-btn-ghost dh-btn-sm" onClick={() => navigate("/doctor")}>
            ← Hub
          </button>
          <button
            type="button"
            className="dh-btn-ghost dh-btn-sm"
            onClick={() => {
              endPatientStudy();
              navigate("/doctor");
            }}
          >
            End session
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`dash-tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => navigate("/doctor/study/upload")}
        >
          Upload
        </button>
        <button
          className={`dash-tab ${activeTab === "results" ? "active" : ""}`}
          disabled={!hasResults}
          onClick={() => navigate("/doctor/study/results")}
        >
          Review
        </button>
        <button
          className={`dash-tab ${activeTab === "clinical" ? "active" : ""}`}
          disabled={!hasResults}
          onClick={() => navigate("/doctor/study/clinical")}
        >
          Clinical
        </button>
      </div>

      <div className="dd-outlet-fill">
        <Outlet />
      </div>
    </div>
  );
}

/* ── Upload Tab ─────────────────────────────────────── */
function UploadTab() {
  const navigate = useNavigate();
  const { running, selectedFile, setSelectedFile, status, runAnalysis } = useApp();

  const handleAnalyzeUpload = async () => {
    const ok = await runAnalysis(false);
    if (ok) navigate("/doctor/study/results");
  };

  return (
    <div className="dd-upload-layout dd-upload-layout--solo">
      <div className="dd-upload-solo">
        <div className="dd-panel-card dd-upload-solo-card">
          <h2 className="card-title">Upload scan</h2>
          <p className="card-desc">Choose a volume, then analyze. Results open in the Review tab.</p>

          <label
            className={`dd-dropzone${selectedFile ? " dd-dropzone--has-file" : ""}`}
            htmlFor="scanFile"
          >
            {selectedFile ? (
              <>
                <span className="dd-file-chip" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <span className="dd-file-name" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                <span className="dd-file-change-hint">Click to choose a different file</span>
              </>
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="dd-dropzone-title">Drag &amp; drop or click to upload</span>
                <span className="dd-dropzone-sub">DICOM .zip, .nii, .npy</span>
              </>
            )}
            <input
              id="scanFile"
              type="file"
              accept=".zip,.nii,.gz,.npy,.dcm"
              style={{ display: "none" }}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>

          <button
            type="button"
            className="btn btn-primary dd-upload-analyze"
            disabled={running || !selectedFile}
            onClick={handleAnalyzeUpload}
          >
            {running ? (
              <>
                <span className="spinner" /> Analyzing…
              </>
            ) : (
              "Analyze upload"
            )}
          </button>

          {status?.text ? <p className={`status-text ${status.kind}`}>{status.text}</p> : null}
        </div>
      </div>
    </div>
  );
}

function sliceHeatmapOverlay(enabled, availableModalities, heatmapModality, heatmapOpacity, heatmapUncertainty) {
  return ({ axis, sliceIndex }) =>
    enabled && availableModalities.includes(heatmapModality) ? (
      <img
        key={`${axis}-${sliceIndex}-${heatmapModality}-${heatmapOpacity}-${heatmapUncertainty}`}
        className="heatmap-overlay"
        alt={`${heatmapModality} attention heatmap`}
        src={`${API_BASE}/api/heatmap/${axis}/${sliceIndex}?modality=${heatmapModality}&opacity=${heatmapOpacity}&palette=${
          heatmapUncertainty ? "inferno" : "viridis"
        }`}
      />
    ) : null;
}

/* ── Results Tab — 3D viewer + AI chat only ───────────────── */
function ResultsTab() {
  const { result } = useApp();

  return (
    <div className="dd-review-layout">
      <div className="dd-center-panel">
        <div className="dd-view-toggle dd-review-toolbar">
          <span className="dd-review-heading">3D review</span>
          <ReportButton />
        </div>
        <div className="dd-viewer-full">
          <Viewer tumorMeshUrl={result.mesh_url} brainMeshUrl={result.brain_mesh_url} />
        </div>
      </div>

      <div className="dd-right-panel dd-chat-column">
        <AIValidationPanel />
      </div>
    </div>
  );
}

/* ── Clinical Tab — summaries, radar, 2D / heatmap, reasoning ─ */
function ClinicalTab() {
  const { result } = useApp();
  const s = result.summary;
  const m = result.metrics;
  const p = result.pipeline;
  const reasoning = result.reasoning || [];
  const riskFactors = m?.risk_factors || [];
  const proximity = result.anatomical_proximity || [];
  const riskClass = `risk-${(m?.risk_level || "low").toLowerCase()}`;

  const heatmapInfo = result.heatmap || { modalities: [], reasoning: null };
  const availableModalities = heatmapInfo.modalities || [];
  const [imagingTab, setImagingTab] = useState("2d");
  const [showStructureMarkers, setShowStructureMarkers] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [heatmapModality, setHeatmapModality] = useState(
    availableModalities.includes("flair") ? "flair" : availableModalities[0] || "flair",
  );
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);
  const [heatmapUncertainty, setHeatmapUncertainty] = useState(false);

  const { registerHook } = useVoice();
  useEffect(() => {
    const offHeatmap = registerHook("toggleHeatmap", (enabled) => setHeatmapEnabled(Boolean(enabled)));
    const offStructures = registerHook("toggleStructures", (enabled) => setShowStructureMarkers(Boolean(enabled)));
    return () => {
      offHeatmap?.();
      offStructures?.();
    };
  }, [registerHook]);

  useEffect(() => {
    if (imagingTab === "heatmap" && availableModalities.length > 0) {
      setHeatmapEnabled(true);
    }
  }, [imagingTab, availableModalities.length]);

  const overlayFn = sliceHeatmapOverlay(
    heatmapEnabled,
    availableModalities,
    heatmapModality,
    heatmapOpacity,
    heatmapUncertainty,
  );

  return (
    <div className="page results-page dd-clinical-page">
      <section className={`dd-clinical-top${proximity.length ? "" : " dd-clinical-top--single"}`}>
        <div className="dd-panel-card dd-clinical-summary-card">
          <div className="dd-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h3>Surgical summary</h3>
          </div>
          <div className="dd-stat-list">
            <div className="dd-stat-row">
              <span className="dd-stat-key">Region</span>
              <span className="dd-stat-val">{s?.region || "—"}</span>
            </div>
            <div className="dd-stat-row">
              <span className="dd-stat-key">Volume</span>
              <span className="dd-stat-val">{s?.volume || "—"}</span>
            </div>
            <div className="dd-stat-row">
              <span className="dd-stat-key">Dimensions</span>
              <span className="dd-stat-val">{s?.dimensions || "—"}</span>
            </div>
            <div className="dd-stat-row">
              <span className="dd-stat-key">Laterality</span>
              <span className="dd-stat-val">{s?.laterality || "—"}</span>
            </div>
            <div className="dd-stat-row">
              <span className="dd-stat-key">Depth</span>
              <span className="dd-stat-val">{s?.depth || "—"}</span>
            </div>
            <div className="dd-stat-row">
              <span className="dd-stat-key">Risk level</span>
              <span className={`dd-stat-val ${riskClass}`}>{s?.risk_level || "—"}</span>
            </div>
          </div>
        </div>

        {proximity.length > 0 ? (
          <div className="dd-clinical-radar-slot">
            <RiskRadarPanel proximity={proximity} surgicalNote={result.surgical_note} />
          </div>
        ) : null}
      </section>

      <section className="doctor-section">
        <div className="doctor-grid">
          <div className="detail-card">
            <h3>Clinical summary</h3>
            <p className="subtitle">Technical data extracted from the segmentation pipeline.</p>
            <dl className="detail-list">
              {Object.entries(s || {}).map(([key, value]) => (
                <div className="detail-item" key={key}>
                  <dt>{key.replaceAll("_", " ")}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="meta-list" style={{ marginTop: 18 }}>
              <div className="meta-row">
                Volume (cm³): <span>{m?.tumor_volume_cm3 ?? "n/a"}</span>
              </div>
              <div className="meta-row">
                Region function: <span>{m?.region_function || "n/a"}</span>
              </div>
              <div className="meta-row">
                Midline distance: <span>{m?.midline_distance_mm ?? "n/a"} mm</span>
              </div>
              <div className="meta-row">
                Centroid: <span>{(m?.centroid_voxel || []).join(", ") || "n/a"}</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Planning focus</h3>
            <p className="subtitle">High-signal cues for the surgical workflow.</p>
            <div className="focus-grid">
              <div className="focus-item">
                <span className="label">Laterality</span>
                <span className="value">{s?.laterality || "n/a"}</span>
              </div>
              <div className="focus-item">
                <span className="label">Risk level</span>
                <span className="value">{s?.risk_level || "n/a"}</span>
              </div>
              <div className="focus-item">
                <span className="label">Dimensions</span>
                <span className="value">{s?.dimensions || "n/a"}</span>
              </div>
              <div className="focus-item">
                <span className="label">Depth</span>
                <span className="value">{s?.depth || "n/a"}</span>
              </div>
              <div className="focus-item">
                <span className="label">Pipeline</span>
                <span className="value">{p?.segmentation_mode || "n/a"}</span>
              </div>
              <div className="focus-item">
                <span className="label">Voxel spacing</span>
                <span className="value">{(p?.voxel_spacing_mm || []).join(" × ") || "n/a"} mm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dd-panel-card dd-clinical-imaging">
        <div className="dd-view-toggle dd-clinical-imaging-toolbar">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className={`dd-toggle-btn ${imagingTab === "2d" ? "active" : ""}`} onClick={() => setImagingTab("2d")}>
              2D slices
            </button>
            <button
              type="button"
              className={`dd-toggle-btn ${imagingTab === "heatmap" ? "active" : ""}`}
              onClick={() => setImagingTab("heatmap")}
              disabled={!availableModalities.length}
              title={!availableModalities.length ? "No heatmap data for this scan" : "Heatmap workspace"}
            >
              Heatmap
            </button>
          </div>
          <ReportButton />
        </div>

        <div className="dd-clinical-imaging-body">
          {imagingTab === "2d" ? (
            <div className="dd-slice-center dd-slice-center--clinical">
              <div className="dd-slice-toolbar">
                {proximity.length > 0 && (
                  <button
                    type="button"
                    className={`rr-markers-toggle ${showStructureMarkers ? "active" : ""}`}
                    onClick={() => setShowStructureMarkers((v) => !v)}
                  >
                    {showStructureMarkers ? "Hide" : "Show"} critical structures
                  </button>
                )}
              </div>
              <SliceViewer
                sliceInfo={result.slice_info}
                imageOverlay={null}
                overlay={({ axis, sliceIndex, sliceInfo }) => (
                  <StructureMarkers2D
                    proximity={proximity}
                    axis={axis}
                    sliceIndex={sliceIndex}
                    sliceInfo={sliceInfo}
                    visible={showStructureMarkers}
                  />
                )}
              />
            </div>
          ) : (
            <div className="dd-heatmap-workspace dd-heatmap-workspace--clinical">
              <div className="dd-heatmap-toolbar">
                <HeatmapControls
                  available={availableModalities}
                  enabled={heatmapEnabled}
                  onToggle={setHeatmapEnabled}
                  modality={heatmapModality}
                  onModalityChange={setHeatmapModality}
                  opacity={heatmapOpacity}
                  onOpacityChange={setHeatmapOpacity}
                  uncertainty={heatmapUncertainty}
                  onUncertaintyChange={setHeatmapUncertainty}
                />
              </div>
              <div className="dd-heatmap-stage">
                <SliceViewer sliceInfo={result.slice_info} imageOverlay={overlayFn} overlay={null} />
              </div>
              {heatmapEnabled && <ReasoningSummaryCard reasoning={heatmapInfo.reasoning} />}
            </div>
          )}
        </div>
      </section>

      <section className="detail-card reasoning-section">
        <h3>Clinical reasoning</h3>
        <p className="subtitle">Step-by-step justification for the reported summary.</p>
        {riskFactors.length > 0 && (
          <div className="risk-chips">
            {riskFactors.map((f) => (
              <span key={f} className="risk-chip">
                {f}
              </span>
            ))}
          </div>
        )}
        <div className="reasoning-steps">
          {reasoning.map((step) => (
            <div key={step.step} className="reasoning-step">
              <div className="step-header">
                <span className="step-number">{step.step}</span>
                <span className="step-title">{step.title}</span>
                <span className="confidence-badge">{step.confidence}</span>
              </div>
              <p className="step-detail">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Router ─────────────────────────────────────────── */
export default function DoctorDashboard() {
  return (
    <div className="doctor-route-root">
      <Routes>
        <Route index element={<DoctorHome />} />
        <Route path="history" element={<DoctorHistory />} />
        <Route path="study" element={<DoctorStudyShell />}>
          <Route index element={<Navigate to="upload" replace />} />
          <Route path="upload" element={<UploadTab />} />
          <Route path="results" element={<ResultsTab />} />
          <Route path="clinical" element={<ClinicalTab />} />
        </Route>
      </Routes>
    </div>
  );
}
