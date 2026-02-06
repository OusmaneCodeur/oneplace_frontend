import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Layout principal côté client (vitrine).
 *
 * - Affiche la barre de navigation en haut
 * - Rend la page courante via `<Outlet />`
 * - Affiche le footer en bas
 *
 * La structure est volontairement simple pour rester lisible
 * et ne modifie pas la disposition validée du site.
 */
export default function ClientLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
