import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { buildSeedPayload } from "../services/aiValidator";

/**
 * ValidationContext
 * -----------------
 * Per-scan store for the AI Validation Chatbot:
 *   - chat history (messages: doctor / ai / system)
 *   - structured findings (each carries the AI block + doctor status)
 *   - doctor notes
 *
 * Resets whenever a new analysis lands (mesh_url change).
 *
 * The PDF generator reads `findings` and exposes ONLY items with
 * status === "verified" via the ReportValidationManager helper.
 */

const ValidationContext = createContext(null);

const FINDING_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  FLAGGED: "flagged",
};

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function ValidationProvider({ children }) {
  const { result, hasResults } = useApp();
  const [messages, setMessages] = useState([]);
  const [findings, setFindings] = useState([]);
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    if (!hasResults) {
      setMessages([]);
      setFindings([]);
      return;
    }
    const seed = buildSeedPayload(result);
    setMessages([
      {
        id: newId(),
        role: "system",
        text: "New scan loaded. AI generated a preliminary structured assessment for review.",
        timestamp: nowIso(),
        initial: true,
      },
      {
        id: newId(),
        role: "ai",
        timestamp: nowIso(),
        payload: seed,
        text: seed.answer_summary,
        findingId: null,
        initial: true,
      },
    ]);
    setFindings([
      {
        id: newId(),
        title: "Preliminary AI Assessment",
        payload: seed,
        status: FINDING_STATUS.PENDING,
        sourceQuestion: "(initial AI seed)",
        createdAt: nowIso(),
        verifiedAt: null,
        verifiedBy: null,
        notes: "",
        rejectionReason: "",
      },
    ]);
  }, [result.mesh_url, hasResults]);

  const appendDoctorMessage = (text) => {
    const msg = {
      id: newId(),
      role: "doctor",
      text,
      timestamp: nowIso(),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  const appendAiMessage = (payload, sourceQuestion) => {
    const findingId = newId();
    const msg = {
      id: newId(),
      role: "ai",
      timestamp: nowIso(),
      payload,
      text: payload.answer_summary || "(no summary)",
      findingId,
    };
    setMessages((prev) => [...prev, msg]);

    if (payload.status === "answered") {
      setFindings((prev) => [
        ...prev,
        {
          id: findingId,
          title: payload.primary_finding || "AI Finding",
          payload,
          status: FINDING_STATUS.PENDING,
          sourceQuestion,
          createdAt: nowIso(),
          verifiedAt: null,
          verifiedBy: null,
          notes: "",
          rejectionReason: "",
        },
      ]);
    }
    return msg;
  };

  const appendSystemMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: "system", text, timestamp: nowIso() },
    ]);
  };

  const setFindingStatus = (findingId, status, extra = {}) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === findingId
          ? {
              ...f,
              status,
              verifiedAt: status === FINDING_STATUS.VERIFIED ? nowIso() : f.verifiedAt,
              verifiedBy: status === FINDING_STATUS.VERIFIED ? doctorName || "Reviewing Clinician" : f.verifiedBy,
              ...extra,
            }
          : f,
      ),
    );
  };

  const addNoteToFinding = (findingId, note) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, notes: note } : f)),
    );
  };

  const verifiedFindings = useMemo(
    () => findings.filter((f) => f.status === FINDING_STATUS.VERIFIED),
    [findings],
  );

  const value = useMemo(
    () => ({
      messages,
      findings,
      verifiedFindings,
      doctorName,
      setDoctorName,
      appendDoctorMessage,
      appendAiMessage,
      appendSystemMessage,
      setFindingStatus,
      addNoteToFinding,
    }),
    [messages, findings, verifiedFindings, doctorName],
  );

  return <ValidationContext.Provider value={value}>{children}</ValidationContext.Provider>;
}

export function useValidation() {
  const ctx = useContext(ValidationContext);
  if (!ctx) {
    return {
      messages: [],
      findings: [],
      verifiedFindings: [],
      doctorName: "",
      setDoctorName: () => {},
      appendDoctorMessage: () => null,
      appendAiMessage: () => null,
      appendSystemMessage: () => null,
      setFindingStatus: () => {},
      addNoteToFinding: () => {},
    };
  }
  return ctx;
}

export { FINDING_STATUS };
