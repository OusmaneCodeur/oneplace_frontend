import axios from "axios";

// URL de base de l'API (backend Express)
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Construit les en‑têtes d'authentification à partir du JWT stocké côté navigateur.
 * Utilisé pour toutes les actions protégées liées aux commandes.
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
 * Récupère toutes les commandes (vue admin / modération).
 */
export const getOrders = async () => {
  const res = await axios.get(`${API_URL}/orders`, getAuthHeaders());
  return res.data;
};

/**
 * Récupère uniquement les commandes de l'utilisateur connecté.
 */
export const getMyOrders = async () => {
  const res = await axios.get(`${API_URL}/orders/me`, getAuthHeaders());
  return res.data;
};

/**
 * Détail d'une commande par identifiant.
 */
export const getOrderById = async (id) => {
  const res = await axios.get(`${API_URL}/orders/${id}`, getAuthHeaders());
  return res.data;
};

/**
 * Création d'une nouvelle commande.
 * Utilisée lors du checkout côté client.
 */
export const createOrder = async (data) => {
  const res = await axios.post(`${API_URL}/orders`, data, getAuthHeaders());
  return res.data;
};

/**
 * Mise à jour du statut d'une commande (admin / modération).
 */
export const updateOrderStatus = async (id, status) => {
  const res = await axios.put(
    `${API_URL}/orders/${id}/status`,
    { status },
    getAuthHeaders()
  );
  return res.data;
};

/**
 * Suppression d'une commande.
 */
export const deleteOrder = async (id) => {
  const res = await axios.delete(`${API_URL}/orders/${id}`, getAuthHeaders());
  return res.data;
};
