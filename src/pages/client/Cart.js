import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartItem from "../../components/client/CartItem";
import "../../style/Cart.css";

// Montant fixe de livraison et seuil pour la livraison gratuite.
// Ces valeurs font partie de la logique métier du panier
// et ne doivent pas être modifiées ici sans décision fonctionnelle.
const LIVRAISON_FCFA = 2000;
const SEUIL_LIVRAISON_GRATUITE = 50000;

/**
 * Page panier client.
 *
 * Affiche :
 * - la liste des articles (via `CartItem`)
 * - un résumé (sous‑total, livraison, total)
 * - les boutons d'action (vider, continuer, passer au checkout)
 */
export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  // Calcul simple des frais de livraison en fonction du sous‑total
  const livraison =
    subtotal >= SEUIL_LIVRAISON_GRATUITE ? 0 : LIVRAISON_FCFA;
  const total = subtotal + livraison;

  // État vide : aucun article dans le panier
  if (items.length === 0) {
    return (
      <div className="container py-5 cart-page">
        <div className="text-center py-5">
          <h2 className="h4 fw-bold mb-3">Votre panier est vide</h2>
          <p className="text-muted mb-4">
            Ajoutez des articles depuis le catalogue.
          </p>
          <Link to="/products" className="btn btn-primary">
            Voir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 cart-page">
      <h1 className="h4 fw-bold mb-4">Panier</h1>
      <div className="row">
        {/* Liste des articles */}
        <div className="col-lg-8 mb-4 mb-lg-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">{items.length} article(s)</span>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={clearCart}
            >
              Vider le panier
            </button>
          </div>
          {items.map((item) => (
            <CartItem
              key={item.product._id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Résumé de commande */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm cart-summary">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Récapitulatif</h6>
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
              <Link to="/checkout" className="btn btn-primary w-100">
                Passer la commande
              </Link>
              <Link
                to="/products"
                className="btn btn-outline-secondary w-100 mt-2"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
