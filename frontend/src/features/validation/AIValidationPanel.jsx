import { useEffect, useRef, useState } from "react";
import { useApp } from "../../AppContext";
import { useValidation, FINDING_STATUS } from "../../state/ValidationContext";
import { askValidator } from "../../services/aiValidator";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";

export default function AIValidationPanel() {
  const { result, hasResults } = useApp();
  const {
    messages,
    findings,
    doctorName,
    setDoctorName,
    appendDoctorMessage,
    appendAiMessage,
    appendSystemMessage,
    setFindingStatus,
    addNoteToFinding,
  } = useValidation();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  if (!hasResults) {
    return (
      <div className="vp-empty">
        <div className="vp-empty-icon">○</div>
        <div className="vp-empty-title">No analyzed scan available.</div>
        <div className="vp-empty-sub">
          Upload and analyze a scan to start the AI validation workflow.
        </div>
      </div>
    );
  }

  const handleSend = async (raw) => {
    const text = (raw ?? input).trim();
    if (!text || loading) return;

    appendDoctorMessage(text);
    setInput("");
    setLoading(true);

    try {
      const newHistory = [...messages, { role: "doctor", text }];
      const payload = await askValidator(newHistory, result);
      appendAiMessage(payload, text);
    } catch (err) {
      const raw = err?.message || String(err);
      const clipped = raw.length > 200 ? `${raw.slice(0, 197)}…` : raw;
      appendSystemMessage(`AI request failed: ${clipped}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleValidate = (findingId) => setFindingStatus(findingId, FINDING_STATUS.VERIFIED);
  const handleFlag = (findingId) => setFindingStatus(findingId, FINDING_STATUS.FLAGGED);

  const findingById = (id) => findings.find((f) => f.id === id) || null;

  return (
    <div className="vp-root">
      <div className="vp-header vp-header-compact">
        <div className="vp-title-row">
          <span className="vp-title">AI validation</span>
          <span className="vp-subtitle">Validated findings feed the PDF</span>
        </div>
        <div className="vp-doctor-input">
          <label htmlFor="vp-doctor-name">Reviewer</label>
          <input
            id="vp-doctor-name"
            type="text"
            value={doctorName}
            placeholder="Dr. Last name"
            onChange={(e) => setDoctorName(e.target.value)}
          />
        </div>
      </div>

      <div className="vp-messages">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            finding={msg.findingId ? findingById(msg.findingId) : null}
            onValidate={handleValidate}
            onFlag={handleFlag}
            onAddNote={addNoteToFinding}
          />
        ))}
        {loading && (
          <div className="cm-msg cm-msg-ai">
            <div className="cm-meta">
              <span className="cm-sender">NeuroLens AI</span>
            </div>
            <div className="cm-bubble cm-bubble-ai cm-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="vp-input-row">
        <textarea
          className="vp-input vp-input-multiline"
          placeholder="Ask about this scan… (Enter to send, Shift+Enter for newline)"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          type="button"
          className="vp-send"
          disabled={!input.trim() || loading}
          onClick={() => handleSend()}
        >
          {loading ? (
            <span className="spinner" style={{ width: 14, height: 14 }} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>

      <SuggestedQuestions onPick={(q) => handleSend(q)} disabled={loading} />

      <div className="vp-footer">AI assists interpretation. Doctors validate and decide.</div>
    </div>
  );
}
