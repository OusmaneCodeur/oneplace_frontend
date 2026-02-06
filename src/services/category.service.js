import axiosInstance from "../axios/axiosInstance";

/**
 * Service lié aux catégories de produits.
 */
export const getCategories = async () => {
  const res = await axiosInstance.get("/categories");
  return res.data;
};

export const getCategoryById = async (id) => {
  const res = await axiosInstance.get(`/categories/${id}`);
  return res.data;
};

export const createCategory = async (data) => {
  const res = await axiosInstance.post("/categories/new-category", data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await axiosInstance.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await axiosInstance.delete(`/categories/${id}`);
  return res.data;
};
