export default function LineChart({ data, height = 180 }) {
  const w = 560;
  const h = height;
  const pad = 18;

  const values = (data || []).map((d) => Number(d.value) || 0);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = Math.max(1, max - min);

  const points = (data || []).map((d, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, (data.length || 1) - 1);
    const v = Number(d.value) || 0;
    const y = pad + ((max - v) * (h - pad * 2)) / span;
    return { x, y, v, label: d.label };
  });

  const dLine =
    points.length === 0
      ? ""
      : points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
          .join(" ");

  const dArea =
    points.length === 0
      ? ""
      : `${dLine} L ${(pad + (w - pad * 2)).toFixed(2)} ${(h - pad).toFixed(2)} L ${pad.toFixed(
          2
        )} ${(h - pad).toFixed(2)} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="Graphique des ventes">
      <defs>
        <linearGradient id="opLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--op-primary)" />
          <stop offset="100%" stopColor="var(--op-primary-2)" />
        </linearGradient>
        <linearGradient id="opArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(91,140,255,.22)" />
          <stop offset="100%" stopColor="rgba(124,58,237,.02)" />
        </linearGradient>
      </defs>

      {/* grid */}
      {[0, 1, 2, 3].map((i) => {
        const y = pad + (i * (h - pad * 2)) / 3;
        return <line key={i} x1={pad} x2={w - pad} y1={y} y2={y} stroke="rgba(148,163,184,.10)" />;
      })}

      {dArea ? <path d={dArea} fill="url(#opArea)" /> : null}
      {dLine ? (
        <path
          d={dLine}
          fill="none"
          stroke="url(#opLine)"
          strokeWidth="3.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}

      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r="3.4" fill="rgba(229,231,235,.95)" stroke="url(#opLine)" />
      ))}
    </svg>
  );
}

