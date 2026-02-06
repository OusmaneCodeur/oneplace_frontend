import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowUpRight, Package, ShoppingCart, Truck, Users } from "lucide-react";

import { getProducts } from "../../services/product.service";
import { getUsers } from "../../services/user.service";
import { getOrders } from "../../services/order.service";
import { getDeliveries } from "../../services/delivery.service";

function getQuery(search) {
  const params = new URLSearchParams(search);
  return (params.get("q") || "").trim();
}

export default function SearchAdmin() {
  const location = useLocation();
  const navigate = useNavigate();

  const q = useMemo(() => getQuery(location.search), [location.search]);
  const [query, setQuery] = useState(q);

  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState({ products: [], users: [], orders: [], deliveries: [] });

  useEffect(() => setQuery(q), [q]);

  useEffect(() => {
    const run = async () => {
      if (!q) {
        setRaw({ products: [], users: [], orders: [], deliveries: [] });
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [products, users, orders, deliveries] = await Promise.all([
          getProducts().catch(() => []),
          getUsers().catch(() => []),
          getOrders().catch(() => []),
          getDeliveries().catch(() => []),
        ]);
        setRaw({
          products: Array.isArray(products) ? products : [],
          users: Array.isArray(users) ? users : [],
          orders: Array.isArray(orders) ? orders : [],
          deliveries: Array.isArray(deliveries) ? deliveries : [],
        });
      } catch {
        toast.error("Recherche indisponible.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [q]);

  const needle = q.toLowerCase();
  const results = useMemo(() => {
    if (!needle) return { products: [], users: [], orders: [], deliveries: [] };

    const products = raw.products.filter((p) => {
      const name = (p?.name || "").toLowerCase();
      const desc = (p?.description || "").toLowerCase();
      return name.includes(needle) || desc.includes(needle);
    });

    const users = raw.users.filter((u) => {
      const name = (u?.name || "").toLowerCase();
      const email = (u?.email || "").toLowerCase();
      const prenom = (u?.prenom || u?.firstName || "").toLowerCase();
      const nom = (u?.nom || u?.lastName || "").toLowerCase();
      return name.includes(needle) || email.includes(needle) || prenom.includes(needle) || nom.includes(needle);
    });

    const orders = raw.orders.filter((o) => {
      const id = String(o?._id || "").toLowerCase();
      const user = (o?.user?.name || "").toLowerCase();
      const email = (o?.user?.email || "").toLowerCase();
      return id.includes(needle) || user.includes(needle) || email.includes(needle);
    });

    const deliveries = raw.deliveries.filter((d) => {
      const code = String(d?.code || "").toLowerCase();
      const orderCode = String(d?.orderCode || "").toLowerCase();
      const address = String(d?.address || "").toLowerCase();
      return code.includes(needle) || orderCode.includes(needle) || address.includes(needle);
    });

    return { products, users, orders, deliveries };
  }, [raw, needle]);

  const total =
    results.products.length + results.users.length + results.orders.length + results.deliveries.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="op-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="op-h1">Recherche globale</h1>
            <p className="op-sub">Produits · Utilisateurs · Commandes · Livraisons</p>
          </div>
          <span className="op-badge">{q ? `${total} résultat(s)` : "Tapez une recherche"}</span>
        </div>
      </div>

      <div className="op-card" style={{ padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--op-muted)", fontWeight: 800, marginBottom: 6 }}>Rechercher</div>
            <input
              className="op-input"
              placeholder="Nom, email, ID, adresse…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = query.trim();
                  navigate(`/admin/search?q=${encodeURIComponent(val)}`);
                }
              }}
            />
          </div>
          <button
            className="op-btn op-btn--primary"
            onClick={() => navigate(`/admin/search?q=${encodeURIComponent(query.trim())}`)}
            disabled={!query.trim()}
          >
            Rechercher
          </button>
        </div>
      </div>

      {loading ? (
        <div className="op-card" style={{ padding: 16, color: "var(--op-muted)" }}>
          Recherche…
        </div>
      ) : !q ? null : total === 0 ? (
        <div className="op-card" style={{ padding: 16, color: "var(--op-muted)" }}>
          Aucun résultat pour <span className="op-mono">{q}</span>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          <Section
            icon={Package}
            title="Produits"
            count={results.products.length}
            to="/admin/products"
            items={results.products.slice(0, 6).map((p) => ({
              key: p._id,
              label: p.name,
              sub: p.description || "—",
              href: `/admin/products/${p._id}`,
            }))}
          />
          <Section
            icon={Users}
            title="Utilisateurs"
            count={results.users.length}
            to="/admin/users"
            items={results.users.slice(0, 6).map((u) => ({
              key: u._id,
              label: u.name || [u.prenom || u.firstName, u.nom || u.lastName].filter(Boolean).join(" ") || "—",
              sub: u.email || "—",
              href: "/admin/users",
            }))}
          />
          <Section
            icon={ShoppingCart}
            title="Commandes"
            count={results.orders.length}
            to="/admin/orders"
            items={results.orders.slice(0, 6).map((o) => ({
              key: o._id,
              label: `ORD-${String(o._id || "").slice(-6).toUpperCase()}`,
              sub: `${o.user?.name || "—"} · ${o.totalPrice || 0} FCFA`,
              href: `/admin/orders/${o._id}`,
            }))}
          />
          <Section
            icon={Truck}
            title="Livraisons"
            count={results.deliveries.length}
            to="/admin/deliveries"
            items={results.deliveries.slice(0, 6).map((d) => ({
              key: d._id,
              label: d.code || `DLV-${String(d._id || "").slice(-6).toUpperCase()}`,
              sub: d.address || d.orderCode || "—",
              href: "/admin/deliveries",
            }))}
          />
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, count, to, items }) {
  return (
    <div className="op-card op-card--hover" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(91,140,255,.18), rgba(124,58,237,.18))",
              border: "1px solid rgba(148,163,184,.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 900 }}>{title}</div>
            <div style={{ color: "var(--op-muted)", fontSize: 12, marginTop: 4 }}>{count} résultat(s)</div>
          </div>
        </div>
        <Link className="op-btn op-btn--sm" to={to} title="Ouvrir">
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="op-divider" style={{ margin: "12px 0" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.length === 0 ? (
          <div style={{ color: "var(--op-muted)", fontSize: 13 }}>Aucun élément</div>
        ) : (
          items.map((it) => (
            <Link key={it.key} to={it.href} className="op-card op-card--hover" style={{ padding: 10, borderRadius: 14 }}>
              <div style={{ fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.label}
              </div>
              <div style={{ color: "var(--op-muted)", fontSize: 12, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.sub}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

