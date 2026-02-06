import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye } from "lucide-react";

import { getDeliveries, updateDeliveryStatus } from "../../services/delivery.service";
import Pagination from "../../components/ui/Pagination";

const STATUS_GROUPS = ["prepared", "shipping", "delivered", "problem"];

function normalizeStatus(s) {
  if (!s) return "prepared";
  const v = String(s).toLowerCase();
  if (v === "pending" || v === "prepared") return "prepared";
  if (v === "shipped" || v === "transit" || v === "shipping") return "shipping";
  if (v === "delivered") return "delivered";
  if (v === "problem" || v === "returned" || v === "issue") return "problem";
  return "prepared";
}

function statusLabel(group) {
  switch (group) {
    case "prepared":
      return "Préparée";
    case "shipping":
      return "En cours d’expédition";
    case "delivered":
      return "Livrée";
    case "problem":
      return "Problème / Retour";
    default:
      return group;
  }
}

function statusClass(group) {
  switch (group) {
    case "prepared":
      return "op-badge--warning";
    case "shipping":
      return "op-badge--info";
    case "delivered":
      return "op-badge--success";
    case "problem":
      return "op-badge--danger";
    default:
      return "";
  }
}

function statusToBackend(group) {
  // Compat: keep current backend values, best-effort "problem"
  switch (group) {
    case "prepared":
      return "pending";
    case "shipping":
      return "shipped";
    case "delivered":
      return "delivered";
    case "problem":
      return "problem";
    default:
      return "pending";
  }
}

function compare(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export default function DeliveriesAdmin() {
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | prepared | shipping | delivered | problem
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [busyId, setBusyId] = useState(null);

  const [sort, setSort] = useState({ key: "shipDate", dir: "desc" }); // code | order | shipDate | status

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await getDeliveries();
      setDeliveries(Array.isArray(res) ? res : []);
    } catch {
      toast.error("Impossible de charger les livraisons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deliveries.filter((d) => {
      const code = String(d?.code || d?._id || "").toLowerCase();
      const orderCode = String(d?.orderCode || "").toLowerCase();
      const address = String(d?.address || "").toLowerCase();
      const orderId = String(d?.order?._id || d?.order || d?.orderId || "").toLowerCase();

      const matchSearch = !q || code.includes(q) || orderCode.includes(q) || address.includes(q) || orderId.includes(q);

      const group = normalizeStatus(d?.status);
      const matchStatus = statusFilter === "all" || group === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [deliveries, search, statusFilter]);

  const sorted = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const list = [...filtered];
    list.sort((da, db) => {
      const a = da || {};
      const b = db || {};

      const aCode = String(a.code || a._id || "").toLowerCase();
      const bCode = String(b.code || b._id || "").toLowerCase();

      const aOrder = String(a.orderCode || a.order?._id || a.order || a.orderId || "").toLowerCase();
      const bOrder = String(b.orderCode || b.order?._id || b.order || b.orderId || "").toLowerCase();

      const aGroup = normalizeStatus(a.status);
      const bGroup = normalizeStatus(b.status);

      const aShip = a.shippedAt || a.shippingDate || a.updatedAt || a.createdAt;
      const bShip = b.shippedAt || b.shippingDate || b.updatedAt || b.createdAt;
      const aShipT = aShip ? new Date(aShip).getTime() : 0;
      const bShipT = bShip ? new Date(bShip).getTime() : 0;

      let cmp = 0;
      switch (sort.key) {
        case "code":
          cmp = compare(aCode, bCode);
          break;
        case "order":
          cmp = compare(aOrder, bOrder);
          break;
        case "status":
          cmp = compare(aGroup, bGroup);
          break;
        case "shipDate":
        default:
          cmp = compare(aShipT, bShipT);
          break;
      }
      return cmp * dir;
    });
    return list;
  }, [filtered, sort]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  useEffect(() => setPage(1), [search, statusFilter, sort.key, sort.dir]);

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };
  const renderSort = (key) => (sort.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : "");

  const handleStatusUpdate = async (delivery, group) => {
    const id = delivery?._id;
    if (!id) return;

    const next = statusToBackend(group);
    const payload = { status: next };
    if (group === "shipping" && !delivery?.shippedAt) payload.shippedAt = new Date().toISOString();

    setBusyId(id);
    try {
      await updateDeliveryStatus(id, payload);
      toast.success("Statut de livraison mis à jour.");
      fetchDeliveries();
    } catch {
      toast.error("Mise à jour impossible.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="op-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="op-h1">Livraisons</h1>
            <p className="op-sub">Créées automatiquement après validation d’une commande · modification statut uniquement.</p>
          </div>
          <span className="op-badge">{sorted.length} livraison(s)</span>
        </div>
      </div>

      <div className="op-card" style={{ padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Recherche</div>
            <input
              className="op-input"
              placeholder="Commande, code, adresse…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Statut</div>
            <select className="op-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous</option>
              <option value="prepared">Préparée</option>
              <option value="shipping">En cours d’expédition</option>
              <option value="delivered">Livrée</option>
              <option value="problem">Problème / Retour</option>
            </select>
          </div>
        </div>
      </div>

      <div className="op-card" style={{ padding: 0 }}>
        <div className="op-table-wrap">
          <table className="op-table">
            <thead>
              <tr>
                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("code")}>
                  Livraison{renderSort("code")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("order")}>
                  Commande{renderSort("order")}
                </th>
                <th>Adresse</th>
                <th>Transporteur</th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("shipDate")}>
                  Date d’expédition{renderSort("shipDate")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("status")}>
                  Statut{renderSort("status")}
                </th>
                <th style={{ textAlign: "right" }}>Détails</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 18, color: "var(--op-muted)" }}>
                    Chargement…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 18, color: "var(--op-muted)" }}>
                    Aucune livraison trouvée
                  </td>
                </tr>
              ) : (
                paged.map((d) => {
                  const group = normalizeStatus(d?.status);
                  const orderId = d?.order?._id || d?.order || d?.orderId;
                  const shipDate = d?.shippedAt || d?.shippingDate;
                  return (
                    <tr key={d._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="op-badge op-badge--info">🚚</span>
                          <span className="op-mono" style={{ fontWeight: 900 }}>
                            {d.code || `DLV-${String(d._id || "").slice(-6).toUpperCase()}`}
                          </span>
                        </div>
                      </td>
                      <td className="op-mono" style={{ color: "var(--op-muted)" }}>
                        {d.orderCode || (orderId ? `ORD-${String(orderId).slice(-6).toUpperCase()}` : "—")}
                      </td>
                      <td style={{ color: "var(--op-muted)", maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.address || "—"}
                      </td>
                      <td style={{ color: "var(--op-muted)" }}>{d.carrier || "Auto"}</td>
                      <td style={{ color: "var(--op-muted)" }}>{shipDate ? new Date(shipDate).toLocaleDateString() : "—"}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span className={`op-badge ${statusClass(group)}`}>{statusLabel(group)}</span>
                          <select
                            className="op-select"
                            value={group}
                            onChange={(e) => handleStatusUpdate(d, e.target.value)}
                            disabled={busyId === d._id}
                            style={{ width: 210, paddingTop: 8, paddingBottom: 8 }}
                          >
                            {STATUS_GROUPS.map((g) => (
                              <option key={g} value={g}>
                                {statusLabel(g)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {orderId ? (
                          <Link className="op-btn op-btn--sm" to={`/admin/orders/${orderId}`} title="Voir la commande">
                            <Eye size={16} />
                          </Link>
                        ) : (
                          <span className="op-badge">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 14 }}>
          <Pagination page={page} pageSize={pageSize} total={sorted.length} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

