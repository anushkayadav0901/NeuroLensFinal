import { useMemo } from "react";
import { colorForZone } from "./riskColors";

/** Inner drawing diameter; viewBox adds padding so axis labels stay inside the SVG. */
const SIZE = 280;
const VIEW_PAD = 44;
const VIEW = SIZE + VIEW_PAD * 2;
const CENTER = VIEW / 2;
const RING_COUNT = 4;
const MAX_DISTANCE_MM = 60;

function shortLabel(name) {
  return name.replace(/\((Left|Right)\)/, (_, side) => `(${side[0]})`);
}

export default function RiskRadarChart({ proximity = [] }) {
  const data = useMemo(() => proximity.slice(0, 8), [proximity]);
  const n = data.length;

  if (n < 3) {
    return (
      <div className="rr-radar-empty">
        Not enough proximity data to render the radar.
      </div>
    );
  }

  const distanceToRadius = (mm) => {
    const clamped = Math.min(MAX_DISTANCE_MM, Math.max(0, mm));
    const inverted = (MAX_DISTANCE_MM - clamped) / MAX_DISTANCE_MM;
    return inverted * (SIZE / 2 - 24);
  };

  const angleFor = (i) => -Math.PI / 2 + (i / n) * 2 * Math.PI;

  const polarPoint = (i, radius) => {
    const a = angleFor(i);
    return [CENTER + Math.cos(a) * radius, CENTER + Math.sin(a) * radius];
  };

  const polygonPoints = data
    .map((d, i) => polarPoint(i, distanceToRadius(d.surface_distance_mm)).join(","))
    .join(" ");

  return (
    <svg className="rr-radar-svg" viewBox={`0 0 ${VIEW} ${VIEW}`} role="img" aria-label="Risk radar chart">
      <defs>
        <radialGradient id="rr-zones" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
          <stop offset="25%" stopColor="#F97316" stopOpacity="0.14" />
          <stop offset="55%" stopColor="#FBBF24" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0.06" />
        </radialGradient>
      </defs>

      <circle cx={CENTER} cy={CENTER} r={SIZE / 2 - 24} fill="url(#rr-zones)" />

      {Array.from({ length: RING_COUNT }).map((_, ring) => {
        const r = ((ring + 1) / RING_COUNT) * (SIZE / 2 - 24);
        return (
          <circle
            key={ring}
            cx={CENTER}
            cy={CENTER}
            r={r}
            fill="none"
            stroke="#1F2937"
            strokeWidth="1"
          />
        );
      })}

      {data.map((d, i) => {
        const [x, y] = polarPoint(i, SIZE / 2 - 24);
        return (
          <line
            key={d.id}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="#1F2937"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={polygonPoints}
        fill="rgba(56, 189, 248, 0.18)"
        stroke="#38BDF8"
        strokeWidth="1.5"
      />

      {data.map((d, i) => {
        const [x, y] = polarPoint(i, distanceToRadius(d.surface_distance_mm));
        return (
          <circle
            key={`pt-${d.id}`}
            cx={x}
            cy={y}
            r={5}
            fill={colorForZone(d.risk_zone)}
            stroke="#0B1220"
            strokeWidth="1.5"
          >
            <title>
              {d.name}: {d.surface_distance_mm.toFixed(1)} mm ({d.risk_zone})
            </title>
          </circle>
        );
      })}

      {data.map((d, i) => {
        const [x, y] = polarPoint(i, SIZE / 2 - 12);
        const a = angleFor(i);
        const anchor = Math.cos(a) > 0.2 ? "start" : Math.cos(a) < -0.2 ? "end" : "middle";
        return (
          <text
            key={`lbl-${d.id}`}
            x={x}
            y={y}
            fill="#9CA3AF"
            fontSize="10"
            textAnchor={anchor}
            dominantBaseline="middle"
          >
            {shortLabel(d.name)}
          </text>
        );
      })}
    </svg>
  );
}
