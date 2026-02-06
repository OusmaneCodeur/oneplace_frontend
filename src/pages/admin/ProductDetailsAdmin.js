import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Pencil } from "lucide-react";
import { getProductById } from "../../services/product.service";
import { getCategories } from "../../services/category.service";

export default function ProductDetailsAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || "";

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, c] = await Promise.all([
          getProductById(id),
          getCategories().catch(() => []),
        ]);
        setProduct(p);
        setCategories(Array.isArray(c) ? c : []);
      } catch {
        toast.error("Impossible de charger le produit.");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="op-card" style={{ padding: 16, color: "var(--op-muted)" }}>
        Chargement…
      </div>
    );
  }

  if (!product) return null;

  const catId = product?.category?._id || product?.category;
  const catName = categories.find((c) => String(c._id) === String(catId))?.name || "—";
  const status = product?.status || "active";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="op-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div className="op-btn-row">
            <button className="op-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Retour
            </button>
            <Link className="op-btn op-btn--sm" to="/admin/products">
              Liste produits
            </Link>
          </div>
          <Link className="op-btn op-btn--primary" to={`/admin/products/edit/${product._id}`}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Pencil size={18} /> Modifier
            </span>
          </Link>
        </div>
      </div>

      <div className="op-card" style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 18,
                  border: "1px solid var(--op-border)",
                  overflow: "hidden",
                  background: "rgba(148,163,184,.06)",
                }}
              >
                {product?.image ? (
                  <img src={`${apiUrl}${product.image}`} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="op-h1">{product?.name}</div>
                <div className="op-sub">{catName}</div>
                <div style={{ marginTop: 8 }}>
                  <span className={`op-badge ${status === "active" ? "op-badge--success" : "op-badge--warning"}`}>
                    {status === "active" ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="op-card" style={{ padding: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              <div>
                <div style={{ color: "var(--op-muted)", fontSize: 12, fontWeight: 800 }}>Prix</div>
                <div style={{ fontWeight: 900, marginTop: 6 }}>{Number(product?.price) || 0}</div>
              </div>
              <div>
                <div style={{ color: "var(--op-muted)", fontSize: 12, fontWeight: 800 }}>Stock</div>
                <div style={{ fontWeight: 900, marginTop: 6 }}>{Number(product?.stock) || 0}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ color: "var(--op-muted)", fontSize: 12, fontWeight: 800 }}>ID</div>
                <div className="op-mono" style={{ marginTop: 6, color: "var(--op-muted)" }}>{product?._id}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="op-divider" style={{ margin: "14px 0" }} />

        <div>
          <div style={{ fontWeight: 900 }}>Description</div>
          <p style={{ color: "var(--op-muted)", marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>
            {product?.description || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

