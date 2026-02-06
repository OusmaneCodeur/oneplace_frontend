import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

/**
 * Contexte global d'authentification.
 *
 * - Stocke l'utilisateur actuellement connecté (décodé depuis le JWT)
 * - Hydrate l'état au chargement de l'application à partir du `localStorage`
 * - Expose les fonctions `loginUser` et `logout` pour le reste de l'application
 */
const AuthContext = createContext();

/**
 * Fournisseur d'authentification.
 * Enveloppe l'application et met à disposition les informations utilisateur + helpers.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /**
   * Au premier rendu, on regarde s'il existe déjà un JWT en local.
   * Si oui, on le décode pour reconstruire l'utilisateur courant
   * (utilisé notamment pour les rôles et les routes protégées).
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);

  /**
   * Connecte un utilisateur :
   * - enregistre le token dans le `localStorage`
   * - met à jour l'état `user` avec les informations fournies ou décodées
   *
   * ⚠️ On ne change PAS la structure de l'objet utilisateur pour ne pas
   * casser la logique existante (routes protégées, rôles, etc.).
   */
  const loginUser = (token, userData) => {
    localStorage.setItem("token", token);

    if (userData && userData._id) {
      // Cas où l'API renvoie déjà un objet utilisateur détaillé
      setUser({ id: userData._id, ...userData, role: userData.role });
    } else {
      // Fallback : on se base uniquement sur les informations encodées dans le JWT
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  };

  /**
   * Déconnecte l'utilisateur :
   * - supprime le token
   * - réinitialise l'état.
   */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook utilitaire pour accéder facilement au contexte d'authentification.
 * À utiliser exclusivement à l'intérieur d'un `<AuthProvider>`.
 */
export const useAuth = () => useContext(AuthContext);
