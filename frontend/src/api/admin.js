import API from "./axios";

export const adminAPI = {
  // Users
  getUsers: (params) => API.get("/users", { params }),

  // Orders (admin sees all)
  getOrders: (params) => API.get("/orders", { params }),
  updateOrderStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),

  // Products (admin sees all)
  getProducts: (params) => API.get("/products", { params }),
  deleteProduct: (id) => API.delete(`/products/${id}`),

  // Categories
  getCategories: () => API.get("/categories"),
  createCategory: (data) => API.post("/categories", data),
  updateCategory: (id, data) => API.put(`/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/categories/${id}`),

  // Brands
  getBrands: () => API.get("/brands"),
  createBrand: (data) => API.post("/brands", data),
  updateBrand: (id, data) => API.put(`/brands/${id}`, data),
  deleteBrand: (id) => API.delete(`/brands/${id}`),

  // Inventory
  getLowStock: () => API.get("/inventory/low-stock"),
};
