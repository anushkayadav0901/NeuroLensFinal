const ALL_MODALITIES = ["flair", "t1", "t1ce", "t2"];

export default function HeatmapControls({
  available = [],
  enabled,
  onToggle,
  modality,
  onModalityChange,
  opacity,
  onOpacityChange,
  uncertainty,
  onUncertaintyChange,
}) {
  const modalitiesToShow = ALL_MODALITIES.filter((m) => available.includes(m));
  const hasModalities = modalitiesToShow.length > 0;

  return (
    <div className="hm-controls">
      <div className="hm-controls-row">
        <button
          type="button"
          className={`hm-toggle ${enabled ? "active" : ""}`}
          onClick={() => onToggle?.(!enabled)}
        >
          {enabled ? "Hide" : "Show"} AI attention heatmap
        </button>

        {hasModalities && (
          <div className="hm-modality-group">
            {modalitiesToShow.map((m) => (
              <button
                key={m}
                type="button"
                className={`hm-modality-btn ${modality === m ? "active" : ""}`}
                onClick={() => onModalityChange?.(m)}
                disabled={!enabled}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {enabled && (
        <div className="hm-controls-row hm-controls-secondary">
          <label className="hm-opacity-label">
            Opacity
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round((opacity ?? 0.6) * 100)}
              onChange={(e) => onOpacityChange?.(Number(e.target.value) / 100)}
            />
            <span className="hm-opacity-value">
              {Math.round((opacity ?? 0.6) * 100)}%
            </span>
          </label>

          <label className="hm-uncertainty-toggle">
            <input
              type="checkbox"
              checked={Boolean(uncertainty)}
              onChange={(e) => onUncertaintyChange?.(e.target.checked)}
            />
            Show uncertainty (inferno palette)
          </label>
        </div>
      )}
    </div>
  );
}
