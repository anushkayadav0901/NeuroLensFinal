import html2pdf from "html2pdf.js";

/**
 * reportGenerator.js
 * ------------------
 * Wraps html2pdf with NeuroLens-specific defaults:
 *   - A4 paper, 0 margin (the template already enforces inset padding)
 *   - 2x scale for crisper text
 *   - useCORS so loaded heatmap PNGs from the FastAPI backend embed cleanly
 *
 * Filename convention: NeuroLens_Report_{patient}_{YYYYMMDD}_{shortId}.pdf
 */

function fileSafeId(s) {
  return (s || "Patient").replace(/[^A-Za-z0-9_-]/g, "");
}

function dateStamp(iso) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "00000000";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export function buildFilename({ patientId, scanDate, reportId }) {
  const pt = fileSafeId(patientId || "Patient");
  const date = dateStamp(scanDate);
  const short = (reportId || "").slice(0, 6) || Math.random().toString(36).slice(2, 8);
  return `NeuroLens_Report_${pt}_${date}_${short}.pdf`;
}

export function generateReportId() {
  return `NL-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;
}

export async function generatePdf(element, filename) {
  if (!element) throw new Error("Report element is missing.");
  const opt = {
    margin: 0,
    filename: filename || `NeuroLens_Report_${dateStamp()}.pdf`,
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#FFFFFF",
      logging: false,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };
  return html2pdf().set(opt).from(element).save();
}
