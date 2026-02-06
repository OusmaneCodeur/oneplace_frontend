import axiosInstance from "../axios/axiosInstance";

/**
 * Service d'accès aux produits :
 * toutes les méthodes reposent sur `axiosInstance`,
 * qui gère déjà la baseURL et le JWT dans les en‑têtes.
 */
export const getProducts = async () => {
  const res = await axiosInstance.get("/products");
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axiosInstance.get(`/products/${id}`);
  return res.data;
};

/**
 * Création d'un produit (back‑office).
 * Envoi de données `multipart/form-data` pour gérer les images.
 */
export const createProduct = async (data) => {
  const res = await axiosInstance.post("/products/new-product", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * Mise à jour d'un produit existant.
 */
export const updateProduct = async (id, data) => {
  const res = await axiosInstance.put(`/products/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * Suppression d'un produit.
 */
export const deleteProduct = async (id) => {
  const res = await axiosInstance.delete(`/products/${id}`);
  return res.data;
};
