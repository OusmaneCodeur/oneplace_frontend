import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, Search, Shield, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getOrders } from "../../services/order.service";
import { getReviews } from "../../services/review.service";

const TITLES = [
  { prefix: "/admin", title: "Dashboard" },
  { prefix: "/admin/search", title: "Recherche" },
  { prefix: "/admin/products", title: "Produits" },
  { prefix: "/admin/categories", title: "Catégories" },
  { prefix: "/admin/orders", title: "Commandes" },
  { prefix: "/admin/users", title: "Utilisateurs" },
  { prefix: "/admin/reviews", title: "Avis clients" },
  { prefix: "/admin/deliveries", title: "Livraisons" },
  { prefix: "/admin/settings", title: "Paramètres" },
];

function getTitle(pathname) {
  const match = [...TITLES].reverse().find((t) => pathname.startsWith(t.prefix));
  return match?.title || "Admin";
}

export default function Header({ onOpenMenu }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notif, setNotif] = useState({ orders: 0, reviews: 0, total: 0 });
  const notifRef = useRef(null);

  const title = useMemo(() => getTitle(location.pathname), [location.pathname]);
  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "moderator" ? "Modérateur" : "Utilisateur";

  const seenKey = useMemo(() => `op_admin_notif_seen_at_${user?._id || "anon"}`, [user?._id]);
  const getSeenAt = () => {
    const raw = localStorage.getItem(seenKey);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  };
  const setSeenNow = () => {
    localStorage.setItem(seenKey, String(Date.now()));
  };

  const refreshNotif = async () => {
    const seenAt = getSeenAt();
    try {
      const [ordersRes, reviewsRes] = await Promise.all([getOrders().catch(() => []), getReviews().catch(() => [])]);
      const orders = Array.isArray(ordersRes) ? ordersRes : [];
      const reviews = Array.isArray(reviewsRes) ? reviewsRes : []; 

      const newOrders = orders.filter((o) => {
        const t = o?.createdAt ? new Date(o.createdAt).getTime() : 0;
        return t > seenAt;
      }).length;
      const newReviews = reviews.filter((r) => {
        const t = r?.createdAt ? new Date(r.createdAt).getTime() : 0;
        return t > seenAt;
      }).length;

      setNotif({ orders: newOrders, reviews: newReviews, total: newOrders + newReviews });
    } catch {
      // silencieux: ne pas polluer l'UI
    }
  };

  useEffect(() => {
    refreshNotif();
    const id = setInterval(refreshNotif, 45000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenKey]);

  useEffect(() => {
    const onDown = (e) => {
      if (!notifOpen) return;
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

  return (
    <div className="op-topbar__row">
      <div className="op-topbar__left">
        <button className="op-btn op-only-mobile" onClick={onOpenMenu} aria-label="Ouvrir le menu">
          <Menu size={18} />
        </button>

        <div style={{ minWidth: 0 }}>
          <div className="op-h1">{title}</div>
          <p className="op-sub">ONEPLACE</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          className="op-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 14,
          }}
        >
          <Search size={18} color="rgba(148,163,184,.95)" />
          <input
            className="op-input"
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              width: 220,
            }}
            placeholder="Recherche rapide…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim()) {
                navigate(`/admin/search?q=${encodeURIComponent(q.trim())}`);
              }
            }}
          />
        </div>

        <div className="op-notif" ref={notifRef}>
          <button
            className="op-icon-btn"
            type="button"
            aria-label="Notifications"
            onClick={() => {
              const next = !notifOpen;
              setNotifOpen(next);
              if (next) {
                // ouvrir => considérer comme vu
                setSeenNow();
                setNotif({ orders: 0, reviews: 0, total: 0 });
              }
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {notif.total > 0 ? <span className="op-notif-badge" aria-hidden="true">{notif.total > 99 ? "99+" : notif.total}</span> : null}
          </button>

          {notifOpen ? (
            <div className="op-notif-popover" role="dialog" aria-label="Panneau de notifications">
              <div className="op-notif-title">Notifications</div>
              <div className="op-divider" style={{ margin: "10px 0" }} />

              <button
                className="op-notif-item"
                type="button"
                onClick={() => {
                  setNotifOpen(false);
                  navigate("/admin/orders");
                }}
              >
                <span style={{ fontWeight: 900 }}>Commandes</span>
                <span className={`op-badge ${notif.orders > 0 ? "op-badge--warning" : ""}`}>{notif.orders} nouvelle(s)</span>
              </button>

              <button
                className="op-notif-item"
                type="button"
                onClick={() => {
                  setNotifOpen(false);
                  navigate("/admin/reviews");
                }}
              >
                <span style={{ fontWeight: 900 }}>Avis</span>
                <span className={`op-badge ${notif.reviews > 0 ? "op-badge--info" : ""}`}>{notif.reviews} nouveau(x)</span>
              </button>

              <div className="op-divider" style={{ margin: "10px 0" }} />
              <button
                className="op-btn op-btn--sm"
                type="button"
                onClick={() => {
                  refreshNotif();
                }}
              >
                Actualiser
              </button>
            </div>
          ) : null}
        </div>

        <span className={`op-badge ${user?.role === "admin" ? "op-badge--primary" : "op-badge--info"}`}>
          <Shield size={14} />
          {roleLabel}
        </span>

        <span className="op-badge">
          <User size={14} />
          {user?.name || user?.email || "Compte"}
        </span>
      </div>
    </div>
  );
}

