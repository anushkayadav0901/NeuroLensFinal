import { useEffect, useState } from "react";
import { useApp } from "../../AppContext";
import { useVoice } from "../voice/VoiceContext";
import ReportPreviewModal from "./ReportPreviewModal";

/**
 * ReportButton — opens the PDF report preview modal.
 * Renders nothing when no scan is loaded.
 */
export default function ReportButton({ compact = false }) {
  const { hasResults } = useApp();
  const { registerHook } = useVoice();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return registerHook("generateReport", () => setOpen(true));
  }, [registerHook]);

  if (!hasResults) return null;

  return (
    <>
      <button
        type="button"
        className={compact ? "report-btn-compact" : "report-btn"}
        onClick={() => setOpen(true)}
        title="Generate PDF Report"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        {!compact && <span>Generate Report</span>}
      </button>
      <ReportPreviewModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
