import { colorForZone, RISK_ZONE_LABEL } from "./riskColors";

export default function ProximityList({ proximity = [], limit = 6 }) {
  if (!proximity.length) {
    return (
      <div className="rr-list-empty">No proximity data available.</div>
    );
  }

  const items = proximity.slice(0, limit);

  return (
    <ul className="rr-list">
      {items.map((d) => {
        const color = colorForZone(d.risk_zone);
        return (
          <li className="rr-list-item" key={d.id}>
            <div className="rr-list-row">
              <span className="rr-list-name">{d.name}</span>
              <span className="rr-list-distance">
                {d.surface_distance_mm.toFixed(1)} mm
              </span>
            </div>
            <div className="rr-list-row rr-list-row-meta">
              <span
                className="rr-zone-badge"
                style={{ background: `${color}1f`, color, borderColor: `${color}55` }}
              >
                {RISK_ZONE_LABEL[d.risk_zone] || d.risk_zone}
              </span>
              <span className="rr-list-impact">{d.impact}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
