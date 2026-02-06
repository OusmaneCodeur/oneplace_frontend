import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/auth.service";
import { toast } from "react-toastify";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import "../../style/Register.css";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        phoneNumber: "",
        email: "",
        motDePasse: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!form.nom.trim()) {
            newErrors.nom = "Le nom est requis";
        }
        if (!form.prenom.trim()) {
            newErrors.prenom = "Le prénom est requis";
        }
        if (!form.phoneNumber.trim()) {
            newErrors.phoneNumber = "Le téléphone est requis";
        }
        if (!form.email) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Email invalide";
        }
        if (!form.motDePasse) {
            newErrors.motDePasse = "Le mot de passe est requis";
        } else if (form.motDePasse.length < 6) {
            newErrors.motDePasse = "Le mot de passe doit contenir au moins 6 caractères";
        }
        if (!form.confirmPassword) {
            newErrors.confirmPassword = "La confirmation est requise";
        } else if (form.motDePasse !== form.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = form;
            await register(registerData);
            toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
            navigate("/login");
        } catch (err) {
            const message = err.response?.data?.message || "Erreur lors de l'inscription";
            toast.error(message);
            setErrors({ submit: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="container w-100">
                <div className="row justify-content-center align-items-center py-5">
                    <div className="col-12 col-md-8 col-lg-5 col-xl-4">
                        <div className="auth-card card shadow-lg border-0">
                            <div className="card-body p-4 p-md-5">
                                {/* Logo ONEPLACE */}
                                <div className="text-center mb-4">
                                    <div className="auth-logo-wrapper mb-3">
                                        <img
                                            src="/oneplace.png"
                                            alt="ONEPLACE Logo"
                                            className="auth-logo"
                                        />
                                    </div>
                                    <h1 className="auth-title mb-2">Créer un compte</h1>
                                    <p className="auth-subtitle text-muted">
                                        Rejoignez ONEPLACE dès aujourd'hui
                                    </p>
                                </div>

                                {/* Formulaire */}
                                <form onSubmit={handleSubmit} className="auth-form">
                                    {/* Nom et Prénom */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-6">
                                            <label htmlFor="register-nom" className="form-label fw-semibold">
                                                Nom
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text auth-input-icon">
                                                    <User size={18} />
                                                </span>
                                                <input
                                                    id="register-nom"
                                                    name="nom"
                                                    type="text"
                                                    className={`form-control auth-input ${errors.nom ? "is-invalid" : ""}`}
                                                    placeholder="Nom"
                                                    value={form.nom}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                {errors.nom && (
                                                    <div className="invalid-feedback">{errors.nom}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <label htmlFor="register-prenom" className="form-label fw-semibold">
                                                Prénom
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text auth-input-icon">
                                                    <User size={18} />
                                                </span>
                                                <input
                                                    id="register-prenom"
                                                    name="prenom"
                                                    type="text"
                                                    className={`form-control auth-input ${errors.prenom ? "is-invalid" : ""}`}
                                                    placeholder="Prénom"
                                                    value={form.prenom}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                {errors.prenom && (
                                                    <div className="invalid-feedback">{errors.prenom}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Téléphone */}
                                    <div className="mb-3">
                                        <label htmlFor="register-phone" className="form-label fw-semibold">
                                            Téléphone
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text auth-input-icon">
                                                <Phone size={18} />
                                            </span>
                                            <input
                                                id="register-phone"
                                                name="phoneNumber"
                                                type="tel"
                                                className={`form-control auth-input ${errors.phoneNumber ? "is-invalid" : ""}`}
                                                placeholder="+221 77 123 45 67"
                                                value={form.phoneNumber}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.phoneNumber && (
                                                <div className="invalid-feedback">{errors.phoneNumber}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="mb-3">
                                        <label htmlFor="register-email" className="form-label fw-semibold">
                                            Email
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text auth-input-icon">
                                                <Mail size={18} />
                                            </span>
                                            <input
                                                id="register-email"
                                                name="email"
                                                type="email"
                                                className={`form-control auth-input ${errors.email ? "is-invalid" : ""}`}
                                                placeholder="votre@email.com"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.email && (
                                                <div className="invalid-feedback">{errors.email}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mot de passe */}
                                    <div className="mb-3">
                                        <label htmlFor="register-password" className="form-label fw-semibold">
                                            Mot de passe
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text auth-input-icon">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                id="register-password"
                                                name="motDePasse"
                                                type={showPassword ? "text" : "password"}
                                                className={`form-control auth-input ${errors.motDePasse ? "is-invalid" : ""}`}
                                                placeholder="Mot de passe"
                                                value={form.motDePasse}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary auth-password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            {errors.motDePasse && (
                                                <div className="invalid-feedback">{errors.motDePasse}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Confirmation mot de passe */}
                                    <div className="mb-4">
                                        <label htmlFor="register-confirm-password" className="form-label fw-semibold">
                                            Confirmation du mot de passe
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text auth-input-icon">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                id="register-confirm-password"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                className={`form-control auth-input ${errors.confirmPassword ? "is-invalid" : ""}`}
                                                placeholder="Confirmer le mot de passe"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary auth-password-toggle"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            {errors.confirmPassword && (
                                                <div className="invalid-feedback">{errors.confirmPassword}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message d'erreur général */}
                                    {errors.submit && (
                                        <div className="alert alert-danger py-2 mb-3" role="alert">
                                            <small>{errors.submit}</small>
                                        </div>
                                    )}

                                    {/* Bouton d'inscription */}
                                    <button
                                        type="submit"
                                        className="btn btn-primary auth-btn-primary w-100 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Inscription...
                                            </>
                                        ) : (
                                            "Inscription"
                                        )}
                                    </button>

                                    {/* Lien connexion */}
                                    <div className="text-center">
                                        <p className="mb-0 text-muted small">
                                            Déjà un compte ?{" "}
                                            <Link to="/login" className="auth-link">
                                                Connexion
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
