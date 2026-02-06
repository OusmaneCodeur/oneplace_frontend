import axios from "axios";

// URL de base de l'API, configurée via les variables d'environnement (.env)
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Appel API : connexion utilisateur.
 *
 * Envoie les identifiants au backend et renvoie :
 * - le token JWT
 * - éventuellement les informations utilisateur
 *
 * La logique métier (stockage du token, redirections, etc.)
 * est gérée dans le contexte d'authentification / les pages React.
 */
export const login = async (data) => {
  const res = await axios.post(`${API_URL}/users/login`, data);
  return res.data;
};

/**
 * Appel API : inscription utilisateur.
 *
 * Crée un nouvel utilisateur côté backend.
 */
export const register = async (data) => {
  const res = await axios.post(`${API_URL}/users/register`, data);
  return res.data;
};
