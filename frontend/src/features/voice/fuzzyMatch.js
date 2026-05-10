/**
 * Tiny fuzzy matcher for voice commands.
 * Implements normalized Levenshtein similarity in the [0, 1] range.
 */

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

export function similarity(a, b) {
  if (!a || !b) return 0;
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / max;
}

export function bestMatch(transcript, phrases) {
  let best = { phrase: null, score: 0 };
  for (const phrase of phrases) {
    if (transcript.includes(phrase)) {
      return { phrase, score: 1 };
    }
    const s = similarity(transcript, phrase);
    if (s > best.score) best = { phrase, score: s };
  }
  return best;
}

export function normalizeTranscript(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractNumber(transcript) {
  if (!transcript) return null;
  const direct = transcript.match(/\b(\d+)\b/);
  if (direct) return Number(direct[1]);
  const words = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };
  for (const [w, n] of Object.entries(words)) {
    if (transcript.includes(w)) return n;
  }
  return null;
}
