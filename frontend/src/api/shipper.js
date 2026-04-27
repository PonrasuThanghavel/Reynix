import API from "./axios";

export const shipperAPI = {
  getAvailableShipments: () => API.get("/shipper/available-shipments"),
  getAssignedShipments: () => API.get("/shipper/shipments"),
  getShipmentById: (id) => API.get(`/shipper/shipments/${id}`),
  updateShipmentStatus: (id, data) => API.put(`/shipper/shipments/${id}/status`, data),
  confirmShipment: (id, data) => API.put(`/shipper/shipments/${id}/confirm`, data),
};
