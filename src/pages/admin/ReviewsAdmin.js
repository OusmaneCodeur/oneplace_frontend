import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, ThumbsDown, Trash2 } from "lucide-react";
import {
  getReviews,
  updateReviewStatus,
  deleteReview,
} from "../../services/review.service";
import { getProducts } from "../../services/product.service";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    product: "all",
    rating: "all",
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyDelete, setBusyDelete] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const [r, p] = await Promise.all([getReviews().catch(() => []), getProducts().catch(() => [])]);
      setReviews(Array.isArray(r) ? r : []);
      setProducts(Array.isArray(p) ? p : []);
    } catch (error) {
      toast.error("Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateReviewStatus(id, status);
      toast.success("Statut mis à jour.");
      fetchReviews();
    } catch {
      toast.error("Mise à jour impossible.");
    }
  };

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const productId = r?.product?._id || r?.product;
      const matchProduct = filters.product === "all" || String(productId) === String(filters.product);
      const rating = Number(r?.rating) || 0;
      const matchRating = filters.rating === "all" || rating === Number(filters.rating);
      return matchProduct && matchRating;
    });
  }, [reviews, filters]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => setPage(1), [filters.product, filters.rating]);

  const badgeForStatus = (status) => {
    if (status === "approved") return "op-badge--success";
    if (status === "rejected") return "op-badge--danger";
    return "op-badge--warning";
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setBusyDelete(true);
    try {
      await deleteReview(confirmDeleteId);
      toast.success("Avis supprimé.");
      fetchReviews();
    } catch {
      toast.error("Suppression impossible.");
    } finally {
      setBusyDelete(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="op-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="op-h1">Avis clients</h1>
            <p className="op-sub">CRUD · approbation · filtrage par produit et note.</p>
          </div>
          <span className="op-badge">{filtered.length} résultat(s)</span>
        </div>
      </div>

      <div className="op-card" style={{ padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Produit</div>
            <select
              className="op-select"
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
            >
              <option value="all">Tous</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Note</div>
            <select
              className="op-select"
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            >
              <option value="all">Toutes</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={String(n)}>
                  {n} ★
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="op-card" style={{ padding: 0 }}>
        <div className="op-table-wrap">
          <table className="op-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Client</th>
                <th>Note</th>
                <th>Commentaire</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 18, color: "var(--op-muted)" }}>
                    Chargement…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 18, color: "var(--op-muted)" }}>
                    Aucun avis trouvé
                  </td>
                </tr>
              ) : (
                paged.map((r) => {
                  const productId = r?.product?._id || r?.product;
                  const productName =
                    r?.product?.name ||
                    products.find((p) => String(p._id) === String(productId))?.name ||
                    "—";
                  const status = r?.status || "pending";
                  const userName =
                    r?.user?.name ||
                    [r?.user?.nom, r?.user?.prenom].filter(Boolean).join(" ") ||
                    r?.user?.email ||
                    "—";

                  return (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 900 }}>{productName}</td>
                      <td style={{ color: "var(--op-muted)" }}>{userName}</td>
                      <td style={{ fontWeight: 900 }}>{Number(r.rating) || 0} ★</td>
                      <td style={{ color: "var(--op-muted)", maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.comment || "—"}
                      </td>
                      <td>
                        <span className={`op-badge ${badgeForStatus(status)}`}>{status}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="op-btn-row" style={{ justifyContent: "flex-end" }}>
                          <button className="op-btn op-btn--sm" onClick={() => handleStatus(r._id, "approved")} title="Approuver">
                            <CheckCircle2 size={16} />
                          </button>
                          <button className="op-btn op-btn--sm" onClick={() => handleStatus(r._id, "rejected")} title="Rejeter">
                            <ThumbsDown size={16} />
                          </button>
                          <button className="op-btn op-btn--sm op-btn--danger" onClick={() => setConfirmDeleteId(r._id)} title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 14 }}>
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Supprimer l’avis"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cet avis ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={busyDelete}
        onCancel={() => (busyDelete ? null : setConfirmDeleteId(null))}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
