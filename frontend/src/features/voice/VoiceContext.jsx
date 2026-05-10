import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { VOICE_COMMANDS } from "./voiceCommands";
import { bestMatch, normalizeTranscript, extractNumber } from "./fuzzyMatch";
import useSpeechRecognition from "./useSpeechRecognition";

/**
 * VoiceContext
 * ------------
 * Top-level voice state. Maintains a registry of "dispatch hooks" that
 * feature pages (e.g., DoctorDashboard, ReportButton, etc.) register at
 * mount, plus a router that maps recognized phrases to command actions.
 */

const VoiceContext = createContext(null);

const FUZZY_THRESHOLD = 0.7;

export function VoiceProvider({ children }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [hooks, setHooks] = useState({});

  const registerHook = useCallback((name, fn) => {
    setHooks((prev) => ({ ...prev, [name]: fn }));
    return () =>
      setHooks((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
  }, []);

  const routeTranscript = useCallback(
    (rawTranscript) => {
      const normalized = normalizeTranscript(rawTranscript);
      if (!normalized) return null;

      const number = extractNumber(normalized);
      let bestEntry = null;
      let bestScore = 0;

      for (const cmd of VOICE_COMMANDS) {
        const { phrase, score } = bestMatch(normalized, cmd.phrases);
        if (score > bestScore) {
          bestScore = score;
          bestEntry = { cmd, phrase };
        }
      }

      const entry = {
        transcript: rawTranscript,
        normalized,
        match: bestEntry?.cmd?.id || null,
        score: bestScore,
        timestamp: Date.now(),
      };

      if (bestEntry && bestScore >= FUZZY_THRESHOLD) {
        try {
          bestEntry.cmd.action({
            ...hooks,
            numberInTranscript: number,
            scrollToSelector: (sel) => {
              const el = document.querySelector(sel);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            },
          });
          entry.status = "executed";
        } catch (err) {
          entry.status = "error";
          entry.errorMessage = err?.message || "command failed";
        }
      } else {
        entry.status = "no_match";
      }

      setHistory((h) => [entry, ...h].slice(0, 20));
      return entry;
    },
    [hooks],
  );

  const speech = useSpeechRecognition({
    onResult: (text) => routeTranscript(text),
  });

  const value = useMemo(
    () => ({
      ...speech,
      helpOpen,
      setHelpOpen,
      history,
      registerHook,
      routeTranscript,
      commands: VOICE_COMMANDS,
    }),
    [speech, helpOpen, history, registerHook, routeTranscript],
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    return {
      supported: false,
      listening: false,
      transcript: "",
      interimTranscript: "",
      error: null,
      start: () => {},
      stop: () => {},
      reset: () => {},
      helpOpen: false,
      setHelpOpen: () => {},
      history: [],
      registerHook: () => () => {},
      routeTranscript: () => null,
      commands: [],
    };
  }
  return ctx;
}
