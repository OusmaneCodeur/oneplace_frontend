import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Ban, Save, User, ShoppingCart, Star } from "lucide-react";
import { getUserById, toggleUserStatus, updateUserRole } from "../../services/user.service";
import { getOrders } from "../../services/order.service";
import { getReviews } from "../../services/review.service";

const STATUS_LABELS = {
    pending: "En attente",
    paid: "Validée",
    preparing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
};

function getDisplayName(u) {
    if (!u) return "—";
    const first = u.prenom || u.firstName || "";
    const last = u.nom || u.lastName || "";
    const full = `${first} ${last}`.trim();
    return full || u.name || "—";
}

function isActive(user) {
    return user?.isActive !== false;
}

export default function UserDetailAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleEdit, setRoleEdit] = useState(null);
    const [savingRole, setSavingRole] = useState(false);
    const [busyToggle, setBusyToggle] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [u, allOrders, allReviews] = await Promise.all([
                    getUserById(id).catch(() => null),
                    getOrders().catch(() => []),
                    getReviews().catch(() => []),
                ]);
                setUser(u);
                const orderList = Array.isArray(allOrders) ? allOrders : [];
                setOrders(orderList.filter((o) => (o.user?._id || o.user) === id));
                const reviewList = Array.isArray(allReviews) ? allReviews : [];
                setReviews(reviewList.filter((r) => (r.user?._id || r.user) === id));
            } catch {
                toast.error("Impossible de charger le profil.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleToggleBlock = async () => {
        if (!user?._id || busyToggle) return;
        setBusyToggle(true);
        try {
            await toggleUserStatus(user._id);
            toast.success(isActive(user) ? "Utilisateur bloqué." : "Utilisateur débloqué.");
            setUser((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));
        } catch {
            toast.error("Action impossible.");
        } finally {
            setBusyToggle(false);
        }
    };

    const saveRole = async () => {
        if (!user?._id || roleEdit === null || roleEdit === user.role) return;
        setSavingRole(true);
        try {
            await updateUserRole(user._id, roleEdit);
            toast.success("Rôle mis à jour.");
            setUser((prev) => (prev ? { ...prev, role: roleEdit } : null));
            setRoleEdit(null);
        } catch {
            toast.error("Mise à jour impossible.");
        } finally {
            setSavingRole(false);
        }
    };

    if (loading) {
        return (
            <div className="op-card" style={{ padding: 24, textAlign: "center" }}>
                Chargement…
            </div>
        );
    }
    if (!user) {
        return (
            <div className="op-card" style={{ padding: 24 }}>
                <p>Utilisateur introuvable.</p>
                <Link to="/admin/users" className="op-btn op-btn--primary">Retour aux utilisateurs</Link>
            </div>
        );
    }

    const active = isActive(user);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="op-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className="op-btn op-btn--sm"
                        onClick={() => navigate("/admin/users")}
                        aria-label="Retour"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="op-h1" style={{ margin: 0 }}>Profil utilisateur</h1>
                </div>
            </div>

            <div className="op-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: "var(--op-bg-hover)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <User size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>{getDisplayName(user)}</div>
                        <div style={{ color: "var(--op-muted)", fontSize: 13 }}>{user.email || "—"}</div>
                        <span className={`op-badge ${active ? "op-badge--success" : "op-badge--danger"}`} style={{ marginTop: 4 }}>
                            {active ? "Actif" : "Bloqué"}
                        </span>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 14 }}>
                    <div><strong>Téléphone</strong><div style={{ color: "var(--op-muted)" }}>{user.phoneNumber || "—"}</div></div>
                    <div><strong>Rôle</strong>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <select
                                className="op-select"
                                value={roleEdit ?? user.role}
                                onChange={(e) => setRoleEdit(e.target.value)}
                                style={{ width: 140 }}
                            >
                                <option value="client">Client</option>
                                <option value="moderator">Modérateur</option>
                                <option value="admin">Admin</option>
                            </select>
                            {roleEdit != null && roleEdit !== user.role && (
                                <button
                                    type="button"
                                    className="op-btn op-btn--sm op-btn--primary"
                                    disabled={savingRole}
                                    onClick={saveRole}
                                >
                                    <Save size={14} /> Enregistrer
                                </button>
                            )}
                        </div>
                    </div>
                    <div><strong>Inscription</strong><div style={{ color: "var(--op-muted)" }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div></div>
                </div>

                <div className="op-btn-row">
                    <button
                        type="button"
                        className={`op-btn ${active ? "op-btn--danger" : "op-btn--primary"}`}
                        disabled={busyToggle}
                        onClick={handleToggleBlock}
                    >
                        <Ban size={16} /> {active ? "Bloquer" : "Débloquer"}
                    </button>
                </div>
            </div>

            <div className="op-card" style={{ padding: 16 }}>
                <h2 className="op-h2" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <ShoppingCart size={20} /> Historique des commandes ({orders.length})
                </h2>
                {orders.length === 0 ? (
                    <p style={{ color: "var(--op-muted)" }}>Aucune commande.</p>
                ) : (
                    <div className="op-table-wrap">
                        <table className="op-table">
                            <thead>
                                <tr>
                                    <th>Commande</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o) => (
                                    <tr key={o._id}>
                                        <td className="op-mono">ORD-{String(o._id || "").slice(-6).toUpperCase()}</td>
                                        <td>{o.totalPrice != null ? `${Number(o.totalPrice).toLocaleString()} FCFA` : "—"}</td>
                                        <td><span className="op-badge">{STATUS_LABELS[o.status] || o.status}</span></td>
                                        <td style={{ color: "var(--op-muted)" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                                        <td><Link to={`/admin/orders/${o._id}`} className="op-btn op-btn--sm">Voir</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="op-card" style={{ padding: 16 }}>
                <h2 className="op-h2" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Star size={20} /> Avis ({reviews.length})
                </h2>
                {reviews.length === 0 ? (
                    <p style={{ color: "var(--op-muted)" }}>Aucun avis.</p>
                ) : (
                    <div className="op-table-wrap">
                        <table className="op-table">
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>Note</th>
                                    <th>Commentaire</th>
                                    <th>Statut</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((r) => (
                                    <tr key={r._id}>
                                        <td>{r.product?.name || r.product || "—"}</td>
                                        <td>{r.rating ?? "—"}/5</td>
                                        <td style={{ maxWidth: 200 }}>{r.comment || "—"}</td>
                                        <td><span className="op-badge">{r.status || "—"}</span></td>
                                        <td style={{ color: "var(--op-muted)" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
