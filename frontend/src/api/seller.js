import API from "./axios";

export const sellerAPI = {
  // Seller orders
  getOrders: (params) => API.get("/seller/orders", { params }),
  packOrder: (id) => API.put(`/seller/orders/${id}/pack`),
  assignShipper: (id, data) => API.put(`/seller/orders/${id}/assign-shipper`, data),

  // Products (seller uses the same product endpoints)
  getMyProducts: (params) => API.get("/products", { params }),
  createProduct: (data) => API.post("/products", data),
  updateProduct: (id, data) => API.put(`/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/products/${id}`),
};
