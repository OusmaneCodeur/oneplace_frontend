import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
    Star,
    Truck,
    ArrowUpRight,
} from "lucide-react";

import { getProducts } from "../../services/product.service";
import { getUsers } from "../../services/user.service";
import { getOrders } from "../../services/order.service";
import { getCategories } from "../../services/category.service";
import { getReviews } from "../../services/review.service";
import { getDeliveries } from "../../services/delivery.service";
import LineChart from "../../components/admin/charts/LineChart";
import DonutChart from "../../components/admin/charts/DonutChart";
import BarChart from "../../components/admin/charts/BarChart";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [loading, setLoading] = useState(true);
    const [raw, setRaw] = useState({
        products: [],
        users: [],
        orders: [],
        categories: [],
        reviews: [],
        deliveries: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [products, users, orders, categories, reviews, deliveries] =
                    await Promise.all([
                        getProducts().catch(() => []),
                        getUsers().catch(() => []),
                        getOrders().catch(() => []),
                        getCategories().catch(() => []),
                        getReviews().catch(() => []),
                        getDeliveries().catch(() => []),
                    ]);

                setRaw({
                    products: Array.isArray(products) ? products : [],
                    users: Array.isArray(users) ? users : [],
                    orders: Array.isArray(orders) ? orders : [],
                    categories: Array.isArray(categories) ? categories : [],
                    reviews: Array.isArray(reviews) ? reviews : [],
                    deliveries: Array.isArray(deliveries) ? deliveries : [],
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const now = new Date();
    const isSameDay = (a, b) =>
        a &&
        b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const ordersToday = raw.orders.filter((o) =>
        isSameDay(o?.createdAt ? new Date(o.createdAt) : null, now)
    );

    const monthRevenue = raw.orders
        .filter((o) => {
            const d = o?.createdAt ? new Date(o.createdAt) : null;
            return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        })
        .reduce((acc, o) => acc + (Number(o?.totalPrice) || 0), 0);

    const activeUsers = raw.users.filter((u) => u?.isActive).length;

    const pendingDeliveries = raw.deliveries.filter((d) =>
        ["pending", "shipped", "transit", "problem"].includes(d?.status)
    ).length;

    const formatMoney = (n) =>
        new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XOF",
            maximumFractionDigits: 0,
        }).format(Number(n) || 0);

    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const salesByMonth = monthLabels.map((label, idx) => {
        const value = raw.orders
            .filter((o) => {
                const d = o?.createdAt ? new Date(o.createdAt) : null;
                return d && d.getFullYear() === now.getFullYear() && d.getMonth() === idx;
            })
            .reduce((acc, o) => acc + (Number(o?.totalPrice) || 0), 0);
        return { label, value };
    });

    const statusCounts = ["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => ({
        label:
            s === "pending"
                ? "En attente"
                : s === "paid"
                    ? "Validée"
                    : s === "shipped"
                        ? "Expédiée"
                        : s === "delivered"
                            ? "Livrée"
                            : "Annulée",
        value: raw.orders.filter((o) => o?.status === s).length,
    }));

    const categoryNameById = new Map(
        raw.categories.map((c) => [c?._id, c?.name || c?.title || "Catégorie"])
    );
    const productsByCategory = (() => {
        const counts = new Map();
        raw.products.forEach((p) => {
            const cat = p?.category?._id || p?.category;
            const name = cat ? categoryNameById.get(cat) || "Autre" : "Sans catégorie";
            counts.set(name, (counts.get(name) || 0) + 1);
        });
        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label, value]) => ({ label, value }));
    })();

    const StatCard = ({ icon: Icon, label, value, hint, to }) => (
        <div className="op-card op-card--hover" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
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
                    <div style={{ minWidth: 0 }}>
                        <div style={{ color: "var(--op-muted)", fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>
                            {label}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>{value}</div>
                    </div>
                </div>

                {to ? (
                    <Link className="op-btn op-btn--sm" to={to} title="Ouvrir">
                        <ArrowUpRight size={16} />
                    </Link>
                ) : null}
            </div>

            {hint ? <div style={{ color: "var(--op-muted)", fontSize: 12, marginTop: 10 }}>{hint}</div> : null}
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="op-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                        <h1 className="op-h1">Dashboard Admin</h1>
                        <p className="op-sub">
                            Vue d’ensemble e-commerce — stats dynamiques, suivi commandes et performance.
                        </p>
                    </div>
                    <div className="op-badge op-badge--primary">ONEPLACE · Admin</div>
                </div>
            </div>

            {/* KPI */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                }}
            >
                <StatCard
                    icon={Package}
                    label="Total produits"
                    value={loading ? "…" : raw.products.length}
                    hint="Catalogue global"
                    to="/admin/products"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Commandes du jour"
                    value={loading ? "…" : ordersToday.length}
                    hint="Basé sur la date de création"
                    to="/admin/orders"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Revenus mensuels"
                    value={loading ? "…" : formatMoney(monthRevenue)}
                    hint="Somme des commandes du mois"
                />
                <StatCard
                    icon={Users}
                    label="Utilisateurs actifs"
                    value={loading ? "…" : activeUsers}
                    hint="Comptes actifs"
                    to={isAdmin ? "/admin/users" : undefined}
                />
                <StatCard
                    icon={Star}
                    label="Avis clients"
                    value={loading ? "…" : raw.reviews.length}
                    hint="Tous statuts"
                    to="/admin/reviews"
                />
                <StatCard
                    icon={Truck}
                    label="En attente livraison"
                    value={loading ? "…" : pendingDeliveries}
                    hint="pending / shipped / transit"
                    to="/admin/deliveries"
                />
            </div>

            {/* Charts */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                    gap: 12,
                }}
            >
                <div className="op-card" style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                        <div>
                            <div style={{ fontWeight: 900 }}>Courbe des ventes mensuelles</div>
                            <div style={{ color: "var(--op-muted)", fontSize: 12, marginTop: 6 }}>
                                Année {now.getFullYear()} · total mois: {formatMoney(monthRevenue)}
                            </div>
                        </div>
                        <span className="op-badge op-badge--info">Live</span>
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <LineChart data={salesByMonth} />
                    </div>
                </div>

                <div className="op-card" style={{ padding: 14 }}>
                    <div style={{ fontWeight: 900 }}>Commandes par statut</div>
                    <div style={{ color: "var(--op-muted)", fontSize: 12, marginTop: 6 }}>
                        Pending · Validée · Expédiée · Livrée · Annulée
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <DonutChart items={statusCounts} />
                    </div>
                </div>

                <div className="op-card" style={{ padding: 14, gridColumn: "1 / -1" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 900 }}>Répartition des produits par catégorie</div>
                        <span className="op-badge">{productsByCategory.length} catégories</span>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        {productsByCategory.length ? (
                            <BarChart items={productsByCategory} />
                        ) : (
                            <div style={{ color: "var(--op-muted)", fontSize: 13 }}>
                                Données insuffisantes (catégories non liées aux produits).
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
