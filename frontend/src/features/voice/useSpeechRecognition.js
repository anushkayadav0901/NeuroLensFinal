import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSpeechRecognition
 * --------------------
 * Wraps the Web Speech API. Auto-shutoff after `inactivityMs` of silence.
 *
 * Returns:
 *   supported       - boolean (browser support)
 *   listening       - boolean
 *   transcript      - last finalized transcript
 *   interimTranscript - in-progress (non-final) transcript
 *   error           - string (or null)
 *   start()         - begin listening
 *   stop()          - stop listening
 *   reset()         - clear transcript
 */
export default function useSpeechRecognition({
  inactivityMs = 60000,
  onResult = null,
} = {}) {
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const supported = Boolean(SpeechRecognition);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const armInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    }, inactivityMs);
  }, [inactivityMs]);

  useEffect(() => {
    if (!supported) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInterimTranscript(interim);
      if (finalText) {
        const trimmed = finalText.trim();
        setTranscript(trimmed);
        onResultRef.current?.(trimmed);
        armInactivityTimer();
      }
    };

    recognition.onerror = (event) => {
      setError(event?.error || "Speech recognition error");
      setListening(false);
      clearTimeout(inactivityTimerRef.current);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
      clearTimeout(inactivityTimerRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      clearTimeout(inactivityTimerRef.current);
      recognitionRef.current = null;
    };
  }, [SpeechRecognition, supported, armInactivityTimer]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    try {
      recognitionRef.current.start();
      setListening(true);
      armInactivityTimer();
    } catch (err) {
      setError(err?.message || "Could not start microphone");
    }
  }, [armInactivityTimer]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      /* ignore */
    }
    clearTimeout(inactivityTimerRef.current);
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  };
}
