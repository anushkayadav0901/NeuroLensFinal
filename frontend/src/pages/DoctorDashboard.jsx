import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../AppContext";
import Viewer from "../components/Viewer";
import SliceViewer from "../components/SliceViewer";
import RiskRadarPanel from "../features/risk-radar/RiskRadarPanel";
import StructureMarkers2D from "../features/risk-radar/StructureMarkers2D";
import AIValidationPanel from "../features/validation/AIValidationPanel";
import HeatmapControls from "../features/heatmap/HeatmapControls";
import ReasoningSummaryCard from "../features/heatmap/ReasoningSummaryCard";
import ReportButton from "../features/report/ReportButton";
import { useVoice } from "../features/voice/VoiceContext";
import { API_BASE } from "../AppContext";

/* ── Upload Tab ─────────────────────────────────────── */
function UploadTab() {
  const navigate = useNavigate();
  const {
    running, selectedFile, setSelectedFile,
    bratsCases, selectedCaseId, setSelectedCaseId,
    selectedModality, setSelectedModality,
    selectedSource, setSelectedSource,
    loadingCases, modelStatus, status,
    runAnalysis, runBratsCase, loadBratsCases,
  } = useApp();

  const handleAnalyzeUpload = async () => {
    const ok = await runAnalysis(false);
    if (ok) navigate("/doctor/results");
  };

  const handleUseSample = async () => {
    const ok = await runAnalysis(true);
    if (ok) navigate("/doctor/results");
  };

  const handleAnalyzeCase = async () => {
    const ok = await runBratsCase();
    if (ok) navigate("/doctor/results");
  };

  return (
    <div className="dd-upload-layout">
      {/* ── Left: Upload card only ── */}
      <div className="dd-left-panel">
        <div className="dd-panel-card">
          <span className="card-label">Upload</span>
          <h2 className="card-title">Scan File</h2>
          <p className="card-desc">
            Upload a DICOM zip archive, NIfTI volume, or NumPy file to analyze.
          </p>

          {/* Drop zone */}
          <label className="dd-dropzone" htmlFor="scanFile">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className="dd-dropzone-title">Drag &amp; drop or click to upload</span>
            <span className="dd-dropzone-sub">
              {selectedFile ? selectedFile.name : "Supports DICOM, .zip, .nii, .npy"}
            </span>
            <input
              id="scanFile"
              type="file"
              accept=".zip,.nii,.gz,.npy,.dcm"
              style={{ display: "none" }}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>

          <div className="dd-controls-section">
            <p className="dd-controls-label">BraTS Dataset</p>
            <div className="form-group">
              <select
                className="select-input"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
              >
                <option value="">Select a BraTS case</option>
                {bratsCases.map((c) => (
                  <option key={c.case_id} value={c.case_id}>{c.case_id}</option>
                ))}
              </select>
            </div>
            <div className="row-2">
              <div className="form-group">
                <label className="form-label">Modality</label>
                <select className="select-input" value={selectedModality} onChange={(e) => setSelectedModality(e.target.value)}>
                  <option value="flair">FLAIR</option>
                  <option value="t1">T1</option>
                  <option value="t1ce">T1CE</option>
                  <option value="t2">T2</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mask source</label>
                <select className="select-input" value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)}>
                  <option value="ground_truth">Ground Truth</option>
                  <option value="model" disabled={!modelStatus?.exists}>MONAI Model</option>
                </select>
              </div>
            </div>
          </div>

          <div className="dd-btn-stack">
            <button className="btn btn-primary" style={{ width: "100%" }} disabled={running} onClick={handleAnalyzeUpload}>
              {running ? <><span className="spinner" /> Analyzing...</> : "Analyze Upload"}
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} disabled={running} onClick={handleUseSample}>
              Use Sample Case
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} disabled={running || !selectedCaseId} onClick={handleAnalyzeCase}>
              Analyze BraTS Case
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} disabled={loadingCases} onClick={loadBratsCases}>
              {loadingCases ? "Refreshing..." : "Refresh Cases"}
            </button>
          </div>

          <p className={`status-text ${status.kind}`}>{status.text}</p>

          <div className={`model-badge ${modelStatus?.exists ? "active" : "inactive"}`}>
            {modelStatus?.exists
              ? `✓ Model: ${modelStatus.mode} (${modelStatus.arch})`
              : "○ Model not configured — using ground truth"}
          </div>
        </div>
      </div>

      {/* ── Center: placeholder viewer ── */}
      <div className="dd-center-panel">
        <div className="dd-viewer-placeholder">
          <div className="dd-viewer-placeholder-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
            <p>3D Brain Viewer</p>
            <span>Upload and analyze a scan to view</span>
          </div>
        </div>
      </div>

      {/* ── Right: summary + AI explanation placeholders ── */}
      <div className="dd-right-panel">
        <div className="dd-panel-card">
          <div className="dd-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h3>Surgical Summary</h3>
          </div>
          <p className="dd-placeholder-text">No analysis yet. Upload and analyze a scan.</p>
        </div>

        <div className="dd-panel-card">
          <div className="dd-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            <h3>AI Explanation</h3>
          </div>
          <p className="dd-placeholder-text">Analysis results will appear here.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Results Tab (3D Viewer + AI Chat) ──────────────── */
