import React, { useEffect, useState } from "react";
import ProductCard from "../../components/client/ProductCard";
import axiosInstance from "../../axios/axiosInstance";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../style/Home.css";

function Feature({ title, text }) {
  return (
    <div className="col-md-4">
      <div className="feature-card">
        <h5>{title}</h5>
        <p>{text}</p>
      </div>
    </div>
  );
}

function CategoryCard({ title, text, image, link, theme }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <Link to={link} className={`category-card ${theme}`}>
        <img src={image} alt={title} loading="lazy" />
        <div className="category-overlay"></div>
        <div className="category-content">
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    axiosInstance
      .get("/products")
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured !== false).slice(0, 8);
  const displayedVedettes = featuredProducts.length >= 8 ? featuredProducts : products.slice(0, 8);

  const sortedByDate = [...products].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : 0;
    const dateB = b.createdAt ? new Date(b.createdAt) : 0;
    return dateB - dateA;
  });
  const nouveautes = sortedByDate.slice(0, 8);

  const handleAddToCart = (product) => {
    addItem(product, 1);
  };

  return (
    <main>
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section position-relative overflow-hidden text-white">
        <div className="hero-gradient"></div>
        <div className="hero-pattern"></div>

        <div className="container position-relative py-5 py-lg-6">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <div className="hero-badge mb-4">
                <span className="pulse-dot"></span>
                Livraison gratuite à partir de 50 000 FCFA
              </div>

              <h1 className="display-4 fw-bold mb-4">
                Bienvenue sur <br />
                <span className="hero-title">ONEPLACE</span>
              </h1>

              <p className="lead opacity-90 mb-4">
                Tout en un seul endroit. Découvrez notre sélection de produits
                informatiques, vêtements, articles sportifs et bien plus encore.
              </p>

              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link to="/products" className="btn btn-light btn-lg px-4">
                  Découvrir les produits →
                </Link>
                <Link
                  to="/products?featured=true"
                  className="btn btn-outline-light btn-lg px-4"
                >
                  Meilleures ventes
                </Link>
              </div>
            </div>

            <div className="col-lg-6 d-none d-lg-block">
              <div className="row g-3">
                <div className="col-6">
                  <div className="hero-card floating">
                    <img src="/macbook.jpg" alt="MacBook" />
                    <p>MacBook Pro</p>
                  </div>
                  <div className="hero-card mt-3">
                    <img src="/boubou.jpg" alt="Boubou" />
                    <p>Boubou Africain</p>
                  </div>
                </div>

                <div className="col-6 mt-5">
                  <div className="hero-card">
                    <img src="/basket.jpg" alt="Jordan" />
                    <p>Air Jordan</p>
                  </div>
                  <div className="hero-card floating mt-3">
                    <img src="/apple.jpg" alt="iPhone" />
                    <p>iPhone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-5 g-4">
            <Feature title="Livraison rapide" text="Partout au Sénégal" />
            <Feature title="Paiement à la livraison" text="Simple et sécurisé" />
            <Feature title="Produits garantis" text="Qualité assurée" />
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="categories-section py-5">
        <div className="container">
          <div className="mb-4">
            <h2 className="fw-bold display-6">Nos Catégories</h2>
            <p className="text-muted">
              Explorez nos différentes catégories de produits
            </p>
          </div>

          <div className="row g-4">
            <CategoryCard
              title="Informatique"
              text="PC, téléphones, accessoires"
              image="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
              link="/products?category=informatique"
              theme="tech"
            />
            <CategoryCard
              title="Vêtements"
              text="Mode africaine et moderne"
              image="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop"
              link="/products?category=vetements"
              theme="fashion"
            />
            <CategoryCard
              title="Sports"
              text="Équipements sportifs"
              image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop"
              link="/products?category=sports"
              theme="sports"
            />
            <CategoryCard
              title="Divers"
              text="Produits variés"
              image="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
              link="/products?category=divers"
              theme="misc"
            />
          </div>
        </div>
      </section>

      {/* ===== PRODUITS EN VEDETTE ===== */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="mb-4">
            <h2 className="fw-bold display-6">Produits Vedettes</h2>
            <p className="text-muted">
              Une sélection de produits mis en avant
            </p>
          </div>

          <div className="row g-4">
            {displayedVedettes.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                size="col-6 col-md-4 col-lg-3"
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {displayedVedettes.length === 0 && (
            <p className="text-muted text-center py-4">Aucun produit en vedette pour le moment.</p>
          )}
        </div>
      </section>

      {/* ===== NOUVEAUTÉS (ex Produits populaires) ===== */}
      <section className="py-5">
        <div className="container">
          <div className="mb-4">
            <h2 className="fw-bold display-6">Nouveautés</h2>
            <p className="text-muted">
              Découvrez les produits ajoutés récemment
            </p>
          </div>

          <div className="row g-4">
            {nouveautes.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                size="col-6 col-md-4 col-lg-3"
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {nouveautes.length === 0 && (
            <p className="text-muted text-center py-4">Aucune nouveauté pour le moment.</p>
          )}

          <div className="text-center mt-4">
            <Link to="/products" className="btn btn-primary btn-lg">
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
