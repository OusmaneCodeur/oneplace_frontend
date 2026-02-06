import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/client/ProductCard";
import Filters from "../../components/client/Filters";
import { useCart } from "../../context/CartContext";
import axiosInstance from "../../axios/axiosInstance";
import "../../style/Products.css";

/**
 * Page catalogue produits.
 *
 * Rôle :
 * - charger la liste des produits via l'API
 * - appliquer les filtres (catégorie + prix max)
 * - synchroniser la catégorie avec l'URL (`?category=...`)
 * - permettre l'ajout d'un produit au panier
 *
 * La logique métier (prix, catégories, structure produit) reste côté backend / données.
 */
export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();

  const categoryFromUrl = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl || null
  );
  const [priceMax, setPriceMax] = useState(null);

  // Si l'URL change (navigation, lien direct), on met à jour l'état local.
  useEffect(() => {
    setSelectedCategory(categoryFromUrl || null);
  }, [categoryFromUrl]);

  // Chargement initial des produits.
  useEffect(() => {
    axiosInstance
      .get("/products")
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les produits.");
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Calcule une borne max raisonnable pour le slider de prix
   * en fonction des produits disponibles.
   */
  const maxPriceRange = useMemo(() => {
    if (products.length === 0) return 1000000;
    const max = Math.max(...products.map((p) => Number(p.price)));
    return Math.ceil(max / 10000) * 10000 || 1000000;
  }, [products]);

  /**
   * Applique les filtres (catégorie + prix) côté frontend.
   * On ne modifie pas les données initiales.
   */
  const filteredProducts = useMemo(() => {
    let list = [...products];
    const catValue = selectedCategory || searchParams.get("category");

    if (catValue) {
      list = list.filter((p) => {
        const c = p.category;
        const name = typeof c === "object" ? c?.name : c;
        const id = typeof c === "object" ? c?._id : c;
        const slug = (name || id || "").toLowerCase().replace(/\s/g, "");

        return (
          name === catValue ||
          id === catValue ||
          slug === catValue ||
          (typeof name === "string" && name.toLowerCase() === catValue)
        );
      });
    }

    if (priceMax != null && priceMax > 0) {
      list = list.filter((p) => Number(p.price) <= priceMax);
    }

    return list;
  }, [products, selectedCategory, searchParams, priceMax]);

  /**
   * Quand l'utilisateur clique sur une catégorie dans la sidebar :
   * - on met à jour l'état local
   * - on met à jour l'URL (utile pour le partage / rafraîchissement)
   */
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
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

  return (
    <div className="container py-4 products-page">
      <div className="row">
        <aside className="col-lg-3 mb-4 mb-lg-0">
          <Filters
            selectedCategory={selectedCategory || searchParams.get("category")}
            onCategoryChange={handleCategoryChange}
            priceMax={priceMax}
            onPriceMaxChange={setPriceMax}
            maxPriceRange={maxPriceRange}
          />
        </aside>
        <div className="col-lg-9">
          {error && <div className="alert alert-warning mb-4">{error}</div>}
          <h1 className="h4 fw-bold mb-4">Catalogue</h1>
          <div className="row g-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                size="col-6 col-md-4 col-lg-4"
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-muted text-center py-5">
              Aucun produit ne correspond aux filtres.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
