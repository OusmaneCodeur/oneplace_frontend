import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyOrders } from "../../services/order.service";

// Libellés lisibles pour les statuts de commande.
const STATUS_LABELS = {
  pending: "En attente",
  paid: "Validée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

// Couleurs Bootstrap associées aux statuts.
const STATUS_BADGE = {
  pending: "warning",
  paid: "primary",
  preparing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

/**
 * Espace compte client.
 *
 * - Affiche les informations de base du profil
 * - Liste l'historique des commandes du client connecté
 * - Permet de se déconnecter
 *
 * La sécurisation d'accès repose sur l'état d'authentification global (`useAuth`).
 */
export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("orders");

  useEffect(() => {
    if (!user) {
      // Si l'utilisateur n'est pas connecté, on le redirige vers le login.
      navigate("/login", { replace: true });
      return;
    }

    getMyOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  const displayName =
    [user.prenom, user.nom].filter(Boolean).join(" ") ||
    user.email ||
    "Compte";

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold">Mon compte</h5>
              <p className="text-muted small mb-3">{displayName}</p>
              <p className="text-muted small mb-0">{user.email}</p>
              <hr />
              <nav className="nav flex-column">
                <button
                  type="button"
                  className={`nav-link text-start border-0 bg-transparent py-2 ${
                    tab === "orders"
                      ? "fw-bold text-primary"
                      : "text-dark"
                  }`}
                  onClick={() => setTab("orders")}
                >
                  Mes commandes
                </button>
                <button
                  type="button"
                  className={`nav-link text-start border-0 bg-transparent py-2 ${
                    tab === "profile"
                      ? "fw-bold text-primary"
                      : "text-dark"
                  }`}
                  onClick={() => setTab("profile")}
                >
                  Mon profil
                </button>
                <button
                  type="button"
                  className="nav-link text-start border-0 bg-transparent py-2 text-danger"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Déconnexion
                </button>
              </nav>
            </div>
          </div>
        </div>
        <div className="col-lg-9">
          {tab === "orders" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  Historique des commandes
                </h5>
                {loading ? (
                  <p className="text-muted">Chargement…</p>
                ) : orders.length === 0 ? (
                  <p className="text-muted">
                    Aucune commande.{" "}
                    <Link to="/products">Découvrir le catalogue</Link>
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Commande</th>
                          <th>Montant</th>
                          <th>Statut</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o._id}>
                            <td className="fw-semibold">
                              ORD-
                              {String(o._id || "")
                                .slice(-6)
                                .toUpperCase()}
                            </td>
                            <td>
                              {o.totalPrice != null
                                ? `${Number(o.totalPrice).toLocaleString()} FCFA`
                                : "—"}
                            </td>
                            <td>
                              <span
                                className={`badge bg-${
                                  STATUS_BADGE[o.status] || "secondary"
                                }`}
                              >
                                {STATUS_LABELS[o.status] || o.status}
                              </span>
                            </td>
                            <td className="text-muted">
                              {o.createdAt
                                ? new Date(o.createdAt).toLocaleDateString()
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === "profile" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Mon profil</h5>
                <p className="text-muted mb-2">
                  <strong>Nom :</strong> {user.nom || "—"}
                </p>
                <p className="text-muted mb-2">
                  <strong>Prénom :</strong> {user.prenom || "—"}
                </p>
                <p className="text-muted mb-2">
                  <strong>Email :</strong> {user.email || "—"}
                </p>
                <p className="text-muted small mt-3">
                  Modification du mot de passe : à venir (lien sécurisé).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
