import { useNavigate, Navigate } from "react-router-dom";
import { useApp } from "../AppContext";
import { listReportMeta } from "../services/doctorSession";

export default function DoctorHistory() {
  const navigate = useNavigate();
  const { loadPersistedStudy, doctorAuthed } = useApp();
  const rows = listReportMeta();

  if (!doctorAuthed) {
    return <Navigate to="/doctor" replace />;
  }

  const open = (m) => {
    if (!loadPersistedStudy(m)) return;
    navigate("/doctor/study/results");
  };

  return (
    <div className="dh-history">
      <header className="dh-history-head">
        <button type="button" className="dh-btn-ghost" onClick={() => navigate("/doctor")}>
          ← Hub
        </button>
        <h1>All studies</h1>
      </header>
      {rows.length === 0 ? (
        <p className="dh-empty">No saved studies yet.</p>
      ) : (
        <div className="dh-table-wrap">
          <table className="dh-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>When</th>
                <th>Region</th>
                <th>Risk</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.patientName}</td>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>{m.region || "—"}</td>
                  <td>{m.riskLevel || "—"}</td>
                  <td>
                    <button type="button" className="dh-btn-sm" onClick={() => open(m)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
