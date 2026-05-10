import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * ProgressContext
 * ---------------
 * localStorage-backed progress store for Learning Mode.
 *
 *   xp        - integer
 *   streak    - days in a row
 *   completed - { [caseId]: { score, completedAt, attempts } }
 *   review    - { [caseId]: { dueAt, intervalDays } } (3d / 14d spaced repetition)
 *   badges    - array of badge ids
 */

const STORAGE_KEY = "neurolens.learning.progress.v1";

const DEFAULT_STATE = {
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  completed: {},
  review: {},
  badges: [],
};

const ProgressContext = createContext(null);

function readState() {
  if (typeof localStorage === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  if (!a || !b) return Infinity;
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

const BADGE_DEFINITIONS = [
  { id: "first_case", label: "First Case", check: (s) => Object.keys(s.completed).length >= 1 },
  { id: "five_cases", label: "Case Streak: 5", check: (s) => Object.keys(s.completed).length >= 5 },
  { id: "ten_cases", label: "Case Streak: 10", check: (s) => Object.keys(s.completed).length >= 10 },
  { id: "week_streak", label: "7-day Streak", check: (s) => s.streak >= 7 },
  {
    id: "perfect_score",
    label: "Perfect Run",
    check: (s) => Object.values(s.completed).some((c) => c.score >= 0.99),
  },
];

export function ProgressProvider({ children }) {
  const [state, setState] = useState(readState);

  useEffect(() => {
    writeState(state);
  }, [state]);

  const recordCompletion = useCallback((caseId, score) => {
    setState((prev) => {
      const today = todayIso();
      const lastDay = prev.lastActiveDate;
      let newStreak = prev.streak;
      if (lastDay === today) {
        // already counted today
      } else if (lastDay && daysBetween(lastDay, today) === 1) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1;
      }

      const prevCompleted = prev.completed[caseId];
      const attempts = (prevCompleted?.attempts || 0) + 1;

      const xpGain = Math.round(20 + score * 80);
      const completed = {
        ...prev.completed,
        [caseId]: { score, completedAt: today, attempts },
      };

      const intervalDays = score >= 0.85 ? 14 : 3;
      const dueAt = addDaysIso(today, intervalDays);
      const review = { ...prev.review, [caseId]: { dueAt, intervalDays } };

      const next = {
        ...prev,
        xp: prev.xp + xpGain,
        streak: newStreak,
        lastActiveDate: today,
        completed,
        review,
      };
      next.badges = BADGE_DEFINITIONS.filter((b) => b.check(next)).map((b) => b.id);
      return next;
    });
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  const dueForReview = useMemo(() => {
    const today = todayIso();
    return Object.entries(state.review || {})
      .filter(([, v]) => daysBetween(v.dueAt, today) >= 0)
      .map(([caseId, v]) => ({ caseId, dueAt: v.dueAt, intervalDays: v.intervalDays }));
  }, [state.review]);

  const value = useMemo(
    () => ({
      ...state,
      recordCompletion,
      reset,
      dueForReview,
      badgeDefinitions: BADGE_DEFINITIONS,
    }),
    [state, recordCompletion, reset, dueForReview],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    return {
      ...DEFAULT_STATE,
      recordCompletion: () => {},
      reset: () => {},
      dueForReview: [],
      badgeDefinitions: [],
    };
  }
  return ctx;
}

function addDaysIso(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
