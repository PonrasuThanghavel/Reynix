import API from "./axios";

export const cartAPI = {
  getCart: () => API.get("/cart"),
  addItem: (data) => API.post("/cart/items", data),
  updateItem: (itemId, data) => API.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => API.delete(`/cart/items/${itemId}`),
  clearCart: () => API.delete("/cart/clear"),
};
