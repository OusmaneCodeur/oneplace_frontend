import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import {
    getProducts,
    getProductById,
    createProduct, 
    updateProduct,
    deleteProduct,
} from "../../services/product.service";
import { getCategories } from "../../services/category.service";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";

export default function ProductsAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const apiUrl = process.env.REACT_APP_API_URL || "";

    const isCreate = location.pathname.endsWith("/create");
    const isEdit = Boolean(id);
    const showForm = isCreate || isEdit;

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        q: "",
        category: "all",
        status: "all",
        stock: "all", // all | in | out
        minPrice: "",
        maxPrice: "",
    });

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [form, setForm] = useState({
        name: "",
        price: "",
        stock: "",
        description: "",
        category: "",
        status: "active",
        image: "",
        imageFile: null,
    });

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [busyDelete, setBusyDelete] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [p, c] = await Promise.all([
                getProducts().catch(() => []),
                getCategories().catch(() => []),
            ]);
            setProducts(Array.isArray(p) ? p : []);
            setCategories(Array.isArray(c) ? c : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pre-fill search from header quick search (?search=)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const s = params.get("search");
        if (s && typeof s === "string") {
            setFilters((f) => ({ ...f, q: s }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    useEffect(() => {
        if (!isEdit) {
            setForm((f) => ({ ...f, status: "active" }));
            return;
        }

        const load = async () => {
            try {
                const product = await getProductById(id);
                setForm({
                    name: product?.name || "",
                    price: product?.price ?? "",
                    stock: product?.stock ?? "",
                    description: product?.description || "",
                    category: product?.category?._id || product?.category || "",
                    status: product?.status || "active",
                    image: product?.image || "",
                    imageFile: null,
                });
            } catch (e) {
                toast.error("Impossible de charger le produit.");
                navigate("/admin/products");
            }
        };

        load();
    }, [id, isEdit, navigate]);

    const filtered = useMemo(() => {
        const q = filters.q.trim().toLowerCase();

        return products.filter((p) => {
            const name = (p?.name || "").toLowerCase();
            const desc = (p?.description || "").toLowerCase();
            const matchQ = !q || name.includes(q) || desc.includes(q);

            const catId = p?.category?._id || p?.category;
            const matchCat = filters.category === "all" || String(catId) === String(filters.category);

            const status = p?.status || "active";
            const matchStatus = filters.status === "all" || status === filters.status;

            const stock = Number(p?.stock) || 0;
            const matchStock =
                filters.stock === "all" ||
                (filters.stock === "in" ? stock > 0 : stock <= 0);

            const price = Number(p?.price) || 0;
            const min = filters.minPrice === "" ? null : Number(filters.minPrice);
            const max = filters.maxPrice === "" ? null : Number(filters.maxPrice);
            const matchPrice =
                (min === null || price >= min) && (max === null || price <= max);

            return matchQ && matchCat && matchStatus && matchStock && matchPrice;
        });
    }, [products, filters]);

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page]);

    useEffect(() => {
        setPage(1);
    }, [filters.q, filters.category, filters.status, filters.stock, filters.minPrice, filters.maxPrice]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        setForm({ ...form, imageFile: file });
    };

    const resetForm = () =>
        setForm({
            name: "",
            price: "",
            stock: "",
            description: "",
            category: "",
            status: "active",
            image: "",
            imageFile: null,
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("price", form.price);
        formData.append("stock", form.stock);
        formData.append("description", form.description);
        formData.append("category", form.category || "");
        formData.append("status", form.status || "active");
        if (form.imageFile) formData.append("image", form.imageFile);

        try {
            if (isEdit) {
                await updateProduct(id, formData);
                toast.success("Produit mis à jour.");
            } else {
                await createProduct(formData);
                toast.success("Produit créé.");
            }
            resetForm();
            await fetchAll();
            navigate("/admin/products");
        } catch (err) {
            toast.error("Erreur lors de l’enregistrement.");
        }
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        setBusyDelete(true);
        try {
            await deleteProduct(confirmDeleteId);
            toast.success("Produit supprimé.");
            await fetchAll();
        } catch (e) {
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
                        <h1 className="op-h1">Produits</h1>
                        <p className="op-sub">CRUD complet · recherche, filtres, statuts, pagination.</p>
                    </div>
                    {!showForm ? (
                        <Link className="op-btn op-btn--primary" to="/admin/products/create">
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <Plus size={18} /> Ajouter produit
                            </span>
                        </Link>
                    ) : (
                        <div className="op-btn-row">
                            <button className="op-btn" type="button" onClick={() => navigate("/admin/products")}>
                                Annuler
                            </button>
                            <button className="op-btn op-btn--primary" form="product-form" type="submit">
                                Enregistrer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showForm ? (
                <div className="op-card" style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 900 }}>
                            {isEdit ? "Modifier un produit" : "Ajouter un produit"}
                        </div>
                        <span className={`op-badge ${isEdit ? "op-badge--info" : "op-badge--primary"}`}>
                            {isEdit ? "Mode édition" : "Mode création"}
                        </span>
                    </div>
                    <div className="op-divider" style={{ margin: "12px 0" }} />

                    <form id="product-form" onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Nom</div>
                            <input name="name" className="op-input" value={form.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Catégorie</div>
                            <select name="category" className="op-select" value={form.category} onChange={handleChange}>
                                <option value="">—</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Prix</div>
                            <input name="price" className="op-input" value={form.price} onChange={handleChange} inputMode="decimal" required />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Quantité (stock)</div>
                            <input name="stock" className="op-input" value={form.stock} onChange={handleChange} inputMode="numeric" required />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Statut</div>
                            <select name="status" className="op-select" value={form.status} onChange={handleChange}>
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Image</div>
                            <input type="file" onChange={handleImageChange} className="op-input" />
                            {form.image ? (
                                <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                                    <img
                                        src={`${apiUrl}${form.image}`}
                                        alt="preview"
                                        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 14, border: "1px solid var(--op-border)" }}
                                    />
                                    <div style={{ color: "var(--op-muted)", fontSize: 12 }}>
                                        Image actuelle (DB)
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Description</div>
                            <textarea name="description" className="op-textarea" value={form.description} onChange={handleChange} />
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
                                <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Catégorie</div>
                                <select
                                    className="op-select"
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="all">Toutes</option>
                                    {categories.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
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
                            <div>
                                <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Stock</div>
                                <select
                                    className="op-select"
                                    value={filters.stock}
                                    onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
                                >
                                    <option value="all">Tous</option>
                                    <option value="in">En stock</option>
                                    <option value="out">Rupture</option>
                                </select>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Prix min</div>
                                <input
                                    className="op-input"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    inputMode="decimal"
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Prix max</div>
                                <input
                                    className="op-input"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    inputMode="decimal"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="op-card" style={{ padding: 0 }}>
                        <div className="op-table-wrap">
                            <table className="op-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Nom</th>
                                        <th>Catégorie</th>
                                        <th>Prix</th>
                                        <th>Stock</th>
                                        <th>Statut</th>
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
                                                Aucun produit trouvé
                                            </td>
                                        </tr>
                                    ) : (
                                        paged.map((p) => {
                                            const catId = p?.category?._id || p?.category;
                                            const catName =
                                                categories.find((c) => String(c._id) === String(catId))?.name || "—";
                                            const status = p?.status || "active";
                                            const badge =
                                                status === "active"
                                                    ? "op-badge--success"
                                                    : status === "inactive"
                                                        ? "op-badge--warning"
                                                        : "";

                                            return (
                                                <tr key={p._id}>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <div
                                                                style={{
                                                                    width: 46,
                                                                    height: 46,
                                                                    borderRadius: 14,
                                                                    border: "1px solid var(--op-border)",
                                                                    background: "rgba(148,163,184,.06)",
                                                                    overflow: "hidden",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}
                                                            >
                                                                {p?.image ? (
                                                                    <img
                                                                        src={`${apiUrl}${p.image}`}
                                                                        alt={p.name}
                                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ color: "var(--op-muted)", fontSize: 12 }}>—</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 900 }}>{p.name}</div>
                                                        <div style={{ color: "var(--op-muted)", fontSize: 12, marginTop: 4, maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {p.description || "—"}
                                                        </div>
                                                    </td>
                                                    <td style={{ color: "var(--op-muted)" }}>{catName}</td>
                                                    <td style={{ fontWeight: 900 }}>{Number(p.price) || 0}</td>
                                                    <td style={{ color: (Number(p.stock) || 0) > 0 ? "var(--op-text)" : "#FFC0C0", fontWeight: 800 }}>
                                                        {Number(p.stock) || 0}
                                                    </td>
                                                    <td>
                                                        <span className={`op-badge ${badge}`}>{status === "active" ? "Actif" : "Inactif"}</span>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <div className="op-btn-row" style={{ justifyContent: "flex-end" }}>
                                                            <Link className="op-btn op-btn--sm" to={`/admin/products/${p._id}`} title="Voir détails">
                                                                <Eye size={16} />
                                                            </Link>
                                                            <Link className="op-btn op-btn--sm" to={`/admin/products/edit/${p._id}`} title="Modifier">
                                                                <Pencil size={16} />
                                                            </Link>
                                                            <button className="op-btn op-btn--sm op-btn--danger" onClick={() => setConfirmDeleteId(p._id)} title="Supprimer">
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
                title="Supprimer le produit"
                message="Cette action est irréversible. Voulez-vous vraiment supprimer ce produit ?"
                confirmText="Supprimer"
                cancelText="Annuler"
                loading={busyDelete}
                onCancel={() => (busyDelete ? null : setConfirmDeleteId(null))}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
