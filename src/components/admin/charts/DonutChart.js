const COLORS = [
  "var(--op-primary)",
  "var(--op-primary-2)",
  "var(--op-success)",
  "var(--op-warning)",
  "var(--op-danger)",
  "var(--op-info)",
];

export default function DonutChart({ items, size = 190, stroke = 18 }) {
  const total = (items || []).reduce((acc, it) => acc + (Number(it.value) || 0), 0) || 1;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Répartition">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,.12)"
          strokeWidth={stroke}
        />

        {(items || []).map((it, i) => {
          const v = Number(it.value) || 0;
          const frac = v / total;
          const dash = frac * c;
          const gap = c - dash;
          const seg = (
            <circle
              key={it.label || i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              opacity={v === 0 ? 0 : 1}
            />
          );
          offset += dash;
          return seg;
        })}

        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="var(--op-text)"
          style={{ fontWeight: 900, fontSize: 18 }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="58%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="var(--op-muted)"
          style={{ fontWeight: 700, fontSize: 12 }}
        >
          total
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
        {(items || []).map((it, i) => (
          <div key={it.label || i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                background: COLORS[i % COLORS.length],
                boxShadow: "0 0 0 3px rgba(0,0,0,.15)",
              }}
            />
            <div style={{ flex: 1, color: "var(--op-muted)", fontSize: 13 }}>
              {it.label}
            </div>
            <div style={{ fontWeight: 900 }}>{Number(it.value) || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

