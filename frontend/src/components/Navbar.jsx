import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../AppContext";
import logoImg from "./logo.png";
import VoiceControlButton from "../features/voice/VoiceControlButton";
import ReportButton from "../features/report/ReportButton";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasResults, modelStatus, doctorAuthed } = useApp();
  const path = location.pathname;

  if (path === "/") {
    return null;
  }

  const inDoctorStudy = path.startsWith("/doctor/study");

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src={logoImg} alt="NeuroLens" className="nav-logo" />
        NeuroLens
      </div>
      <div className="nav-links">
        {inDoctorStudy ? (
          <>
            <button
              className={`nav-link ${path.includes("/study/upload") ? "active" : ""}`}
              onClick={() => navigate("/doctor/study/upload")}
            >
              Upload
            </button>
            <button
              className={`nav-link ${path.includes("/study/results") ? "active" : ""}`}
              disabled={!hasResults}
              onClick={() => navigate("/doctor/study/results")}
            >
              Review
            </button>
            <button
              className={`nav-link ${path.includes("/study/clinical") ? "active" : ""}`}
              disabled={!hasResults}
              onClick={() => navigate("/doctor/study/clinical")}
            >
              Clinical
            </button>
            <button className="nav-link" type="button" onClick={() => navigate("/doctor")}>
              Hub
            </button>
          </>
        ) : (
          <button
            className={`nav-link ${path.startsWith("/doctor") ? "active" : ""}`}
            onClick={() => navigate("/doctor")}
          >
            Doctor
          </button>
        )}
        {hasResults && (
          <button
            className={`nav-link ${path === "/patient" ? "active" : ""}`}
            onClick={() => navigate("/patient")}
          >
            Patient view
          </button>
        )}
        <button
          className={`nav-link ${path.startsWith("/learn") ? "active" : ""}`}
          onClick={() => navigate("/learn")}
        >
          Learning mode
        </button>
      </div>
      <div className="nav-status">
        <ReportButton compact />
        <VoiceControlButton />
        <span className="dot" />
        <span>{modelStatus?.exists ? `Model: ${modelStatus.arch}` : "Ready"}</span>
      </div>
    </nav>
  );
}
