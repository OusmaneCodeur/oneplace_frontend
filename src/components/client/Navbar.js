import React, { useState } from "react";
import { HiLocationMarker, HiShoppingCart, HiUser, HiMenu, HiSearch } from "react-icons/hi";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "../../style/Navbar.css";

const Navbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const { count } = useCart();
  const { user, logout } = useAuth();

  const toggleLoginMenu = () => {
    setShowLoginMenu(!showLoginMenu);
  };

  const isClient = user?.role === "client" || !user?.role;

  return (
    <header className="sticky-top shadow-sm">
      {/* Top info bar */}
      <div className="bg-white py-1 border-bottom">
        <div className="container d-flex justify-content-between align-items-center text-muted small">
          <div className="d-flex align-items-center gap-2">
            <HiLocationMarker /> Livraison partout au Sénégal
          </div>
          <div className="d-flex align-items-center gap-3">
            Paiement à la livraison | +221 77 866 70 02
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="navbar navbar-expand-md navbar-light bg-light py-3">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle overflow-hidden"
              style={{ width: 40, height: 40, backgroundColor: "white" }}
            >
              <img
                src="/oneplace.png"
                alt="ONEPLACE Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div className="d-none d-sm-block">
              <h1 className="h5 mb-0 text-dark">ONEPLACE</h1>
              <small className="text-muted">Tout en un seul endroit</small>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <HiMenu size={25} />
          </button>

          {/* Navbar links & search */}
          <div className={`collapse navbar-collapse ${showMobileMenu ? "show" : ""}`}>
            {/* Search */}
            <form className="d-flex mx-auto my-2 my-md-0" style={{ maxWidth: 400 }}>
              <input
                className="form-control rounded-pill me-2"
                type="search"
                placeholder="Rechercher un produit..."
              />
              <button
                className="btn btn-primary rounded-circle d-flex justify-content-center align-items-center"
                type="submit"
                style={{ width: 40, height: 40 }}
              >
                <HiSearch className="text-white" />
              </button>
            </form>

            {/* Nav links */}
            <ul className="navbar-nav ms-auto mb-2 mb-md-0 oneplace-nav">
              <li className="nav-item">
                <Link className="nav-link active-link" to="/">
                  Accueil
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-hover blue" to="/products">
                  Catalogue
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-hover green" to="/products?category=informatique">
                  Informatique
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-hover orange" to="/products?category=vetements">
                  Vêtements
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-hover red" to="/products?category=sports">
                  Sports
                </Link>
              </li>
            </ul>

            {/* Icons */}
            <div className="d-flex align-items-center gap-2 ms-md-3 mt-2 mt-md-0">
              <Link
                to="/cart"
                className="btn btn-outline-primary rounded-circle d-flex justify-content-center align-items-center position-relative"
                style={{ width: 40, height: 40 }}
              >
                <HiShoppingCart />
                {count > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.7rem" }}>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>

              {/* User / Login Menu */}
              <div className="position-relative">
                <button
                  onClick={toggleLoginMenu}
                  className="btn btn-outline-success rounded-circle d-flex justify-content-center align-items-center"
                  style={{ width: 40, height: 40 }}
                  aria-label="Menu utilisateur"
                >
                  <HiUser />
                </button>

                {showLoginMenu && (
                  <div className="position-absolute end-0 mt-2 bg-white border rounded shadow py-2" style={{ minWidth: 180 }}>
                    {user ? (
                      <>
                        {user.role === "admin" || user.role === "moderator" ? (
                          <Link
                            to="/admin"
                            className="d-block px-3 py-2 text-dark text-decoration-none"
                            onClick={() => setShowLoginMenu(false)}
                          >
                            Back-office
                          </Link>
                        ) : null}
                        {isClient && (
                          <Link
                            to="/account"
                            className="d-block px-3 py-2 text-dark text-decoration-none"
                            onClick={() => setShowLoginMenu(false)}
                          >
                            Mon compte
                          </Link>
                        )}
                        <button
                          type="button"
                          className="d-block w-100 text-start border-0 bg-transparent px-3 py-2 text-danger text-decoration-none"
                          onClick={() => { logout(); setShowLoginMenu(false); }}
                        >
                          Déconnexion
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="d-block px-3 py-2 text-dark text-decoration-none"
                          onClick={() => setShowLoginMenu(false)}
                        >
                          Se connecter
                        </Link>
                        <Link
                          to="/register"
                          className="d-block px-3 py-2 text-dark text-decoration-none"
                          onClick={() => setShowLoginMenu(false)}
                        >
                          S'inscrire
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
