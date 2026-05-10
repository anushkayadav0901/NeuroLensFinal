/**
 * voiceCommands.js
 * ----------------
 * Phrase -> action registry for Voice Control. Categories follow the spec:
 *   Navigation, Visualization, Analysis, Workflow.
 *
 * Each entry has:
 *   id        - unique identifier
 *   phrases   - normalized phrases (lowercase, no punctuation)
 *   category  - "navigation" | "visualization" | "analysis" | "workflow"
 *   action    - function called with the dispatch context
 *   description - shown in the help panel
 */

import { rotateView, zoomView, setBrainMode, resetView } from "../../services/viewerBridge";
import { sliceNav } from "../../services/sliceNavBus";

export const VOICE_COMMANDS = [
  /* ─── Navigation (2D slices) ─── */
  {
    id: "show-axial",
    category: "navigation",
    phrases: ["show axial view", "switch to axial", "axial view", "go axial"],
    description: "Switch the 2D slice viewer to the axial plane.",
    action: () => sliceNav.setAxis("axial"),
  },
  {
    id: "show-coronal",
    category: "navigation",
    phrases: ["show coronal view", "switch to coronal", "coronal view", "open coronal"],
    description: "Switch the 2D slice viewer to the coronal plane.",
    action: () => sliceNav.setAxis("coronal"),
  },
  {
    id: "show-sagittal",
    category: "navigation",
    phrases: ["show sagittal view", "switch to sagittal", "sagittal view", "open sagittal"],
    description: "Switch the 2D slice viewer to the sagittal plane.",
    action: () => sliceNav.setAxis("sagittal"),
  },
  {
    id: "next-slice",
    category: "navigation",
    phrases: ["next slice", "go forward", "forward one"],
    description: "Advance one slice on the current axis.",
    action: () => sliceNav.next(),
  },
  {
    id: "previous-slice",
    category: "navigation",
    phrases: ["previous slice", "go back", "back one slice"],
    description: "Go back one slice on the current axis.",
    action: () => sliceNav.prev(),
  },
  {
    id: "go-to-slice",
    category: "navigation",
    phrases: ["go to slice", "jump to slice", "slice number"],
    description: "Jump to a specific slice index. Say 'go to slice 42'.",
    parametric: true,
    action: ({ numberInTranscript }) => {
      if (numberInTranscript != null) sliceNav.setSliceIndex(numberInTranscript);
    },
  },
  {
    id: "jump-to-tumor",
    category: "navigation",
    phrases: ["jump to tumor", "show the tumor", "find tumor", "go to tumor"],
    description: "Center the slice viewer on the tumor.",
    action: () => sliceNav.jumpToTumor(),
  },

  /* ─── Visualization (3D viewer) ─── */
  {
    id: "rotate-left",
    category: "visualization",
    phrases: ["rotate left", "turn left", "spin left"],
    description: "Rotate the 3D brain to the left.",
    action: () => rotateView("left"),
  },
  {
    id: "rotate-right",
    category: "visualization",
    phrases: ["rotate right", "turn right", "spin right"],
    description: "Rotate the 3D brain to the right.",
    action: () => rotateView("right"),
  },
  {
    id: "rotate-up",
    category: "visualization",
    phrases: ["rotate up", "tilt up", "look up"],
    description: "Rotate the 3D brain upward.",
    action: () => rotateView("up"),
  },
  {
    id: "rotate-down",
    category: "visualization",
    phrases: ["rotate down", "tilt down", "look down"],
    description: "Rotate the 3D brain downward.",
    action: () => rotateView("down"),
  },
  {
    id: "zoom-in",
    category: "visualization",
    phrases: ["zoom in", "closer", "magnify"],
    description: "Zoom into the 3D view.",
    action: () => zoomView(-180),
  },
  {
    id: "zoom-out",
    category: "visualization",
    phrases: ["zoom out", "farther", "step back"],
    description: "Zoom out from the 3D view.",
    action: () => zoomView(180),
  },
  {
    id: "reset-view",
    category: "visualization",
    phrases: ["reset view", "default view", "center view"],
    description:
      "Best-effort reset: returns the brain to solid mode (true camera reset is unavailable from outside the viewer).",
    action: () => resetView(),
  },
  {
    id: "show-wireframe",
    category: "visualization",
    phrases: ["show wireframe", "wireframe mode", "switch to wireframe"],
    description: "Switch the brain to wireframe rendering.",
    action: () => setBrainMode("wireframe"),
  },
  {
    id: "show-solid",
    category: "visualization",
    phrases: ["solid mode", "show solid", "switch to solid"],
    description: "Show the brain as a solid translucent surface.",
    action: () => setBrainMode("solid"),
  },
  {
    id: "tumor-only",
    category: "visualization",
    phrases: ["tumor only", "hide brain", "isolate tumor", "show tumor only"],
    description: "Hide the brain mesh and focus on the tumor.",
    action: () => setBrainMode("hidden"),
  },
  {
    id: "show-brain",
    category: "visualization",
    phrases: ["show brain", "bring brain back", "restore brain"],
    description: "Restore the brain mesh after Tumor Only mode.",
    action: () => setBrainMode("solid"),
  },

  /* ─── Analysis ─── */
  {
    id: "show-summary",
    category: "analysis",
    phrases: ["show summary", "open summary", "tumor summary"],
    description: "Bring focus to the surgical summary panel.",
    action: ({ scrollToSelector }) => scrollToSelector?.(".dd-stat-list"),
  },
  {
    id: "show-heatmap",
    category: "analysis",
    phrases: ["show heatmap", "show attention", "show explainability heatmap"],
    description: "Enable the AI attention heatmap overlay on 2D slices.",
    action: ({ toggleHeatmap }) => toggleHeatmap?.(true),
  },
  {
    id: "hide-heatmap",
    category: "analysis",
    phrases: ["hide heatmap", "remove heatmap", "hide attention"],
    description: "Disable the AI attention heatmap overlay.",
    action: ({ toggleHeatmap }) => toggleHeatmap?.(false),
  },
  {
    id: "show-structures",
    category: "analysis",
    phrases: [
      "show critical structures",
      "highlight structures",
      "show anatomy markers",
      "highlight motor cortex",
      "highlight broca",
    ],
    description: "Overlay nearby critical anatomical structures on the 2D slices.",
    action: ({ toggleStructures }) => toggleStructures?.(true),
  },
  {
    id: "hide-structures",
    category: "analysis",
    phrases: ["hide critical structures", "hide structures", "hide anatomy markers"],
    description: "Hide the critical-structure markers.",
    action: ({ toggleStructures }) => toggleStructures?.(false),
  },

  /* ─── Workflow ─── */
  {
    id: "open-chatbot",
    category: "workflow",
    phrases: ["open chatbot", "open ai", "ask the ai", "open validation"],
    description: "Focus the AI Validation panel.",
    action: ({ scrollToSelector }) => scrollToSelector?.(".vp-root"),
  },
  {
    id: "generate-report",
    category: "workflow",
    phrases: ["generate report", "create report", "make a report"],
    description: "Open the PDF report preview modal.",
    action: ({ generateReport }) => generateReport?.(),
  },
  {
    id: "download-pdf",
    category: "workflow",
    phrases: ["download pdf", "download report", "save report"],
    description: "Trigger the same PDF generation flow as the toolbar button.",
    action: ({ generateReport }) => generateReport?.(),
  },
];
