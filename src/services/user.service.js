import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Retourne les en‑têtes d'authentification (JWT) pour les appels admin.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Récupère tous les utilisateurs (vue administration).
 */
export const getUsers = async () => {
  const res = await axios.get(`${API_URL}/users/all`, getAuthHeaders());
  return res.data;
};

/**
 * Récupère le détail d'un utilisateur.
 */
export const getUserById = async (id) => {
  const res = await axios.get(`${API_URL}/users/${id}`, getAuthHeaders());
  return res.data;
};

/**
 * Supprime un utilisateur.
 */
export const deleteUser = async (id) => {
  return axios.delete(`${API_URL}/users/${id}`, getAuthHeaders());
};

/**
 * Met à jour le rôle d'un utilisateur (client, admin, moderator, etc.).
 */
export const updateUserRole = async (id, role) => {
  return axios.put(
    `${API_URL}/users/${id}/role`,
    { role },
    getAuthHeaders()
  );
};

/**
 * Active / désactive un utilisateur sans le supprimer.
 */
export const toggleUserStatus = async (id) => {
  return axios.put(
    `${API_URL}/users/${id}/toggle-status`,
    {},
    getAuthHeaders()
  );
};
