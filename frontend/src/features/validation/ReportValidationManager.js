/**
 * ReportValidationManager.js
 * --------------------------
 * Single source of truth for what the PDF report is allowed to embed from
 * the chatbot. Only doctor-VERIFIED findings flow through. Pending and
 * flagged findings are explicitly marked "AI-generated preliminary
 * observation" if a doctor opts to include them.
 */

import { FINDING_STATUS } from "../../state/ValidationContext";

export function getVerifiedFindings(findings) {
  return findings.filter((f) => f.status === FINDING_STATUS.VERIFIED);
}

export function getReportableFindings(findings, { includePending = false } = {}) {
  return findings
    .filter((f) =>
      includePending
        ? f.status !== FINDING_STATUS.FLAGGED
        : f.status === FINDING_STATUS.VERIFIED,
    )
    .map((f) => ({
      ...f,
      reportLabel:
        f.status === FINDING_STATUS.VERIFIED
          ? `Verified by ${f.verifiedBy || "Clinician"}`
          : "AI-generated preliminary observation",
    }));
}

export function buildChatbotReportSection(findings, messages, { selectedIds = null } = {}) {
  const usable = getReportableFindings(findings, { includePending: false });
  const filtered = selectedIds
    ? usable.filter((f) => selectedIds.includes(f.id))
    : usable;

  const exchanges = filtered.map((f) => {
    const aiMsg = messages.find((m) => m.role === "ai" && m.findingId === f.id);
    return {
      finding: f,
      question: f.sourceQuestion,
      answer: aiMsg?.payload || f.payload,
      verifiedAt: f.verifiedAt,
      verifiedBy: f.verifiedBy,
      notes: f.notes,
    };
  });

  return exchanges;
}
