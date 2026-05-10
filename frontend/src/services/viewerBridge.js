/**
 * viewerBridge.js
 * ---------------
 * The ONLY module in the codebase that talks to the existing Three.js viewer
 * rendered by frontend/src/components/Viewer.jsx.
 *
 * Viewer.jsx is intentionally not modified for any feature in this expansion.
 * All integrations (PDF snapshots, voice control, future overlays) reach the
 * 3D viewer through the four primitives below:
 *
 *   captureCanvasSnapshot()  - read the rendered frame as a PNG data URL
 *   setBrainMode(mode)        - click one of the existing toolbar buttons
 *   rotateView(direction)     - synthesize a pointer drag that OrbitControls handles
 *   zoomView(delta)           - synthesize a wheel event that OrbitControls handles
 *
 * If Viewer.jsx is restructured later, only this file needs updating.
 */

const VIEWER_CANVAS_SELECTOR = ".viewer canvas";
const VIEWER_TOOLBAR_BTN_SELECTOR = ".viewer-toolbar .toolbar-btn";

const MODE_LABELS = {
  solid: "Solid",
  wireframe: "Wireframe",
  hidden: "Tumor Only",
  tumor_only: "Tumor Only",
};

function getCanvas() {
  return document.querySelector(VIEWER_CANVAS_SELECTOR);
}

export function isViewerMounted() {
  return Boolean(getCanvas());
}

/**
 * Read the latest rendered Three.js frame as a PNG data URL.
 * Returns null when the viewer isn't mounted or the read fails.
 * Note: Three.js renderers without preserveDrawingBuffer can return a blank
 * frame; the report generator falls back to html2canvas when that happens.
 */
export function captureCanvasSnapshot(mimeType = "image/png", quality = 0.95) {
  const canvas = getCanvas();
  if (!canvas) return null;
  try {
    return canvas.toDataURL(mimeType, quality);
  } catch (err) {
    console.warn("[viewerBridge] toDataURL failed", err);
    return null;
  }
}

export function getCurrentBrainMode() {
  const btns = document.querySelectorAll(VIEWER_TOOLBAR_BTN_SELECTOR);
  for (const b of btns) {
    if (b.classList.contains("active")) {
      const label = b.textContent.trim().toLowerCase();
      if (label === "solid") return "solid";
      if (label === "wireframe") return "wireframe";
      if (label.startsWith("tumor")) return "hidden";
    }
  }
  return null;
}

/**
 * Programmatically click one of the existing brain-mode toolbar buttons.
 * mode: "solid" | "wireframe" | "hidden" (a.k.a. "tumor_only")
 */
export function setBrainMode(mode) {
  const target = MODE_LABELS[mode];
  if (!target) return false;
  const btns = document.querySelectorAll(VIEWER_TOOLBAR_BTN_SELECTOR);
  for (const b of btns) {
    if (b.textContent.trim() === target) {
      b.click();
      return true;
    }
  }
  return false;
}

function dispatchPointer(canvas, type, clientX, clientY) {
  const ev =
    typeof PointerEvent === "function"
      ? new PointerEvent(type, {
          clientX,
          clientY,
          button: 0,
          buttons: type === "pointerup" ? 0 : 1,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
          bubbles: true,
          cancelable: true,
        })
      : new MouseEvent(type.replace("pointer", "mouse"), {
          clientX,
          clientY,
          button: 0,
          buttons: type === "pointerup" ? 0 : 1,
          bubbles: true,
          cancelable: true,
        });
  canvas.dispatchEvent(ev);
}

/**
 * Synthesize a left-button drag inside the viewer canvas.
 * OrbitControls already listens for pointer events on the renderer DOM
 * element so this is enough to rotate the camera.
 *
 * direction: "left" | "right" | "up" | "down"
 * magnitude: 0..1 (fraction of canvas size to drag)
 */
export function rotateView(direction = "right", magnitude = 0.4) {
  const canvas = getCanvas();
  if (!canvas) return false;
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx =
    { left: -1, right: 1, up: 0, down: 0 }[direction] ?? 0;
  const dy =
    { up: -1, down: 1, left: 0, right: 0 }[direction] ?? 0;
  const px = rect.width * 0.25 * magnitude;
  const py = rect.height * 0.25 * magnitude;

  dispatchPointer(canvas, "pointerdown", cx, cy);
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    dispatchPointer(canvas, "pointermove", cx + dx * px * t, cy + dy * py * t);
  }
  dispatchPointer(canvas, "pointerup", cx + dx * px, cy + dy * py);
  return true;
}

/**
 * Synthesize a wheel event inside the viewer canvas.
 * Negative delta zooms in, positive zooms out (matches OrbitControls).
 */
export function zoomView(delta = -120) {
  const canvas = getCanvas();
  if (!canvas) return false;
  const rect = canvas.getBoundingClientRect();
  const ev = new WheelEvent("wheel", {
    deltaY: delta,
    deltaMode: 0,
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
    bubbles: true,
    cancelable: true,
  });
  canvas.dispatchEvent(ev);
  return true;
}

/**
 * Best-effort "reset view" without touching Viewer.jsx.
 * Restores the default Solid material. True OrbitControls.reset() is
 * unavailable from outside, so we document this approximation in the
 * voice-control help panel.
 */
export function resetView() {
  setBrainMode("solid");
  zoomView(0);
  return true;
}
