import { useMemo, useState } from "react";
import { LEARNING_CASES, TUMOR_TYPES, DIFFICULTIES } from "./learning-cases";
import { useProgress } from "./ProgressContext";

const ALL = "all";

export default function CaseLibrary({ onPick }) {
  const [diff, setDiff] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [query, setQuery] = useState("");

  const { completed, dueForReview } = useProgress();

  const dueIds = useMemo(() => new Set(dueForReview.map((d) => d.caseId)), [dueForReview]);

  const filtered = LEARNING_CASES.filter((c) => {
    if (diff !== ALL && c.difficulty !== diff) return false;
    if (type !== ALL && c.tumor_type !== type) return false;
    if (query && !`${c.title} ${c.region}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="lc-library">
      <div className="lc-filters">
        <input
          type="search"
          className="lc-search"
          placeholder="Search by symptom, region..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select label="Difficulty" value={diff} onChange={setDiff} options={[{ id: ALL, label: "All levels" }, ...DIFFICULTIES]} />
        <Select label="Tumor type" value={type} onChange={setType} options={[{ id: ALL, label: "All types" }, ...TUMOR_TYPES]} />
      </div>

      <div className="lc-grid">
        {filtered.map((c) => {
          const done = completed[c.id];
          const due = dueIds.has(c.id);
          return (
            <button key={c.id} type="button" className="lc-card" onClick={() => onPick?.(c)}>
              <div className="lc-card-row">
                <span className={`lc-difficulty lc-${c.difficulty}`}>{c.difficulty}</span>
                {due && <span className="lc-due-tag">Due for review</span>}
                {done && <span className="lc-done-tag">Score {Math.round(done.score * 100)}%</span>}
              </div>
              <div className="lc-card-title">{c.title}</div>
              <div className="lc-card-meta">{c.region} · {c.tumor_type.replace("_", " ")}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="lc-select">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
