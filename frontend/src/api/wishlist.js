import API from "./axios";

export const wishlistAPI = {
  getWishlist: () => API.get("/wishlist"),
  addToWishlist: (product_id, variant_id = null) => API.post("/wishlist", { product_id, variant_id }),
  removeFromWishlist: (id) => API.delete(`/wishlist/${id}`),
};

export const profileAPI = {
  getProfile: () => API.get("/users/profile"),
  updateProfile: (data) => API.put("/users/profile", data),
};
