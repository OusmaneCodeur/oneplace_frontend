import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../services/category.service";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";

export default function CategoriesAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const isCreate = location.pathname.endsWith("/create");
    const isEdit = Boolean(id);
    const showForm = isCreate || isEdit;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        q: "",
        status: "all",
    });

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "active",
    });

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [busyDelete, setBusyDelete] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error("Impossible de charger les catégories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        const load = async () => {
            try {
                const category = await getCategoryById(id);
                setForm({
                    name: category?.name || "",
                    description: category?.description || "",
                    status: category?.status || "active",
                });
            } catch {
                toast.error("Impossible de charger la catégorie.");
                navigate("/admin/categories");
            }
        };
        load();
    }, [id, isEdit, navigate]);

    const filtered = useMemo(() => {
        const q = filters.q.trim().toLowerCase();
        return categories.filter((c) => {
            const name = (c?.name || "").toLowerCase();
            const desc = (c?.description || "").toLowerCase();
            const matchQ = !q || name.includes(q) || desc.includes(q);
            const status = c?.status || "active";
            const matchStatus = filters.status === "all" || status === filters.status;
            return matchQ && matchStatus;
        });
    }, [categories, filters]);

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page]);

    useEffect(() => {
        setPage(1);
    }, [filters.q, filters.status]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const resetForm = () => setForm({ name: "", description: "", status: "active" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateCategory(id, form);
                toast.success("Catégorie mise à jour.");
            } else {
                await createCategory(form);
                toast.success("Catégorie créée.");
            }
            resetForm();
            await fetchAll();
            navigate("/admin/categories");
        } catch {
            toast.error("Erreur lors de l’enregistrement.");
        }
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        setBusyDelete(true);
        try {
            await deleteCategory(confirmDeleteId);
            toast.success("Catégorie supprimée.");
            await fetchAll();
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
                        <h1 className="op-h1">Catégories</h1>
                        <p className="op-sub">CRUD · statut · recherche · pagination.</p>
                    </div>
                    {!showForm ? (
                        <Link className="op-btn op-btn--primary" to="/admin/categories/create">
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <Plus size={18} /> Ajouter
                            </span>
                        </Link>
                    ) : (
                        <div className="op-btn-row">
                            <button className="op-btn" type="button" onClick={() => navigate("/admin/categories")}>
                                Annuler
                            </button>
                            <button className="op-btn op-btn--primary" form="category-form" type="submit">
                                Enregistrer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showForm ? (
                <div className="op-card" style={{ padding: 16 }}>
                    <div style={{ fontWeight: 900 }}>{isEdit ? "Modifier une catégorie" : "Ajouter une catégorie"}</div>
                    <div className="op-divider" style={{ margin: "12px 0" }} />

                    <form id="category-form" onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Nom</div>
                            <input className="op-input" name="name" value={form.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Statut</div>
                            <select className="op-select" name="status" value={form.status} onChange={handleChange}>
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Description</div>
                            <textarea className="op-textarea" name="description" value={form.description} onChange={handleChange} />
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="op-card" style={{ padding: 14 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                            <div>
                                <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Recherche</div>
                                <input
                                    className="op-input"
                                    placeholder="Nom / description…"
                                    value={filters.q}
                                    onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Statut</div>
                                <select
                                    className="op-select"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="all">Tous</option>
                                    <option value="active">Actif</option>
                                    <option value="inactive">Inactif</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="op-card" style={{ padding: 0 }}>
                        <div className="op-table-wrap">
                            <table className="op-table">
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Description</th>
                                        <th>Statut</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} style={{ padding: 18, color: "var(--op-muted)" }}>
                                                Chargement…
                                            </td>
                                        </tr>
                                    ) : paged.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ padding: 18, color: "var(--op-muted)" }}>
                                                Aucune catégorie trouvée
                                            </td>
                                        </tr>
                                    ) : (
                                        paged.map((c) => {
                                            const status = c?.status || "active";
                                            return (
                                                <tr key={c._id}>
                                                    <td style={{ fontWeight: 900 }}>{c.name}</td>
                                                    <td style={{ color: "var(--op-muted)", maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {c.description || "—"}
                                                    </td>
                                                    <td>
                                                        <span className={`op-badge ${status === "active" ? "op-badge--success" : "op-badge--warning"}`}>
                                                            {status === "active" ? "Actif" : "Inactif"}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <div className="op-btn-row" style={{ justifyContent: "flex-end" }}>
                                                            <Link className="op-btn op-btn--sm" to={`/admin/categories/edit/${c._id}`} title="Modifier">
                                                                <Pencil size={16} />
                                                            </Link>
                                                            <button className="op-btn op-btn--sm op-btn--danger" onClick={() => setConfirmDeleteId(c._id)} title="Supprimer">
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
                </>
            )}

            <ConfirmDialog
                open={Boolean(confirmDeleteId)}
                title="Supprimer la catégorie"
                message="Cette action est irréversible. Voulez-vous vraiment supprimer cette catégorie ?"
                confirmText="Supprimer"
                cancelText="Annuler"
                loading={busyDelete}
                onCancel={() => (busyDelete ? null : setConfirmDeleteId(null))}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
