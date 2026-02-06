import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Construit les en‑têtes avec le token JWT pour les avis.
 */
const getTokenHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Récupère tous les avis (vue administration).
 */
export const getReviews = async () => {
  const res = await axios.get(`${API_URL}/reviews`, getTokenHeader());
  return res.data;
};

/**
 * Récupère les avis associés à un produit donné.
 */
export const getReviewsByProduct = async (productId) => {
  const res = await axios.get(
    `${API_URL}/reviews/product/${productId}`,
    getTokenHeader()
  );
  return res.data;
};

/**
 * Création d'un avis par un client connecté.
 */
export const createReview = async (data) => {
  const res = await axios.post(`${API_URL}/reviews`, data, getTokenHeader());
  return res.data;
};

/** ------------------- ACTIONS ADMIN ------------------- */

/**
 * Mise à jour du statut d'un avis (validé, rejeté, en attente, etc.).
 */
export const updateReviewStatus = async (id, status) => {
  const res = await axios.patch(
    `${API_URL}/reviews/${id}/status`,
    { status },
    getTokenHeader()
  );
  return res.data;
};

/**
 * Suppression d'un avis.
 */
export const deleteReview = async (id) => {
  const res = await axios.delete(
    `${API_URL}/reviews/${id}`,
    getTokenHeader()
  );
  return res.data;
};
