import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, Trash2 } from "lucide-react";
import {
    getOrders,
    updateOrderStatus,
    deleteOrder
} from "../../services/order.service";
import { createDelivery, getDeliveries } from "../../services/delivery.service";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";

const STATUS_STYLES = {
    pending: "op-badge--warning",
    paid: "op-badge--primary",
    preparing: "op-badge--info",
    shipped: "op-badge--info",
    delivered: "op-badge--success",
    cancelled: "op-badge--danger",
};

const STATUS_LABELS = {
    pending: "En attente",
    paid: "Validée",
    preparing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
};

function compare(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

function orderCodeFrom(order) {
    if (order?.code) return String(order.code);
    if (order?.orderCode) return String(order.orderCode);
    const id = String(order?._id || "");
    return id ? `ORD-${id.slice(-6).toUpperCase()}` : "ORD-—";
}

function buildAddress(order) {
    const addr = order?.shippingAddress || order?.deliveryAddress || order?.address;
    if (!addr) return "";
    if (typeof addr === "string") return addr;
    const parts = [
        addr.address || addr.line1,
        addr.city,
        addr.state,
        addr.zip || addr.postalCode,
        addr.country,
    ].filter(Boolean);
    return parts.join(", ");
}

export default function OrdersAdmin() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [busyDelete, setBusyDelete] = useState(false);
    const [sort, setSort] = useState({ key: "createdAt", dir: "desc" }); // createdAt | total | status | customer

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error("Impossible de charger les commandes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        return orders.filter((order) => {
            const matchSearch =
                !q ||
                order?._id?.toLowerCase().includes(q) ||
                order?.user?.name?.toLowerCase().includes(q) ||
                order?.user?.email?.toLowerCase().includes(q);

            const matchStatus =
                statusFilter === "all" || order?.status === statusFilter;

            return matchSearch && matchStatus;
        });
    }, [orders, search, statusFilter]);

    const sortedOrders = useMemo(() => {
        const dir = sort.dir === "asc" ? 1 : -1;
        const list = [...filteredOrders];
        list.sort((oa, ob) => {
            const a = oa || {};
            const b = ob || {};
            const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const aTotal = Number(a.totalPrice) || 0;
            const bTotal = Number(b.totalPrice) || 0;
            const aStatus = String(a.status || "").toLowerCase();
            const bStatus = String(b.status || "").toLowerCase();
            const aCust = String(a.user?.name || a.user?.email || "").toLowerCase();
            const bCust = String(b.user?.name || b.user?.email || "").toLowerCase();

            let cmp = 0;
            switch (sort.key) {
                case "total":
                    cmp = compare(aTotal, bTotal);
                    break;
                case "status":
                    cmp = compare(aStatus, bStatus);
                    break;
                case "customer":
                    cmp = compare(aCust, bCust);
                    break;
                case "createdAt":
                default:
                    cmp = compare(aCreated, bCreated);
                    break;
            }
            return cmp * dir;
        });
        return list;
    }, [filteredOrders, sort]);

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedOrders.slice(start, start + pageSize);
    }, [sortedOrders, page]);

    useEffect(() => setPage(1), [search, statusFilter, sort.key, sort.dir]);

    const toggleSort = (key) => {
        setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    };
    const renderSort = (key) => (sort.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : "");

    const ensureDeliveryForOrder = async (order) => {
        const id = order?._id;
        if (!id) return { ok: false };

        const orderCode = orderCodeFrom(order);
        try {
            const deliveries = await getDeliveries().catch(() => []);
            const list = Array.isArray(deliveries) ? deliveries : [];
            const exists = list.some((d) => {
                const dOrderId = d?.order?._id || d?.order || d?.orderId;
                return String(dOrderId || "") === String(id) || String(d?.orderCode || "") === String(orderCode);
            });
            if (exists) return { ok: true, existed: true };

            const payload = {
                order: id,
                orderId: id,
                orderCode,
                address: buildAddress(order),
                carrier: order?.carrier || order?.shippingMethod?.carrier || "Auto",
                status: "pending",
            };

            await createDelivery(payload);
            return { ok: true, created: true };
        } catch {
            return { ok: false };
        }
    };

    const handleStatusChange = async (order, status) => {
        try {
            const prev = order?.status;
            await updateOrderStatus(order._id, status);
            toast.success("Statut mis à jour.");

            // Validation => livraison auto
            if (prev !== "paid" && status === "paid") {
                const res = await ensureDeliveryForOrder(order);
                if (res.created) toast.success("Livraison générée automatiquement.");
                else if (res.existed) toast.info("Livraison déjà existante.");
                else toast.warn("Commande validée, livraison non générée (API).");
            }

            fetchOrders();
        } catch {
            toast.error("Mise à jour impossible.");
        }
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        setBusyDelete(true);
        try {
            await deleteOrder(confirmDeleteId);
            toast.success("Commande supprimée.");
            fetchOrders();
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
                        <h1 className="op-h1">Commandes</h1>
                        <p className="op-sub">CRUD + statut · recherche · filtres · détail commande.</p>
                    </div>
                    <span className="op-badge">{sortedOrders.length} résultat(s)</span>
                </div>
            </div>

            <div className="op-card" style={{ padding: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                    <div>
                        <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Recherche</div>
                        <input
                            className="op-input"
                            placeholder="Client, email ou ID…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Statut</div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="op-select"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="paid">Validée</option>
                            <option value="preparing">En préparation</option>
                            <option value="shipped">Expédiée</option>
                            <option value="delivered">Livrée</option>
                            <option value="cancelled">Annulée</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="op-card" style={{ padding: 0 }}>
                <div className="op-table-wrap">
                    <table className="op-table">
                        <thead>
                            <tr>
                                <th>Commande</th>
                                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("customer")}>
                                    Client{renderSort("customer")}
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("total")}>
                                    Montant{renderSort("total")}
                                </th>
                                <th>Articles</th>
                                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("createdAt")}>
                                    Date{renderSort("createdAt")}
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("status")}>
                                    Statut{renderSort("status")}
                                </th>
                                <th style={{ textAlign: "right" }}>Actions</th>
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
                                        Aucune commande trouvée
                                    </td>
                                </tr>
                            ) : (
                                paged.map((order) => (
                                    <tr key={order._id}>
                                        <td className="op-mono" style={{ fontWeight: 900 }}>
                                            ORD-{String(order._id || "").slice(-6).toUpperCase()}
                                        </td>

                                        <td>
                                            <div style={{ fontWeight: 900 }}>{order.user?.name || "—"}</div>
                                            <div style={{ color: "var(--op-muted)", fontSize: 12, marginTop: 4 }}>
                                                {order.user?.email || "—"}
                                            </div>
                                        </td>

                                        <td style={{ fontWeight: 900 }}>{order.totalPrice || 0} FCFA</td>

                                        <td style={{ color: "var(--op-muted)" }}>
                                            {order.items?.length || order.orderItems?.length || 0}
                                        </td>

                                        <td style={{ color: "var(--op-muted)" }}>
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                                        </td>

                                        <td>
                                            <span className={`op-badge ${STATUS_STYLES[order.status] || ""}`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>
                                        </td>

                                        <td style={{ textAlign: "right" }}>
                                            <div className="op-btn-row" style={{ justifyContent: "flex-end" }}>
                                                <Link className="op-btn op-btn--sm" to={`/admin/orders/${order._id}`} title="Voir détails">
                                                    <Eye size={16} />
                                                </Link>

                                                <select
                                                    value={order.status || "pending"}
                                                    onChange={(e) => handleStatusChange(order, e.target.value)}
                                                    className="op-select"
                                                    style={{ width: 160, paddingTop: 8, paddingBottom: 8 }}
                                                >
                                                    <option value="pending">En attente</option>
                                                    <option value="paid">Validée</option>
                                                    <option value="preparing">En préparation</option>
                                                    <option value="shipped">Expédiée</option>
                                                    <option value="delivered">Livrée</option>
                                                    <option value="cancelled">Annulée</option>
                                                </select>

                                                <button
                                                    onClick={() => setConfirmDeleteId(order._id)}
                                                    className="op-btn op-btn--sm op-btn--danger"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: 14 }}>
                    <Pagination page={page} pageSize={pageSize} total={sortedOrders.length} onPageChange={setPage} />
                </div>
            </div>

            <ConfirmDialog
                open={Boolean(confirmDeleteId)}
                title="Supprimer la commande"
                message="Cette action est irréversible. Voulez-vous vraiment supprimer cette commande ?"
                confirmText="Supprimer"
                cancelText="Annuler"
                loading={busyDelete}
                onCancel={() => (busyDelete ? null : setConfirmDeleteId(null))}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
