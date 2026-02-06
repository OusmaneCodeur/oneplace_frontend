import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Liste toutes les livraisons (vue administration / logistique).
 */
export const getDeliveries = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/deliveries`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

/**
 * Crée une nouvelle livraison.
 */
export const createDelivery = async (data) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_URL}/deliveries`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Met à jour le statut ou les informations d'une livraison existante.
 */
export const updateDeliveryStatus = async (id, data) => {
  const token = localStorage.getItem("token");

  const res = await axios.put(`${API_URL}/deliveries/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

/**
 * Supprime une livraison.
 */
export const deleteDelivery = async (id) => {
  const token = localStorage.getItem("token");
  const res = await axios.delete(`${API_URL}/deliveries/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
