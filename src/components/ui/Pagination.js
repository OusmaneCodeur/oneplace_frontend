export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const go = (p) => onPageChange?.(Math.min(totalPages, Math.max(1, p)));

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingTop: 12,
      }}
    >
      <div style={{ color: "var(--op-muted)", fontSize: 13 }}>
        Page{" "}
        <span style={{ color: "var(--op-text)", fontWeight: 800 }}>
          {page}
        </span>{" "}
        /{" "}
        <span style={{ color: "var(--op-text)", fontWeight: 800 }}>
          {totalPages}
        </span>
      </div>

      <div className="op-btn-row">
        <button
          className="op-btn op-btn--sm"
          onClick={() => go(1)}
          disabled={!canPrev}
        >
          «
        </button>
        <button
          className="op-btn op-btn--sm"
          onClick={() => go(page - 1)}
          disabled={!canPrev}
        >
          Précédent
        </button>
        <button
          className="op-btn op-btn--sm"
          onClick={() => go(page + 1)}
          disabled={!canNext}
        >
          Suivant
        </button>
        <button
          className="op-btn op-btn--sm"
          onClick={() => go(totalPages)}
          disabled={!canNext}
        >
          »
        </button>
      </div>
    </div>
  );
}

