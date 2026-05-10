import { useState } from "react";
import RiskRadarChart from "./RiskRadarChart";
import ProximityList from "./ProximityList";
import SurgicalNote from "./SurgicalNote";
import { RISK_ZONE_COLORS, RISK_ZONE_LABEL, RISK_ZONE_DESC } from "./riskColors";

export default function RiskRadarPanel({ proximity = [], surgicalNote = "" }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!proximity.length) return null;

  const zoneCounts = proximity.reduce((acc, p) => {
    acc[p.risk_zone] = (acc[p.risk_zone] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="rr-panel">
      <header className="rr-panel-header">
        <div className="rr-panel-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
          <h3>Anatomical Risk Radar</h3>
        </div>
        <button
          type="button"
          className="rr-collapse-btn"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </header>

      {!collapsed && (
        <>
          <div className="rr-radar-row">
            <RiskRadarChart proximity={proximity} />
            <div className="rr-legend">
              {Object.keys(RISK_ZONE_LABEL).map((zone) => (
                <div className="rr-legend-row" key={zone}>
                  <span
                    className="rr-legend-dot"
                    style={{ background: RISK_ZONE_COLORS[zone] }}
                  />
                  <span className="rr-legend-label">{RISK_ZONE_LABEL[zone]}</span>
                  <span className="rr-legend-desc">{RISK_ZONE_DESC[zone]}</span>
                  <span className="rr-legend-count">
                    {zoneCounts[zone] ? `× ${zoneCounts[zone]}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ProximityList proximity={proximity} limit={6} />
          <SurgicalNote note={surgicalNote} />
        </>
      )}
    </section>
  );
}
