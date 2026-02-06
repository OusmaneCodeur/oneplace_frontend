import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import "../../style/Login.css";

/**
 * Page de connexion client / admin / modérateur.
 *
 * Rôle de ce composant :
 * - gérer le formulaire (état local + validation basique)
 * - appeler le service `login`
 * - stocker le token via `loginUser` (AuthContext)
 * - rediriger l'utilisateur en fonction de son rôle
 */
export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // État du formulaire
  const [form, setForm] = useState({
    email: "",
    motDePasse: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Met à jour les champs du formulaire
   * et efface le message d'erreur lié au champ concerné.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Validation minimale côté client :
   * - email non vide et au bon format
   * - mot de passe non vide
   *
   * La validation "métier" reste faite côté backend.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email invalide";
    }

    if (!form.motDePasse) {
      newErrors.motDePasse = "Le mot de passe est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Soumission du formulaire de connexion :
   * - appelle l'API `login`
   * - stocke le token et l'utilisateur via `loginUser`
   * - décode le JWT pour connaître le rôle et rediriger
   *
   * On garde exactement la même logique de redirection
   * pour ne pas modifier les parcours utilisateurs.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await login(form);

      // Mise à jour de l'état global d'authentification
      loginUser(data.token, data.user);

      // On s'appuie sur le JWT pour déterminer le rôle
      const decoded = jwtDecode(data.token);

      toast.success("Connexion réussie !");

      if (decoded.role === "admin") {
        navigate("/admin");
      } else if (decoded.role === "moderator") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Email ou mot de passe incorrect";
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
                  <h1 className="auth-title mb-2">Connexion à votre compte</h1>
                  <p className="auth-subtitle text-muted">
                    Accédez à votre espace personnel
                  </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="auth-form">
                  {/* Email */}
                  <div className="mb-3">
                    <label
                      htmlFor="login-email"
                      className="form-label fw-semibold"
                    >
                      Email
                    </label>
                    <div className="input-group">
                      <span className="input-group-text auth-input-icon">
                        <Mail size={18} />
                      </span>
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        className={`form-control auth-input ${
                          errors.email ? "is-invalid" : ""
                        }`}
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
                  <div className="mb-4">
                    <label
                      htmlFor="login-password"
                      className="form-label fw-semibold"
                    >
                      Mot de passe
                    </label>
                    <div className="input-group">
                      <span className="input-group-text auth-input-icon">
                        <Lock size={18} />
                      </span>
                      <input
                        id="login-password"
                        name="motDePasse"
                        type={showPassword ? "text" : "password"}
                        className={`form-control auth-input ${
                          errors.motDePasse ? "is-invalid" : ""
                        }`}
                        placeholder="Mot de passe"
                        value={form.motDePasse}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary auth-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.motDePasse && (
                        <div className="invalid-feedback">
                          {errors.motDePasse}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message d'erreur général (retour API) */}
                  {errors.submit && (
                    <div
                      className="alert alert-danger py-2 mb-3"
                      role="alert"
                    >
                      <small>{errors.submit}</small>
                    </div>
                  )}

                  {/* Bouton de connexion */}
                  <button
                    type="submit"
                    className="btn btn-primary auth-btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Connexion...
                      </>
                    ) : (
                      <>
                        Connexion
                        <ArrowRight size={18} className="ms-2" />
                      </>
                    )}
                  </button>

                  {/* Lien inscription */}
                  <div className="text-center">
                    <p className="mb-0 text-muted small">
                      Pas encore de compte ?{" "}
                      <Link to="/register" className="auth-link">
                        Inscription
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
