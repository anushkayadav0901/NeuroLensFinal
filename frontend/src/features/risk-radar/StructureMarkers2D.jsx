import { useMemo } from "react";
import { colorForZone } from "./riskColors";

/**
 * Draws color-coded dots for nearby anatomical structures on top of the 2D
 * slice viewer. Rendered as an absolutely-positioned SVG sibling — no changes
 * to SliceViewer's image render path.
 *
 * Coordinate convention from the backend (anatomical_atlas.py):
 *   centroid_normalized = (axial, coronal, sagittal)
 *
 * For each axis the OTHER two normalized coordinates project onto the
 * displayed slice. The render path also vertically flips the image
 * (slice_server.py applies np.flipud), so we mirror Y here too.
 */
export default function StructureMarkers2D({
  proximity = [],
  axis = "axial",
  sliceIndex = 0,
  sliceInfo = null,
  visible = true,
}) {
  const visibleStructures = useMemo(() => {
    if (!visible || !sliceInfo || !proximity.length) return [];
    const dimAxial = sliceInfo.axial || 1;
    const dimCoronal = sliceInfo.coronal || 1;
    const dimSagittal = sliceInfo.sagittal || 1;

    return proximity
      .map((s) => {
        const [na, nc, ns] = s.centroid_normalized;
        let xNorm = 0;
        let yNorm = 0;
        let depthNorm = 0;
        let depthDim = 1;

        if (axis === "axial") {
          xNorm = ns;
          yNorm = nc;
          depthNorm = na;
          depthDim = dimAxial;
        } else if (axis === "coronal") {
          xNorm = ns;
          yNorm = na;
          depthNorm = nc;
          depthDim = dimCoronal;
        } else {
          xNorm = nc;
          yNorm = na;
          depthNorm = ns;
          depthDim = dimSagittal;
        }

        const sliceDepth = depthNorm * depthDim;
        const radiusVoxels = (s.radius_mm || 6) * 1.0;
        const inSlice = Math.abs(sliceDepth - sliceIndex) <= radiusVoxels;

        return inSlice
          ? {
              ...s,
              xPct: xNorm * 100,
              yPct: (1 - yNorm) * 100,
              depthDelta: Math.abs(sliceDepth - sliceIndex),
            }
          : null;
      })
      .filter(Boolean);
  }, [proximity, axis, sliceIndex, sliceInfo, visible]);

  if (!visibleStructures.length) return null;

  return (
    <svg
      className="rr-markers-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      {visibleStructures.map((s) => {
        const color = colorForZone(s.risk_zone);
        return (
          <g key={s.id} transform={`translate(${s.xPct}, ${s.yPct})`}>
            <circle r="1.6" fill={color} stroke="#0B1220" strokeWidth="0.3" />
            <text
              x="2.2"
              y="0.5"
              fill="#E5E7EB"
              fontSize="2"
              dominantBaseline="middle"
              style={{ paintOrder: "stroke", stroke: "#0B1220", strokeWidth: 0.4 }}
            >
              {s.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
