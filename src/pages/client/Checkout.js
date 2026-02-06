import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../services/order.service";
import "../../style/Checkout.css";

// Montant fixe de livraison et seuil pour la livraison gratuite.
// Ces valeurs sont utilisées à la fois ici et dans la page panier.
const LIVRAISON_FCFA = 3000;
const SEUIL_LIVRAISON_GRATUITE = 50000;

/**
 * Page de validation de commande (checkout).
 *
 * Rôle :
 * - s'assurer que l'utilisateur est connecté
 * - récupérer le contenu du panier
 * - collecter les informations de livraison
 * - créer la commande via l'API
 */
export default function Checkout() {
  const { user } = useAuth();
  const { items, count, subtotal, clearCart } = useCart();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    commentaire: "",
  });

  const livraison = subtotal >= SEUIL_LIVRAISON_GRATUITE ? 0 : LIVRAISON_FCFA;
  const total = subtotal + livraison;

  /**
   * Gestion des changements sur les champs du formulaire.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Soumission du formulaire de commande :
   * - on vérifie qu'un utilisateur est bien connecté
   * - on envoie la commande à l'API (`createOrder`)
   * - en cas de succès : on vide le panier et on affiche un message de confirmation
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Connectez-vous pour passer commande.");
      return;
    }

    setLoading(true);
    try {
      const adresseLivraison =
        [form.adresse, form.ville].filter(Boolean).join(", ") +
        (form.commentaire ? `. ${form.commentaire}` : "");

      await createOrder({
        client: user.id,
        products: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
        })),
        totalPrice: total,
        montantTotal: total,
        adresseLivraison,
      });

      setSubmitted(true);
      clearCart();
      toast.success("Commande enregistrée.");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement de la commande."
      );
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'est pas connecté, on l'invite à se connecter / s'inscrire.
  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <strong>Connexion requise.</strong> Connectez-vous pour passer une
          commande.{" "}
          <Link to="/login" className="alert-link">
            Se connecter
          </Link>{" "}
          ou{" "}
          <Link to="/register" className="alert-link">
            S'inscrire
          </Link>
          .
        </div>
      </div>
    );
  }

  // Si le panier est vide et que aucune commande n'a été envoyée
  if (count === 0 && !submitted) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          Votre panier est vide. <Link to="/products">Voir le catalogue</Link>
        </div>
      </div>
    );
  }

  // Affichage après validation de la commande
  if (submitted) {
    return (
      <div className="container py-5 checkout-page">
        <div
          className="card border-0 shadow-sm mx-auto"
          style={{ maxWidth: 500 }}
        >
          <div className="card-body text-center py-5">
            <div className="text-success mb-3" style={{ fontSize: "3rem" }}>
              ✓
            </div>
            <h2 className="h4 fw-bold mb-2">Commande enregistrée</h2>
            <p className="text-muted mb-4">
              Nous avons bien reçu vos informations. Vous serez contacté pour la
              livraison.
            </p>
            <Link to="/products" className="btn btn-primary">
              Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire de checkout + récapitulatif du panier
  return (
    <div className="container py-4 checkout-page">
      <h1 className="h4 fw-bold mb-4">Passer la commande</h1>
      <div className="row">
        <div className="col-lg-7 mb-4 mb-lg-0">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Informations pour la livraison</h6>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      className="form-control"
                      value={form.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      className="form-control"
                      value={form.prenom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="tel"
                      name="telephone"
                      className="form-control"
                      placeholder="+221 77 123 45 67"
                      value={form.telephone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Adresse de livraison</label>
                    <input
                      type="text"
                      name="adresse"
                      className="form-control"
                      placeholder="Rue, quartier, point de repère"
                      value={form.adresse}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ville</label>
                    <input
                      type="text"
                      name="ville"
                      className="form-control"
                      placeholder="Dakar, Thiès..."
                      value={form.ville}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      name="commentaire"
                      className="form-control"
                      rows={2}
                      placeholder="Instructions pour le livreur"
                      value={form.commentaire}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      disabled={loading}
                    >
                      {loading ? "Envoi en cours…" : "Confirmer la commande"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm checkout-summary">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Récapitulatif</h6>
              <p className="text-muted small mb-3">{items.length} article(s)</p>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Sous-total</span>
                <span>{Number(subtotal).toLocaleString()} FCFA</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Livraison</span>
                <span>
                  {livraison === 0 ? (
                    <span className="text-success">Gratuite</span>
                  ) : (
                    `${Number(livraison).toLocaleString()} FCFA`
                  )}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>Total</span>
                <span className="text-primary">
                  {Number(total).toLocaleString()} FCFA
                </span>
              </div>
              <Link to="/cart" className="btn btn-outline-secondary w-100">
                Modifier le panier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
