import API from "./axios";

export const orderAPI = {
  getOrders: (params) => API.get("/orders", { params }),
  getOrderById: (id) => API.get(`/orders/${id}`),
  createOrder: (data) => API.post("/orders", data),
};

export const addressAPI = {
  getAddresses: () => API.get("/addresses"),
  createAddress: (data) => API.post("/addresses", data),
  updateAddress: (id, data) => API.put(`/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/addresses/${id}`),
};
