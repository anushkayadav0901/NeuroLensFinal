export const RISK_ZONE_COLORS = {
  critical: "#EF4444",
  high: "#F97316",
  moderate: "#FBBF24",
  low: "#22C55E",
};

export const RISK_ZONE_LABEL = {
  critical: "Critical",
  high: "High",
  moderate: "Moderate",
  low: "Low",
};

export const RISK_ZONE_DESC = {
  critical: "<5 mm or overlapping",
  high: "5–10 mm",
  moderate: "10–20 mm",
  low: ">20 mm",
};

export function colorForZone(zone) {
  return RISK_ZONE_COLORS[zone] || "#6B7280";
}
