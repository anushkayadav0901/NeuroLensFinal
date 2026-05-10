import { useVoice } from "./VoiceContext";

export default function VoiceTranscriptBar() {
  const { listening, transcript, interimTranscript, history, error } = useVoice();
  if (!listening && !transcript && !interimTranscript && !error) return null;

  const lastEntry = history[0];
  const status = lastEntry
    ? lastEntry.status === "executed"
      ? `✓ ${lastEntry.match} (${Math.round(lastEntry.score * 100)}%)`
      : lastEntry.status === "no_match"
      ? "No matching command"
      : `Error: ${lastEntry.errorMessage}`
    : null;

  return (
    <div className="vtb-root" aria-live="polite">
      <div className="vtb-inner">
        <div className="vtb-mic-row">
          <span className={`vtb-dot ${listening ? "vtb-listening" : ""}`} />
          <span className="vtb-label">
            {listening ? "Listening..." : "Voice paused"}
          </span>
        </div>
        <div className="vtb-transcript">
          {transcript || interimTranscript || (
            <span className="vtb-empty">Try: "show coronal view" or "rotate left"</span>
          )}
        </div>
        {status && <div className="vtb-status">{status}</div>}
        {error && <div className="vtb-error">{error}</div>}
      </div>
    </div>
  );
}
