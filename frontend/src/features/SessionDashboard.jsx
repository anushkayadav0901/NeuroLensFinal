import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "./SessionContext";

const DEMO_FLOOR = {
  casesReviewed: 14,
  flaggedSlices: 5,
  riskAssessments: 8,
  regionsExplored: 22,
};

const DEMO_SESSION_LOGS = [
  {
    type: "demo",
    description: "Demo session — BraTS case preview opened (left frontal cohort).",
    timestamp: "2026-05-10T08:12:00.000Z",
  },
  {
    type: "demo",
    description: "Risk estimator run: Left Frontal · 3.5 cm · Glioblastoma → moderate band (sandbox).",
    timestamp: "2026-05-10T08:16:22.000Z",
  },
  {
    type: "demo",
    description: "AI validation: three slice planes reviewed; two findings flagged for second read.",
    timestamp: "2026-05-10T08:19:05.000Z",
  },
  {
    type: "demo",
    description: "Atlas proximity table expanded — motor strip 6.2 mm from enhancing margin (illustrative).",
    timestamp: "2026-05-10T08:24:41.000Z",
  },
];

/**
 * FEATURE 5 — Surgical Decision Confidence Tracker
 * Landing demo shows realistic floor values; live session logs append when present.
 */
export default function SessionDashboard() {
  const { sessionLogs } = useSession();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState({
    casesReviewed: 0,
    flaggedSlices: 0,
    riskAssessments: 0,
    regionsExplored: 0,
  });
  const sectionRef = useRef(null);

  const actualMetrics = useMemo(
    () => ({
      casesReviewed: sessionLogs.filter((log) => log.type === "case_reviewed").length,
      flaggedSlices: sessionLogs.filter((log) => log.type === "slice_flagged").length,
      riskAssessments: sessionLogs.filter((log) => log.type === "risk_estimated").length,
      regionsExplored: sessionLogs.filter((log) => log.type === "region_explored").length,
    }),
    [sessionLogs],
  );

  const targetMetrics = useMemo(
    () => ({
      casesReviewed: Math.max(DEMO_FLOOR.casesReviewed, actualMetrics.casesReviewed),
      flaggedSlices: Math.max(DEMO_FLOOR.flaggedSlices, actualMetrics.flaggedSlices),
      riskAssessments: Math.max(DEMO_FLOOR.riskAssessments, actualMetrics.riskAssessments),
      regionsExplored: Math.max(DEMO_FLOOR.regionsExplored, actualMetrics.regionsExplored),
    }),
    [actualMetrics],
  );

  const logsToShow = useMemo(
    () => (sessionLogs.length > 0 ? sessionLogs : DEMO_SESSION_LOGS),
    [sessionLogs],
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 60;
          const interval = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            setCounts({
              casesReviewed: Math.floor(targetMetrics.casesReviewed * progress),
              flaggedSlices: Math.floor(targetMetrics.flaggedSlices * progress),
              riskAssessments: Math.floor(targetMetrics.riskAssessments * progress),
              regionsExplored: Math.floor(targetMetrics.regionsExplored * progress),
            });
            if (step >= steps) {
              clearInterval(timer);
              setCounts(targetMetrics);
            }
          }, interval);
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, targetMetrics]);

  useEffect(() => {
    if (hasAnimated) setCounts(targetMetrics);
  }, [targetMetrics, hasAnimated]);

  return (
    <section ref={sectionRef} style={{ padding: "80px 40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "6px",
          fontSize: "0.7rem",
          fontWeight: "700",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#2DD4BF",
          background: "rgba(45, 212, 191, 0.08)",
          border: "1px solid rgba(45, 212, 191, 0.12)",
          marginBottom: "16px",
        }}
      >
        Feature 5
      </div>

      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          marginBottom: "12px",
          color: "#E5E7EB",
          letterSpacing: "-0.02em",
        }}
      >
        Surgical Decision Confidence Tracker
      </h2>

      <p
        style={{
          fontSize: "1rem",
          color: "#9CA3AF",
          marginBottom: "40px",
          maxWidth: "700px",
          lineHeight: "1.6",
        }}
      >
        Real-time tracking of your clinical decision-making session. Numbers below include a small demo floor on the
        landing page; your own actions can push them higher.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {[
          ["Cases Reviewed This Session", counts.casesReviewed],
          ["Flagged Slices", counts.flaggedSlices],
          ["Risk Assessments Run", counts.riskAssessments],
          ["Regions Explored", counts.regionsExplored],
        ].map(([label, val]) => (
          <div
            key={label}
            style={{
              background: "#111827",
              border: "1px solid #1F2937",
              borderRadius: "12px",
              padding: "24px",
              transition: "border-color 0.2s ease",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "700",
                color: "#2DD4BF",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {val}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#111827",
          border: "1px solid #1F2937",
          borderRadius: "12px",
          padding: "28px",
        }}
      >
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "700",
            color: "#E5E7EB",
            marginBottom: "20px",
          }}
        >
          Session Summary
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {logsToShow.map((log, idx) => (
            <div
              key={`${log.timestamp}-${idx}`}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "14px 16px",
                background: "#0B1220",
                borderRadius: "8px",
                border: "1px solid #1F2937",
              }}
            >
              <span
                style={{
                  fontSize: "1rem",
                  color: "#22C55E",
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#E5E7EB",
                    lineHeight: "1.5",
                  }}
                >
                  {log.description}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6B7280",
                    marginTop: "4px",
                  }}
                >
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
