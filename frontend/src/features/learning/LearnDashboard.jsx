import { useState } from "react";
import { ProgressProvider, useProgress } from "./ProgressContext";
import CaseLibrary from "./CaseLibrary";
import CaseWalkthrough from "./CaseWalkthrough";

function LearnInner() {
  const { xp, streak, badges, badgeDefinitions, dueForReview, completed } = useProgress();
  const [activeCase, setActiveCase] = useState(null);

  const completedCount = Object.keys(completed).length;
  const earnedBadges = badgeDefinitions.filter((b) => badges.includes(b.id));

  return (
    <div className="learn-page">
      <header className="learn-hero">
        <div>
          <div className="learn-eyebrow">Learning Mode</div>
          <h1 className="learn-title">Practice on real BraTS-style cases.</h1>
          <p className="learn-lede">
            Walk a case from history → first-pass impression → modality reveal →
            localization. Score against the ground-truth mask. Earn XP and
            spaced-repetition reviews.
          </p>
        </div>
        <div className="learn-stats">
          <Stat label="XP" value={xp} />
          <Stat label="Streak" value={`${streak}d`} />
          <Stat label="Cases" value={completedCount} />
          <Stat label="Due today" value={dueForReview.length} />
        </div>
      </header>

      {earnedBadges.length > 0 && (
        <div className="learn-badges">
          <div className="learn-badges-label">Badges</div>
          <div className="learn-badges-row">
            {earnedBadges.map((b) => (
              <span key={b.id} className="learn-badge">{b.label}</span>
            ))}
          </div>
        </div>
      )}

      {!activeCase && <CaseLibrary onPick={(c) => setActiveCase(c)} />}
      {activeCase && (
        <CaseWalkthrough caseData={activeCase} onClose={() => setActiveCase(null)} />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="learn-stat">
      <div className="learn-stat-val">{value}</div>
      <div className="learn-stat-label">{label}</div>
    </div>
  );
}

export default function LearnDashboard() {
  return (
    <ProgressProvider>
      <LearnInner />
    </ProgressProvider>
  );
}
