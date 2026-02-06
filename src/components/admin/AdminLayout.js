import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

/**
 * Layout global du back‑office (admin / modération).
 *
 * - Sidebar fixe en desktop
 * - Sidebar en mode "drawer" sur mobile
 * - Topbar avec bouton d'ouverture/fermeture du menu
 */
export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Ferme automatiquement le menu mobile à chaque changement de page.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="op-admin">
      {/* Sidebar desktop */}
      <aside className="op-sidebar">
        <div className="op-card op-sidebar__panel">
          <Sidebar />
        </div>
      </aside>

      {/* Overlay + sidebar mobile */}
      {mobileOpen ? (
        <div
          className="op-sidebar-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        />
      ) : null}
      <aside
        className={`op-sidebar op-sidebar--mobile ${
          mobileOpen ? "open" : ""
        }`}
      >
        <div className="op-card op-sidebar__panel">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      <div className="op-main">
        <header className="op-topbar">
          <Header onOpenMenu={() => setMobileOpen((v) => !v)} />
        </header>

        <main className="op-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
