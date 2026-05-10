import { useMemo } from "react";
import { useVoice } from "./VoiceContext";

const CATEGORIES = [
  { key: "navigation", label: "Navigation" },
  { key: "visualization", label: "Visualization (3D)" },
  { key: "analysis", label: "Analysis" },
  { key: "workflow", label: "Workflow" },
];

export default function VoiceHelpPanel() {
  const { helpOpen, setHelpOpen, commands } = useVoice();

  const grouped = useMemo(() => {
    const map = {};
    for (const c of commands) {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    }
    return map;
  }, [commands]);

  if (!helpOpen) return null;

  return (
    <div
      className="vhp-overlay"
      role="dialog"
      aria-modal="true"
      onClick={() => setHelpOpen(false)}
    >
      <div className="vhp-panel" onClick={(e) => e.stopPropagation()}>
        <header className="vhp-header">
          <h3>Voice Commands</h3>
          <button type="button" className="vhp-close" onClick={() => setHelpOpen(false)}>
            ×
          </button>
        </header>
        <div className="vhp-body">
          {CATEGORIES.map(({ key, label }) => (
            <section key={key} className="vhp-section">
              <h4 className="vhp-cat">{label}</h4>
              <ul className="vhp-list">
                {(grouped[key] || []).map((cmd) => (
                  <li key={cmd.id} className="vhp-item">
                    <div className="vhp-phrases">
                      {cmd.phrases.slice(0, 3).map((p, i) => (
                        <code key={i}>"{p}"</code>
                      ))}
                    </div>
                    <div className="vhp-desc">{cmd.description}</div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <footer className="vhp-footer">
          Voice control uses your browser's Web Speech API. The microphone
          auto-shuts off after 60 seconds of silence.
        </footer>
      </div>
    </div>
  );
}
