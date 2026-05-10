import html2canvas from "html2canvas";
import { captureCanvasSnapshot } from "../../services/viewerBridge";
import { API_BASE } from "../../AppContext";

/**
 * snapshotCapture.js
 * ------------------
 * Generates the imagery embedded in the PDF report.
 *
 *   capture3DView()    -> data URL of the live Three.js canvas (or fallback
 *                         html2canvas of the wrapper if the WebGL drawing
 *                         buffer cannot be read).
 *   captureSlices()    -> { axial, coronal, sagittal } middle slices fetched
 *                         from /api/slices.
 *   captureHeatmaps()  -> matching heatmap slices for the current modality.
 */

export async function capture3DView() {
  const direct = captureCanvasSnapshot();
  if (direct && !isBlank(direct)) return direct;

  const wrapper = document.querySelector(".viewer");
  if (!wrapper) return null;
  try {
    const canvas = await html2canvas(wrapper, {
      backgroundColor: "#0B1220",
      scale: 1.5,
      useCORS: true,
    });
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.warn("[snapshotCapture] html2canvas fallback failed", err);
    return null;
  }
}

function isBlank(dataUrl) {
  return typeof dataUrl !== "string" || dataUrl.length < 1024;
}

async function fetchAsDataUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export async function captureSlices(sliceInfo) {
  if (!sliceInfo) return {};
  const out = {};
  for (const axis of ["axial", "coronal", "sagittal"]) {
    const dim = sliceInfo[axis];
    if (!dim) continue;
    const idx = Math.floor(dim / 2);
    try {
      out[axis] = await fetchAsDataUrl(`${API_BASE}/api/slices/${axis}/${idx}`);
    } catch (err) {
      console.warn(`[snapshotCapture] slice fetch failed (${axis}):`, err.message);
    }
  }
  return out;
}

export async function captureHeatmaps(sliceInfo, modality = "flair", opacity = 0.6) {
  if (!sliceInfo) return {};
  const out = {};
  for (const axis of ["axial", "coronal", "sagittal"]) {
    const dim = sliceInfo[axis];
    if (!dim) continue;
    const idx = Math.floor(dim / 2);
    try {
      out[axis] = await fetchAsDataUrl(
        `${API_BASE}/api/heatmap/${axis}/${idx}?modality=${modality}&opacity=${opacity}`,
      );
    } catch (err) {
      console.warn(`[snapshotCapture] heatmap fetch failed (${axis}):`, err.message);
    }
  }
  return out;
}
