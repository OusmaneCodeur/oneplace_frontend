import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { getOrderById, getOrders } from "../../services/order.service";

const STATUS_LABELS = {
  pending: "En attente",
  paid: "Validée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const statusBadgeClass = (s) =>
  s === "delivered"
    ? "op-badge--success"
    : s === "cancelled"
      ? "op-badge--danger"
      : s === "pending"
        ? "op-badge--warning"
        : s === "shipped" || s === "preparing"
          ? "op-badge--info"
          : "op-badge--primary";

export default function OrderDetailsAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const o = await getOrderById(id);
        setOrder(o);
      } catch {
        // Fallback: some backends don't expose GET /orders/:id
        try {
          const all = await getOrders();
          const found = (Array.isArray(all) ? all : []).find((x) => String(x?._id) === String(id));
          if (!found) throw new Error("not found");
          setOrder(found);
        } catch {
          toast.error("Impossible de charger la commande.");
          navigate("/admin/orders");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const items = useMemo(() => {
    const list = order?.items || order?.orderItems || order?.products || [];
    return Array.isArray(list) ? list : [];
  }, [order]);

  if (loading) {
    return (
      <div className="op-card" style={{ padding: 16, color: "var(--op-muted)" }}>
        Chargement…
      </div>
    );
  }

  if (!order) return null;

  const status = order?.status || "pending";
  const total = Number(order?.totalPrice) || Number(order?.total) || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="op-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div className="op-btn-row">
            <button className="op-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Retour
            </button>
            <Link className="op-btn op-btn--sm" to="/admin/orders">
              Liste commandes
            </Link>
          </div>
          <span className={`op-badge ${statusBadgeClass(status)}`}>{STATUS_LABELS[status] || status}</span>
        </div>
      </div>

      <div className="op-card" style={{ padding: 16 }}>
        <h1 className="op-h1">Détail commande</h1>
        <p className="op-sub">ID: <span className="op-mono">{order?._id}</span></p>

        <div className="op-divider" style={{ margin: "14px 0" }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <div className="op-card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 900 }}>Client</div>
            <div style={{ color: "var(--op-muted)", marginTop: 8, fontSize: 13 }}>
              <div><strong style={{ color: "var(--op-text)" }}>{order?.user?.name || "—"}</strong></div>
              <div>{order?.user?.email || "—"}</div>
            </div>
          </div>

          <div className="op-card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 900 }}>Paiement</div>
            <div style={{ color: "var(--op-muted)", marginTop: 8, fontSize: 13 }}>
              <div>Mode: {order?.paymentMethod || order?.payment?.method || "—"}</div>
              <div>Total: <strong style={{ color: "var(--op-text)" }}>{total}</strong></div>
            </div>
          </div>

          <div className="op-card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 900 }}>Livraison</div>
            <div style={{ color: "var(--op-muted)", marginTop: 8, fontSize: 13 }}>
              <div>Statut: {order?.deliveryStatus || "—"}</div>
              <div>Date: {order?.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="op-card" style={{ padding: 0 }}>
        <div style={{ padding: 14, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Produits</div>
          <span className="op-badge">{items.length} article(s)</span>
        </div>

        <div className="op-table-wrap">
          <table className="op-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix</th>
                <th>Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 18, color: "var(--op-muted)" }}>
                    Aucun article trouvé
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => {
                  const qty = Number(it?.qty ?? it?.quantity ?? 1) || 1;
                  const price = Number(it?.price ?? it?.product?.price ?? 0) || 0;
                  const name = it?.name || it?.product?.name || "—";
                  return (
                    <tr key={it?._id || idx}>
                      <td style={{ fontWeight: 900 }}>{name}</td>
                      <td style={{ color: "var(--op-muted)" }}>{qty}</td>
                      <td style={{ color: "var(--op-muted)" }}>{price}</td>
                      <td style={{ fontWeight: 900 }}>{qty * price}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

