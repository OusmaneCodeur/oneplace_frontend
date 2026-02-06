import React from "react";
import "../../style/Cart.css";

/**
 * Une ligne du panier.
 *
 * Affiche :
 * - l'image du produit
 * - son nom, une description courte, le prix unitaire
 * - les contrôles de quantité (+ / −)
 * - le total de la ligne et un bouton de suppression
 *
 * La logique métier (réel calcul du sous‑total du panier) reste dans `CartContext`.
 */
export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  const handleMinus = () => {
    // Si on arrive à 0, on retire complètement la ligne du panier
    if (quantity <= 1) onRemove(product._id);
    else onUpdateQuantity(product._id, quantity - 1);
  };

  const handlePlus = () => {
    onUpdateQuantity(product._id, quantity + 1);
  };

  return (
    <div className="cart-item card shadow-sm border-0 mb-3">
      <div className="card-body">
        <div className="row align-items-center g-3">
          <div className="col-4 col-md-3">
            <img
              src={product.image || "/logo192.png"}
              alt={product.name}
              className="img-fluid rounded cart-item-img"
            />
          </div>
          <div className="col-8 col-md-5">
            <h6 className="fw-semibold mb-1">{product.name}</h6>
            {product.description && (
              <p className="text-muted small mb-0 cart-item-desc">
                {product.description.length > 60
                  ? product.description.slice(0, 60) + "…"
                  : product.description}
              </p>
            )}
            <p className="fw-bold text-primary mb-0 mt-1">
              {Number(product.price).toLocaleString()} FCFA
            </p>
          </div>
          <div className="col-6 col-md-2">
            <div className="input-group input-group-sm">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleMinus}
              >
                −
              </button>
              <input
                type="text"
                className="form-control text-center"
                value={quantity}
                readOnly
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handlePlus}
              >
                +
              </button>
            </div>
          </div>
          <div className="col-4 col-md-1 text-end">
            <span className="fw-bold">
              {Number(lineTotal).toLocaleString()} FCFA
            </span>
          </div>
          <div className="col-2 col-md-1 text-end">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => onRemove(product._id)}
              aria-label="Supprimer"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
