import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Layers,
    ShoppingCart,
    Users,
    Star,
    Truck,
    Settings,
    LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItemClass = ({ isActive }) =>
    `op-nav-item ${isActive ? "op-nav-item--active" : ""}`;

export default function Sidebar({ onNavigate }) {
    const { user, logout } = useAuth();

    const isAdmin = user?.role === "admin";
    const isModerator = user?.role === "moderator";

    return (
        <div style={{ padding: 14, display: "flex", flexDirection: "column", height: "100%" }}>
            <div className="op-brand" style={{ paddingLeft: 6, paddingRight: 6 }}>
                <div className="op-brand__logo"><img
                    src="/oneplace.png"
                    className="op-brand__img"
                    alt="oneplace"
                />
                </div>
                <div className="op-brand__name">
                    <strong>ONEPLACE</strong>
                    <span>Tout en un seul endroit</span>
                </div>
            </div>

            <div className="op-divider" />

            <nav className="op-nav" style={{ paddingTop: 8 }}>
                <NavLink to="/admin" className={navItemClass} onClick={onNavigate}>
                    <LayoutDashboard />
                    <span className="op-nav-item__label">Dashboard</span>
                </NavLink>
                <NavLink to="/admin/products" className={navItemClass} onClick={onNavigate}>
                    <Package />
                    <span className="op-nav-item__label">Produits</span>
                </NavLink>
                <NavLink to="/admin/categories" className={navItemClass} onClick={onNavigate}>
                    <Layers />
                    <span className="op-nav-item__label">Catégories</span>
                </NavLink>
                <NavLink to="/admin/orders" className={navItemClass} onClick={onNavigate}>
                    <ShoppingCart />
                    <span className="op-nav-item__label">Commandes</span>
                </NavLink>
                {(isAdmin || isModerator) && (
                    <NavLink to="/admin/reviews" className={navItemClass} onClick={onNavigate}>
                        <Star />
                        <span className="op-nav-item__label">Avis</span>
                    </NavLink>
                )}
                {(isAdmin || isModerator) && (
                    <NavLink to="/admin/deliveries" className={navItemClass} onClick={onNavigate}>
                        <Truck />
                        <span className="op-nav-item__label">Livraisons</span>
                    </NavLink>
                )}
                {isAdmin && (
                    <NavLink to="/admin/users" className={navItemClass} onClick={onNavigate}>
                        <Users />
                        <span className="op-nav-item__label">Utilisateurs</span>
                    </NavLink>
                )}
                {isAdmin && (
                    <NavLink to="/admin/settings" className={navItemClass} onClick={onNavigate}>
                        <Settings />
                        <span className="op-nav-item__label">Paramètres</span>
                    </NavLink>
                )}
            </nav>

            <div style={{ flex: 1 }} />

            <div className="op-divider" style={{ margin: "10px 0" }} />

            <button
                className="op-btn op-btn--danger"
                onClick={() => {
                    logout();
                    onNavigate?.();
                }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
            >
                <LogOut size={18} />
                Déconnexion
            </button>
        </div>
    );
}
