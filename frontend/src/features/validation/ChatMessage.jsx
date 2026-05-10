import ValidationBlock from "./ValidationBlock";
import DoctorReviewActions from "./DoctorReviewActions";

const SENDER_LABELS = {
  doctor: "Doctor",
  ai: "NeuroLens AI",
  system: "System",
};

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatMessage({ message, finding, onValidate, onFlag, onAddNote }) {
  const senderClass = `cm-msg cm-msg-${message.role}`;
  return (
    <div className={senderClass}>
      <div className="cm-meta">
        <span className="cm-sender">{SENDER_LABELS[message.role] || message.role}</span>
        <span className="cm-time">{formatTime(message.timestamp)}</span>
      </div>

      {message.role === "ai" && message.payload ? (
        <div className="cm-bubble cm-bubble-ai">
          <ValidationBlock payload={message.payload} />
          {finding && message.payload.status === "answered" && (
            <DoctorReviewActions
              finding={finding}
              onValidate={onValidate}
              onFlag={onFlag}
              onAddNote={onAddNote}
            />
          )}
        </div>
      ) : (
        <div className={`cm-bubble cm-bubble-${message.role}`}>{message.text}</div>
      )}
    </div>
  );
}
