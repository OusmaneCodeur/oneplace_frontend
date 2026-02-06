const COLORS = [
  "linear-gradient(135deg, var(--op-primary), var(--op-primary-2))",
  "linear-gradient(135deg, var(--op-info), var(--op-primary))",
  "linear-gradient(135deg, var(--op-success), var(--op-info))",
  "linear-gradient(135deg, var(--op-warning), var(--op-primary-2))",
];

export default function BarChart({ items, height = 180 }) {
  const max = Math.max(1, ...(items || []).map((i) => Number(i.value) || 0));

  return (
    <div style={{ height, display: "grid", gridTemplateColumns: `repeat(${Math.max(1, (items || []).length)}, 1fr)`, gap: 10, alignItems: "end" }}>
      {(items || []).map((it, idx) => {
        const v = Number(it.value) || 0;
        const pct = Math.max(0, Math.min(1, v / max));
        return (
          <div key={it.label || idx} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8 }}>
            <div
              title={`${it.label}: ${v}`}
              style={{
                height: `${Math.max(6, pct * (height - 40))}px`,
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,.16)",
                background: COLORS[idx % COLORS.length],
                boxShadow: "0 10px 24px rgba(0,0,0,.22)",
              }}
            />
            <div style={{ color: "var(--op-muted)", fontSize: 11, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {it.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

