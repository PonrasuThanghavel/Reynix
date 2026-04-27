import API from "./axios";

export const productAPI = {
  getProducts: (params) => API.get("/products", { params }),
  getProductById: (id) => API.get(`/products/${id}`),
};

export const categoryAPI = {
  getCategories: () => API.get("/categories"),
};

export const brandAPI = {
  getBrands: () => API.get("/brands"),
};
