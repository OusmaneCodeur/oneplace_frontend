import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../axios/axiosInstance";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/client/ProductCard";
import { getProductImageUrl } from "../../utils/imageUrl";
import "../../style/ProductDetails.css";

/**
 * Page de détail produit.
 *
 * Rôle :
 * - charger les informations du produit sélectionné
 * - afficher les informations principales (prix, stock, description)
 * - permettre l'ajout au panier
 * - afficher une sélection de produits suggérés
 */
export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  /**
   * Charge le produit courant puis quelques autres produits
   * pour construire une section "Vous aimerez aussi".
   *
   * ⚠️ On garde la même séquence d'appels pour ne pas changer
   * la façon dont les suggestions sont calculées.
   */
  useEffect(() => {
    axiosInstance
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        return axiosInstance.get("/products");
      })
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        const others = all.filter((p) => p._id !== id).slice(0, 4);
        setSuggestions(others);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  /**
   * Ajoute le produit courant au panier avec la quantité choisie.
   */
  const handleAddToCart = () => {
    if (product) addItem(product, quantity);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement…</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Produit introuvable.{" "}
          <Link to="/products" className="ms-2">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const discount =
    product.oldPrice
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const categoryName =
    product.category &&
    (typeof product.category === "object"
      ? product.category.name
      : product.category);

  return (
    <div className="container py-4 product-details-page">
      <div className="row g-5">
        <div className="col-lg-6 position-relative">
          <div className="ratio ratio-1x1 rounded-3 overflow-hidden shadow-sm bg-light">
            <img
              src={getProductImageUrl(product.image)}
              alt={product.name}
              className="img-fluid w-100 h-100 object-fit-cover"
            />
          </div>
          {discount != null && (
            <span className="badge bg-danger position-absolute top-0 start-0 m-3 fs-6 shadow">
              -{discount}%
            </span>
          )}
        </div>

        <div className="col-lg-6 d-flex flex-column">
          {categoryName && (
            <Link
              to={`/products?category=${encodeURIComponent(categoryName)}`}
              className="text-decoration-none"
            >
              <span className="badge bg-secondary mb-2">{categoryName}</span>
            </Link>
          )}
          <h1 className="display-6 fw-bold mb-3">{product.name}</h1>

          <div className="d-flex align-items-baseline gap-3 mb-3">
            <span className="fs-2 fw-bold text-primary">
              {Number(product.price).toLocaleString()} FCFA
            </span>
            {product.oldPrice && (
              <span className="text-muted text-decoration-line-through fs-5">
                {Number(product.oldPrice).toLocaleString()} FCFA
              </span>
            )}
            {discount != null && (
              <span className="badge bg-danger">-{discount}%</span>
            )}
          </div>

          {product.description && (
            <p className="text-muted mb-3">{product.description}</p>
          )}

          {product.stock != null && (
            <p className="text-success mb-3">Stock restant : {product.stock}</p>
          )}

          <div className="d-flex align-items-center flex-wrap gap-3 mb-4">
            <div
              className="input-group product-details-qty"
              style={{ width: 140 }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setQuantity((q) => (q > 1 ? q - 1 : 1))
                }
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
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </button>
          </div>

          <div className="row g-3 border-top pt-4 mt-auto product-details-services">
            <div className="col-12 col-md-4 d-flex align-items-center gap-2 small">
              <span className="fs-4">🚚</span>
              <div>
                <strong>Livraison</strong>
                <br />
                Partout au Sénégal
              </div>
            </div>
            <div className="col-12 col-md-4 d-flex align-items-center gap-2 small">
              <span className="fs-4">🛡️</span>
              <div>
                <strong>Garantie</strong>
                <br />
                Produit garanti
              </div>
            </div>
            <div className="col-12 col-md-4 d-flex align-items-center gap-2 small">
              <span className="fs-4">🔄</span>
              <div>
                <strong>Retour</strong>
                <br />
                Sous 72H
              </div>
            </div>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-5 pt-5 border-top">
          <h2 className="h5 fw-bold mb-4">Vous aimerez aussi</h2>
          <div className="row g-4">
            {suggestions.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                size="col-6 col-md-3"
                onAddToCart={(pr) => addItem(pr, 1)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
