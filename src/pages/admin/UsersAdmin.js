import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Ban, Save, Trash2, UserPlus, X, Eye } from "lucide-react";
import {
    getUsers,
    deleteUser,
    updateUserRole,
    toggleUserStatus
} from "../../services/user.service";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";

const ROLE_STYLES = {
    admin: "op-badge--primary",
    moderator: "op-badge--info",
    user: "",
};

const STATUS_STYLES = {
    active: "op-badge--success",
    blocked: "op-badge--danger",
};

function isUserActive(user) {
    // Par défaut: actif si le champ n'existe pas
    return user?.isActive !== false;
}

function getUserDisplayName(user) {
    const first = user?.prenom || user?.firstName || "";
    const last = user?.nom || user?.lastName || "";
    const full = `${first} ${last}`.trim();
    if (full) return full;
    return user?.name || "—";
}

function roleLabel(role) {
    if (role === "admin") return "Admin";
    if (role === "moderator") return "Modérateur";
    return "Client";
}

function compare(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

export default function UsersAdmin() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all"); // all | active | blocked
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [busyDelete, setBusyDelete] = useState(false);

    const [sort, setSort] = useState({ key: "createdAt", dir: "desc" }); // name | email | role | status | createdAt
    const [roleEdits, setRoleEdits] = useState({}); // { [userId]: role }
    const [savingRoleId, setSavingRoleId] = useState(null);
    const [busyToggleId, setBusyToggleId] = useState(null);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error("Impossible de charger les utilisateurs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users.filter((user) =>
            (() => {
                const name = (getUserDisplayName(user) || "").toLowerCase();
                const email = (user?.email || "").toLowerCase();
                const matchQuery = !q || name.includes(q) || email.includes(q);

                const matchRole = roleFilter === "all" || user?.role === roleFilter;

                const active = isUserActive(user);
                const state = active ? "active" : "blocked";
                const matchStatus = statusFilter === "all" || state === statusFilter;

                return matchQuery && matchRole && matchStatus;
            })()
        );
    }, [users, search, roleFilter, statusFilter]);

    const sortedUsers = useMemo(() => {
        const dir = sort.dir === "asc" ? 1 : -1;
        const list = [...filteredUsers];
        list.sort((ua, ub) => {
            const a = ua || {};
            const b = ub || {};
            const aName = (getUserDisplayName(a) || "").toLowerCase();
            const bName = (getUserDisplayName(b) || "").toLowerCase();
            const aEmail = (a.email || "").toLowerCase();
            const bEmail = (b.email || "").toLowerCase();
            const aRole = (a.role || "").toLowerCase();
            const bRole = (b.role || "").toLowerCase();
            const aStatus = isUserActive(a) ? 1 : 0; // active first
            const bStatus = isUserActive(b) ? 1 : 0;
            const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            let cmp = 0;
            switch (sort.key) {
                case "name":
                    cmp = compare(aName, bName);
                    break;
                case "email":
                    cmp = compare(aEmail, bEmail);
                    break;
                case "role":
                    cmp = compare(aRole, bRole);
                    break;
                case "status":
                    cmp = compare(aStatus, bStatus);
                    break;
                case "createdAt":
                default:
                    cmp = compare(aCreated, bCreated);
                    break;
            }
            return cmp * dir;
        });
        return list;
    }, [filteredUsers, sort]);

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedUsers.slice(start, start + pageSize);
    }, [sortedUsers, page]);

    useEffect(() => setPage(1), [search, roleFilter, statusFilter, sort.key, sort.dir]);

    const toggleSort = (key) => {
        setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    };

    const renderSort = (key) => (sort.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : "");

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        setBusyDelete(true);
        try {
            await deleteUser(confirmDeleteId);
            toast.success("Utilisateur supprimé.");
            fetchUsers();
        } catch {
            toast.error("Suppression impossible.");
        } finally {
            setBusyDelete(false);
            setConfirmDeleteId(null);
        }
    };

    const handleToggleBlock = async (user) => {
        if (!user?._id) return;
        setBusyToggleId(user._id);
        try {
            await toggleUserStatus(user._id);
            toast.success(isUserActive(user) ? "Utilisateur bloqué." : "Utilisateur débloqué.");
            fetchUsers();
        } catch {
            toast.error("Action impossible.");
        } finally {
            setBusyToggleId(null);
        }
    };

    const onRoleChange = (id, role) => {
        setRoleEdits((m) => ({ ...m, [id]: role }));
    };

    const cancelRoleEdit = (id) => {
        setRoleEdits((m) => {
            const copy = { ...m };
            delete copy[id];
            return copy;
        });
    };

    const saveRole = async (user) => {
        const next = roleEdits[user._id];
        if (!next || next === user.role) return;
        setSavingRoleId(user._id);
        try {
            await updateUserRole(user._id, next);
            toast.success("Rôle mis à jour.");
            cancelRoleEdit(user._id);
            fetchUsers();
        } catch {
            toast.error("Mise à jour impossible.");
        } finally {
            setSavingRoleId(null);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="op-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                        <h1 className="op-h1">Utilisateurs</h1>
                        <p className="op-sub">CRUD + rôles · activation/désactivation · permissions Admin.</p>
                    </div>
                    <button
                        className="op-btn op-btn--primary"
                        type="button"
                        disabled
                        title="Prêt à connecter: endpoint de création utilisateur"
                    >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <UserPlus size={18} /> Ajouter utilisateur
                        </span>
                    </button>
                </div>
            </div>

            <div className="op-card" style={{ padding: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                    <div>
                        <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Recherche</div>
                        <input
                            className="op-input"
                            placeholder="Nom, prénom ou email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Rôle</div>
                        <select className="op-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="all">Tous</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Modérateur</option>
                            <option value="user">Client</option>
                        </select>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Statut</div>
                        <select className="op-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Tous</option>
                            <option value="active">Actif</option>
                            <option value="blocked">Bloqué</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                        <span className="op-badge">{sortedUsers.length} résultat(s)</span>
                    </div>
                </div>
            </div>

            <div className="op-card" style={{ padding: 0 }}>
                <div className="op-table-wrap">
                    <table className="op-table">
                        <thead>
                            <tr>
                                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("name")}>
                                    Utilisateur{renderSort("name")}
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("role")}>
                                    Rôle{renderSort("role")}
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("status")}>
                                    Statut{renderSort("status")}
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("createdAt")}>
                                    Inscription{renderSort("createdAt")}
                                </th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 18, color: "var(--op-muted)" }}>
                                        Chargement…
                                    </td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 18, color: "var(--op-muted)" }}>
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : (
                                paged.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <Link to={`/admin/users/${user._id}`} className="op-link" style={{ fontWeight: 900 }}>
                                                {getUserDisplayName(user)}
                                            </Link>
                                            <div style={{ color: "var(--op-muted)", fontSize: 12, marginTop: 4 }}>
                                                {user.email || "—"}
                                            </div>
                                        </td>

                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                <select
                                                    value={roleEdits[user._id] ?? user.role}
                                                    onChange={(e) => onRoleChange(user._id, e.target.value)}
                                                    className="op-select"
                                                    style={{ width: 170, paddingTop: 8, paddingBottom: 8 }}
                                                    disabled={savingRoleId === user._id}
                                                >
                                                    <option value="user">Client</option>
                                                    <option value="moderator">Modérateur</option>
                                                    <option value="admin">Admin</option>
                                                </select>

                                                {roleEdits[user._id] && roleEdits[user._id] !== user.role ? (
                                                    <div className="op-btn-row">
                                                        <button
                                                            className="op-btn op-btn--sm op-btn--primary"
                                                            onClick={() => saveRole(user)}
                                                            type="button"
                                                            disabled={savingRoleId === user._id}
                                                            title="Enregistrer"
                                                        >
                                                            <Save size={16} />
                                                        </button>
                                                        <button
                                                            className="op-btn op-btn--sm"
                                                            onClick={() => cancelRoleEdit(user._id)}
                                                            type="button"
                                                            disabled={savingRoleId === user._id}
                                                            title="Annuler"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`op-badge ${ROLE_STYLES[user.role] || ""}`}>{roleLabel(user.role)}</span>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <span className={`op-badge ${STATUS_STYLES[isUserActive(user) ? "active" : "blocked"]}`}>
                                                {isUserActive(user) ? "Actif" : "Bloqué"}
                                            </span>
                                        </td>

                                        <td style={{ color: "var(--op-muted)" }}>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                                        </td>

                                        <td style={{ textAlign: "right" }}>
                                            <div className="op-btn-row" style={{ justifyContent: "flex-end", gap: 6 }}>
                                                <Link
                                                    to={`/admin/users/${user._id}`}
                                                    className="op-btn op-btn--sm"
                                                    title="Voir le profil"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleBlock(user)}
                                                    className={`op-btn op-btn--sm ${isUserActive(user) ? "op-btn--danger" : "op-btn--primary"}`}
                                                    disabled={busyToggleId === user._id}
                                                    title={isUserActive(user) ? "Bloquer" : "Débloquer"}
                                                >
                                                    <Ban size={16} />
                                                    {isUserActive(user) ? "Bloquer" : "Débloquer"}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(user._id)}
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
                    <Pagination page={page} pageSize={pageSize} total={sortedUsers.length} onPageChange={setPage} />
                </div>
            </div>

            <ConfirmDialog
                open={Boolean(confirmDeleteId)}
                title="Supprimer l’utilisateur"
                message="Cette action est irréversible. Voulez-vous vraiment supprimer cet utilisateur ?"
                confirmText="Supprimer"
                cancelText="Annuler"
                loading={busyDelete}
                onCancel={() => (busyDelete ? null : setConfirmDeleteId(null))}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
