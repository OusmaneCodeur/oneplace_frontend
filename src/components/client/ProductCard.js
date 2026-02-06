import React from "react";
import { Link } from "react-router-dom";
import { getProductImageUrl } from "../../utils/imageUrl";
import "../../style/ProductCard.css";

/**
 * Carte produit réutilisable.
 *
 * Affiche :
 * - image du produit
 * - nom, prix actuel (+ ancien prix éventuel)
 * - stock restant (si fourni)
 * - boutons d'action :
 *   - voir le détail du produit
 *   - ajouter au panier (si `onAddToCart` est fourni)
 *
 * Le layout (taille de colonne) est contrôlé par la prop `size`
 * pour s'adapter aux différentes sections (home, suggestions, catalogue, etc.).
 */
export default function ProductCard({
  product,
  showCatalogueButton = false,
  size = "col-6 col-md-4 col-lg-3",
  onAddToCart,
}) {
  if (!product) return null;

  const discount =
    product.oldPrice
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const handleAdd = (e) => {
    // Empêche la navigation vers la page produit lors du clic sur "Ajouter au panier"
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) onAddToCart(product);
  };

  const imageSrc = getProductImageUrl(product.image);

  return (
    <div className={size}>
      <div className="card h-100 shadow-sm border-0 overflow-hidden product-card-hover position-relative">
        <Link
          to={`/products/${product._id}`}
          className="text-decoration-none text-dark"
        >
          <div className="position-relative">
            <img
              src={imageSrc}
              className="card-img-top bg-light"
              alt={product.name}
              style={{ objectFit: "cover", height: 220 }}
              loading="lazy"
            />
            {discount != null && (
              <span className="badge bg-danger position-absolute top-0 start-0 m-2 shadow-sm">
                -{discount}%
              </span>
            )}
          </div>
        </Link>
        <div className="card-body d-flex flex-column">
          <Link
            to={`/products/${product._id}`}
            className="text-decoration-none text-dark"
          >
            <h6 className="card-title fw-semibold mb-2">{product.name}</h6>
          </Link>
          <div className="d-flex align-items-baseline gap-2 flex-wrap mb-2">
            <span className="fw-bold text-primary">
              {Number(product.price).toLocaleString()} FCFA
            </span>
            {product.oldPrice && (
              <span className="text-muted text-decoration-line-through small">
                {Number(product.oldPrice).toLocaleString()} FCFA
              </span>
            )}
          </div>
          {product.stock != null && (
            <p className="text-success small mb-2">
              Plus que {product.stock} en stock
            </p>
          )}
          <div className="mt-auto d-flex flex-column gap-2">
            {showCatalogueButton ? (
              <Link to="/products" className="btn btn-outline-primary btn-sm">
                Voir catalogue
              </Link>
            ) : (
              <>
                <Link
                  to={`/products/${product._id}`}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Voir le produit
                </Link>
                {onAddToCart && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm w-100"
                    onClick={handleAdd}
                  >
                    Ajouter au panier
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
