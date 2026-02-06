import React from "react";
import { Link } from "react-router-dom";
import { HiMapPin, HiPhone, HiEnvelope } from "react-icons/hi2";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-5">
            <div className="container py-5">
                <div className="row">
                    {/* Logo & Description */}
                    <div className="col-12 col-md-6 col-lg-3 mb-4">
                        <div className="d-flex align-items-center mb-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle overflow-hidden"
                                style={{ width: 40, height: 40, backgroundColor: "white" }}
                            >
                                <img
                                    src="oneplace.png"
                                    alt="ONEPLACE Logo"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>

                            <div className="ms-2">
                                <h5 className="fw-bold text-white mb-0">ONEPLACE</h5>
                                <small className="text-light">Tout en un seul endroit</small>
                            </div>
                        </div>
                        <p className="text-light small">
                            Votre marketplace de confiance au Sénégal. Informatique, vêtements, sports et plus encore.
                        </p>
                        <div className="d-flex gap-2">
                            <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center">
                                <FaFacebookF />
                            </a>
                            <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center">
                                <FaInstagram />
                            </a>
                            <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center">
                                <FaWhatsapp />
                            </a>
                            <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center">
                                <FaTiktok />
                            </a>
                        </div>
                    </div>

                    {/* Catégories */}
                    <div className="col-6 col-md-3 col-lg-3 mb-4">
                        <h6 className="fw-semibold text-white">Catégories</h6>
                        <ul className="list-unstyled small">
                            <li><Link to="/products?category=informatique" className="text-light text-decoration-none">Informatique</Link></li>
                            <li><Link to="/products?category=vetements" className="text-light text-decoration-none">Vêtements</Link></li>
                            <li><Link to="/products?category=sports" className="text-light text-decoration-none">Sports</Link></li>
                            <li><Link to="/products?category=divers" className="text-light text-decoration-none">Divers</Link></li>
                        </ul>
                    </div>

                    {/* Informations */}
                    <div className="col-6 col-md-3 col-lg-3 mb-4">
                        <h6 className="fw-semibold text-white">Informations</h6>
                        <ul className="list-unstyled small">
                            <li><Link to="/" className="text-light text-decoration-none">À propos</Link></li>
                            <li><Link to="/" className="text-light text-decoration-none">Livraison</Link></li>
                            <li><Link to="/" className="text-light text-decoration-none">Conditions générales</Link></li>
                            <li><Link to="/" className="text-light text-decoration-none">Politique de retour</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-12 col-md-12 col-lg-3 mb-4">
                        <h6 className="fw-semibold text-white">Contact</h6>
                        <ul className="list-unstyled small">
                            <li className="d-flex align-items-center mb-2 text-light"><HiMapPin className="me-2" />Dakar, Sénégal</li>
                            <li className="d-flex align-items-center mb-2 text-light"><HiPhone className="me-2" />+221 77 866 70 02</li>
                            <li className="d-flex align-items-center mb-2 text-light"><HiEnvelope className="me-2" />contact@oneplace.sn</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-top border-secondary pt-3 mt-3 d-flex flex-column flex-md-row justify-content-between align-items-center small text-light">
                    <p className="mb-2 mb-md-0">© 2026 ONEPLACE. Tous droits réservés.</p>
                    <div className="d-flex gap-2">
                        <span style={{ color: "blue" }}>Paiement à la livraison</span>
                        <span className="text-white">•</span>
                        <span style={{ color: "green" }}>Livraison partout au Sénégal</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