function ResultsTab() {
  const { result } = useApp();
  const s = result.summary;
  const m = result.metrics;
  const proximity = result.anatomical_proximity || [];
  const riskClass = `risk-${(m?.risk_level || "low").toLowerCase()}`;

  const [viewMode, setViewMode] = useState("3d");
  const [showStructureMarkers, setShowStructureMarkers] = useState(false);

  const heatmapInfo = result.heatmap || { modalities: [], reasoning: null };
  const availableModalities = heatmapInfo.modalities || [];
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [heatmapModality, setHeatmapModality] = useState(
    availableModalities.includes("flair") ? "flair" : availableModalities[0] || "flair",
  );
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);
  const [heatmapUncertainty, setHeatmapUncertainty] = useState(false);

  const { registerHook } = useVoice();
  useEffect(() => {
    const offHeatmap = registerHook("toggleHeatmap", (enabled) =>
      setHeatmapEnabled(Boolean(enabled)),
    );
    const offStructures = registerHook("toggleStructures", (enabled) =>
      setShowStructureMarkers(Boolean(enabled)),
    );
    return () => {
      offHeatmap?.();
      offStructures?.();
    };
  }, [registerHook]);

  return (
    <div className="dd-results-layout">
      {/* ── Left panel: stats + risk radar ── */}
      <div className="dd-left-panel">
        <div className="dd-panel-card">
          <div className="dd-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h3>Surgical Summary</h3>
          </div>
          <div className="dd-stat-list">
            <div className="dd-stat-row"><span className="dd-stat-key">Region</span><span className="dd-stat-val">{s?.region || "—"}</span></div>
            <div className="dd-stat-row"><span className="dd-stat-key">Volume</span><span className="dd-stat-val">{s?.volume || "—"}</span></div>
            <div className="dd-stat-row"><span className="dd-stat-key">Dimensions</span><span className="dd-stat-val">{s?.dimensions || "—"}</span></div>
            <div className="dd-stat-row"><span className="dd-stat-key">Laterality</span><span className="dd-stat-val">{s?.laterality || "—"}</span></div>
            <div className="dd-stat-row"><span className="dd-stat-key">Depth</span><span className="dd-stat-val">{s?.depth || "—"}</span></div>
            <div className="dd-stat-row">
              <span className="dd-stat-key">Risk Level</span>
              <span className={`dd-stat-val ${riskClass}`}>{s?.risk_level || "—"}</span>
            </div>
          </div>
        </div>

        <RiskRadarPanel proximity={proximity} surgicalNote={result.surgical_note} />
      </div>

      {/* ── Center: toggle + viewer ── */}
      <div className="dd-center-panel">
        <div className="dd-view-toggle" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`dd-toggle-btn ${viewMode === "3d" ? "active" : ""}`}
              onClick={() => setViewMode("3d")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              3D View
            </button>
            <button
              className={`dd-toggle-btn ${viewMode === "2d" ? "active" : ""}`}
              onClick={() => setViewMode("2d")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
              2D Slices
            </button>
          </div>
          <ReportButton />
        </div>

        <div className="dd-viewer-full">
          {viewMode === "3d" ? (
            <Viewer tumorMeshUrl={result.mesh_url} brainMeshUrl={result.brain_mesh_url} />
          ) : (
            <div className="dd-slice-center">
              <div className="dd-slice-toolbar">
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
                imageOverlay={({ axis, sliceIndex }) =>
                  heatmapEnabled && availableModalities.includes(heatmapModality) ? (
                    <img
                      key={`${axis}-${sliceIndex}-${heatmapModality}-${heatmapOpacity}-${heatmapUncertainty}`}
                      className="heatmap-overlay"
                      alt={`${heatmapModality} attention heatmap`}
                      src={`${API_BASE}/api/heatmap/${axis}/${sliceIndex}?modality=${heatmapModality}&opacity=${heatmapOpacity}&palette=${
                        heatmapUncertainty ? "inferno" : "viridis"
                      }`}
                    />
                  ) : null
                }
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
              {heatmapEnabled && (
                <ReasoningSummaryCard reasoning={heatmapInfo.reasoning} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: AI Validation ── */}
      <div className="dd-right-panel">
        <AIValidationPanel />
      </div>
    </div>
  );
}

/* ── Clinical Tab ───────────────────────────────────── */
function ClinicalTab() {
  const { result } = useApp();
  const s = result.summary;
  const m = result.metrics;
  const p = result.pipeline;
  const reasoning = result.reasoning || [];
  const riskFactors = m?.risk_factors || [];
  const proximity = result.anatomical_proximity || [];

  return (
    <div className="page results-page">
      <section className="doctor-section">
        <div className="doctor-grid">
          <div className="detail-card">
            <h3>Clinical Summary</h3>
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
              <div className="meta-row">Volume (cm³): <span>{m?.tumor_volume_cm3 ?? "n/a"}</span></div>
              <div className="meta-row">Region function: <span>{m?.region_function || "n/a"}</span></div>
              <div className="meta-row">Midline distance: <span>{m?.midline_distance_mm ?? "n/a"} mm</span></div>
              <div className="meta-row">Centroid: <span>{(m?.centroid_voxel || []).join(", ") || "n/a"}</span></div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Planning Focus</h3>
            <p className="subtitle">High-signal cues for the surgical workflow.</p>
            <div className="focus-grid">
              <div className="focus-item"><span className="label">Laterality</span><span className="value">{s?.laterality || "n/a"}</span></div>
              <div className="focus-item"><span className="label">Risk Level</span><span className="value">{s?.risk_level || "n/a"}</span></div>
              <div className="focus-item"><span className="label">Dimensions</span><span className="value">{s?.dimensions || "n/a"}</span></div>
              <div className="focus-item"><span className="label">Depth</span><span className="value">{s?.depth || "n/a"}</span></div>
              <div className="focus-item"><span className="label">Pipeline</span><span className="value">{p?.segmentation_mode || "n/a"}</span></div>
              <div className="focus-item"><span className="label">Voxel Spacing</span><span className="value">{(p?.voxel_spacing_mm || []).join(" × ") || "n/a"} mm</span></div>
            </div>
          </div>
        </div>

        {proximity.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <RiskRadarPanel proximity={proximity} surgicalNote={result.surgical_note} />
          </div>
        )}

        <div className="detail-card reasoning-section">
          <h3>Clinical Reasoning</h3>
          <p className="subtitle">Step-by-step justification for the reported summary.</p>
          {riskFactors.length > 0 && (
            <div className="risk-chips">
              {riskFactors.map((f) => <span key={f} className="risk-chip">{f}</span>)}
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
        </div>
      </section>
    </div>
  );
}

/* ── Doctor Dashboard Shell ─────────────────────────── */
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasResults } = useApp();
  const path = location.pathname;

  const activeTab = path === "/doctor/results" ? "results"
    : path === "/doctor/clinical" ? "clinical"
    : "upload";

  return (
    <div className="dashboard">
      <div className="dashboard-tabs">
        <button
          className={`dash-tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => navigate("/doctor")}
        >
          Upload
        </button>
        <button
          className={`dash-tab ${activeTab === "results" ? "active" : ""}`}
          disabled={!hasResults}
          onClick={() => navigate("/doctor/results")}
        >
          3D Viewer
        </button>
        <button
          className={`dash-tab ${activeTab === "clinical" ? "active" : ""}`}
          disabled={!hasResults}
          onClick={() => navigate("/doctor/clinical")}
        >
          Clinical
        </button>
      </div>

      {activeTab === "upload"   && <UploadTab />}
      {activeTab === "results"  && <ResultsTab />}
      {activeTab === "clinical" && <ClinicalTab />}
    </div>
  );
}
