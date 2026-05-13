import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../AppContext";
import {
  listReportMeta,
  todayReports,
  isSameLocalDay,
  DEMO_TODAY_REPORTS,
} from "../services/doctorSession";

export default function DoctorHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    doctorAuthed,
    loginDoctor,
    logoutDoctor,
    beginPatientStudy,
    loadPersistedStudy,
  } = useApp();
  const [patientDraft, setPatientDraft] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const needPatient = location.state?.needPatient;

  const today = todayReports();
  const todayDisplay = today.length > 0 ? today : DEMO_TODAY_REPORTS;
  const all = listReportMeta();

  if (!doctorAuthed) {
    return (
      <div className="dh-gate">
        <div className="dh-gate-card">
          <p className="dh-gate-eyebrow">NeuroLens</p>
          <h1 className="dh-gate-title">Doctor&apos;s View</h1>
          <p className="dh-gate-lede">
            Secure workspace for upload, 3D review, AI validation, and reporting. This demo uses a
            one-tap clinician sign-in (no password stored).
          </p>
          <button type="button" className="dh-btn-primary" onClick={loginDoctor}>
            Sign in as clinician
          </button>
          <p className="dh-gate-foot">For production, replace with your hospital SSO or OIDC.</p>
        </div>
      </div>
    );
  }

  const startStudy = () => {
    if (!beginPatientStudy(patientDraft)) return;
    setShowNewForm(false);
    setPatientDraft("");
    navigate("/doctor/study/upload");
  };

  const openReport = (meta) => {
    if (meta?.demo) return;
    if (!loadPersistedStudy(meta)) return;
    navigate("/doctor/study/results");
  };

  return (
    <div className="dh-hub">
      <header className="dh-hub-header">
        <div>
          <h1 className="dh-hub-title">Doctor hub</h1>
          <p className="dh-hub-sub">Choose a workflow — keep today&apos;s list at a glance.</p>
        </div>
        <button type="button" className="dh-btn-ghost" onClick={logoutDoctor}>
          Sign out
        </button>
      </header>

      {needPatient && (
        <div className="dh-banner-warn">
          Start or resume a patient study from this page before opening the imaging workspace.
        </div>
      )}

      <div className="dh-hub-grid">
        <section className="dh-card dh-card-accent">
          <h2>New patient study</h2>
          <p className="dh-card-desc">
            Enter the patient name for this encounter, then continue to upload, BraTS, or sample
            analysis — same tools as before, organized step-by-step.
          </p>
          {!showNewForm ? (
            <button type="button" className="dh-btn-primary" onClick={() => setShowNewForm(true)}>
              Start new study
            </button>
          ) : (
            <div className="dh-new-form">
              <label className="dh-field">
                <span>Patient name</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Taylor Morgan"
                  value={patientDraft}
                  onChange={(e) => setPatientDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startStudy()}
                />
              </label>
              <div className="dh-new-actions">
                <button type="button" className="dh-btn-primary" onClick={startStudy}>
                  Open imaging workspace
                </button>
                <button type="button" className="dh-btn-ghost" onClick={() => setShowNewForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="dh-card">
          <div className="dh-card-head">
            <h2>Today&apos;s reports</h2>
            <span className="dh-pill">{todayDisplay.length}</span>
          </div>
          <ul className="dh-report-list">
            {todayDisplay.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={`dh-report-row${m.demo ? " dh-report-row--demo" : ""}`}
                  onClick={() => openReport(m)}
                  disabled={!!m.demo}
                  title={m.demo ? "Demo preview — complete an analysis to open a saved study" : undefined}
                >
                  <span className="dh-r-name">{m.patientName}</span>
                  <span className="dh-r-meta">
                    {m.region || "—"} · {m.riskLevel || "—"}
                  </span>
                  <span className="dh-r-open">{m.demo ? "Demo" : "Open"}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="dh-card dh-card-wide">
        <div className="dh-card-head">
          <h2>All saved studies</h2>
          <button type="button" className="dh-linkish" onClick={() => navigate("/doctor/history")}>
            Full table view
          </button>
        </div>
        {all.length === 0 ? (
          <p className="dh-empty">Saved analyses appear here for quick recall on this browser.</p>
        ) : (
          <ul className="dh-report-list dh-report-list-compact">
            {all.slice(0, 8).map((m) => (
              <li key={m.id}>
                <button type="button" className="dh-report-row" onClick={() => openReport(m)}>
                  <span className="dh-r-name">{m.patientName}</span>
                  <span className="dh-r-date">
                    {new Date(m.createdAt).toLocaleString()}{" "}
                    {isSameLocalDay(m.createdAt) ? <em className="dh-today-tag">Today</em> : null}
                  </span>
                  <span className="dh-r-open">Open</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
