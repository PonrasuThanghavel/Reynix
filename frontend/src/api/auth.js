import API from "./axios";

export const authAPI = {
  register: (data) => API.post("/users/register", data),
  login: (data) => API.post("/users/login", data),
  getProfile: () => API.get("/users/profile"),
  updateProfile: (data) => API.put("/users/profile", data),
};
