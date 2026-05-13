const AUTH_KEY = "nl_doctor_auth_v1";
const INDEX_KEY = "nl_doctor_reports_index_v1";
const BLOB_PREFIX = "nl_doctor_report_blob_v1_";
const MAX_INDEX = 45;

export function isDoctorAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function doctorLogin() {
  sessionStorage.setItem(AUTH_KEY, "1");
}

export function doctorLogout() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem("nl_active_patient_name");
}

export function listReportMeta() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistIndex(list) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(list.slice(0, MAX_INDEX)));
}

/**
 * Persist a completed analysis for the doctor hub (local demo only).
 * @returns {object|null} meta row or null on failure
 */
export function saveDoctorReport({ patientName, result }) {
  if (!result?.mesh_url) return null;
  const id = `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const meta = {
    id,
    patientName: (patientName || "Unnamed patient").trim() || "Unnamed patient",
    createdAt: new Date().toISOString(),
    riskLevel: result.summary?.risk_level ?? null,
    region: result.summary?.region ?? null,
    volume: result.summary?.volume ?? null,
  };
  try {
    localStorage.setItem(BLOB_PREFIX + id, JSON.stringify(result));
    const index = listReportMeta();
    index.unshift(meta);
    persistIndex(index);
    return meta;
  } catch (e) {
    console.warn("[doctorSession] save failed", e);
    return null;
  }
}

export function loadDoctorReport(id) {
  try {
    const raw = localStorage.getItem(BLOB_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isSameLocalDay(isoString) {
  if (!isoString) return false;
  const d = new Date(isoString);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

export function todayReports() {
  return listReportMeta().filter((m) => isSameLocalDay(m.createdAt));
}

/** Placeholder rows when no real reports exist today (local demo UI only). */
export const DEMO_TODAY_REPORTS = [
  {
    id: "demo_today_1",
    demo: true,
    patientName: "Alex Rivera",
    region: "Right frontal lobe",
    riskLevel: "Moderate",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo_today_2",
    demo: true,
    patientName: "Jordan Kim",
    region: "Left parietal",
    riskLevel: "High",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo_today_3",
    demo: true,
    patientName: "Sam Okonkwo",
    region: "Temporal · deep",
    riskLevel: "Low",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo_today_4",
    demo: true,
    patientName: "Morgan Lee",
    region: "Periventricular",
    riskLevel: "Moderate",
    createdAt: new Date().toISOString(),
  },
];
