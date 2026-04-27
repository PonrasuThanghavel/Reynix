import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlineArchiveBox,
  HiOutlineClipboardDocumentList,
  HiOutlineMapPin,
  HiOutlineTruck,
  HiOutlineUser,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { shipperAPI } from "../../api/shipper";
import "./ShipperDashboard.css";

/**
 * Dashboard for shippers to review packed seller orders and assigned deliveries.
 *
 * @returns {JSX.Element} The shipper dashboard view.
 */
function ShipperDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableShipments, setAvailableShipments] = useState([]);
  const [assignedShipments, setAssignedShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [availableRes, assignedRes] = await Promise.allSettled([
        shipperAPI.getAvailableShipments(),
        shipperAPI.getAssignedShipments(),
      ]);

      if (availableRes.status === "fulfilled") {
        setAvailableShipments(availableRes.value.data.data.shipments || []);
      }

      if (assignedRes.status === "fulfilled") {
        setAssignedShipments(assignedRes.value.data.data.shipments || []);
      }
    } catch {
      toast.error("Failed to load shipper dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "shipper") {
      navigate("/");
      return;
    }

    startTransition(() => {
      loadData();
    });
  }, [user, navigate, loadData]);

  const packedItemCount = useMemo(
    () =>
      availableShipments.reduce(
        (total, shipment) => total + (shipment.sellerOrder?.items?.length || 0),
        0
      ),
    [availableShipments]
  );

  const assignedItemCount = useMemo(
    () =>
      assignedShipments.reduce(
        (total, shipment) => total + (shipment.sellerOrder?.items?.length || 0),
        0
      ),
    [assignedShipments]
  );

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not set";

  if (loading) {
    return (
      <div className="shipper-dashboard">
        <div className="products-loading">
          <div className="loading-spinner" />
          <p>Loading shipper dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipper-dashboard">
      <div className="shipper-header">
        <h1>Shipper Dashboard</h1>
        <p>See packed seller orders ready for delivery and track your assigned shipments.</p>
      </div>

      <div className="shipper-stats">
        <div className="shipper-stat-card">
          <div className="shipper-stat-icon amber">
            <HiOutlineArchiveBox />
          </div>
          <div className="shipper-stat-info">
            <h3>{availableShipments.length}</h3>
            <p>Packed Shipments</p>
          </div>
        </div>
        <div className="shipper-stat-card">
          <div className="shipper-stat-icon blue">
            <HiOutlineClipboardDocumentList />
          </div>
          <div className="shipper-stat-info">
            <h3>{packedItemCount}</h3>
            <p>Packed Items</p>
          </div>
        </div>
        <div className="shipper-stat-card">
          <div className="shipper-stat-icon green">
            <HiOutlineTruck />
          </div>
          <div className="shipper-stat-info">
            <h3>{assignedShipments.length}</h3>
            <p>Assigned Shipments</p>
          </div>
        </div>
        <div className="shipper-stat-card">
          <div className="shipper-stat-icon purple">
            <HiOutlineClipboardDocumentList />
          </div>
          <div className="shipper-stat-info">
            <h3>{assignedItemCount}</h3>
            <p>Assigned Items</p>
          </div>
        </div>
      </div>

      <section className="shipper-section">
        <div className="shipper-section-head">
          <h2>Packed By Sellers</h2>
          <span>{availableShipments.length} ready for assignment</span>
        </div>

        {availableShipments.length === 0 ? (
          <div className="shipper-empty">
            <HiOutlineArchiveBox />
            <p>No packed seller orders are waiting right now.</p>
          </div>
        ) : (
          <div className="shipper-card-grid">
            {availableShipments.map((shipment) => (
              <article className="shipper-card" key={`available-${shipment.id}`}>
                <div className="shipper-card-top">
                  <div>
                    <span className="shipper-card-id">Shipment #{shipment.id}</span>
                    <span className="shipper-card-status pending">packed</span>
                  </div>
                  <span className="shipper-card-date">{formatDate(shipment.created_at)}</span>
                </div>

                <div className="shipper-meta">
                  <span>
                    <HiOutlineUser /> Seller: {shipment.sellerOrder?.seller?.full_name || "Unknown seller"}
                  </span>
                  <span>
                    <HiOutlineClipboardDocumentList /> Order: {shipment.sellerOrder?.order?.order_number || shipment.order_id}
                  </span>
                  <span>
                    <HiOutlineMapPin /> {shipment.sellerOrder?.order?.shippingAddress?.city || "Unknown city"}
                  </span>
                </div>

                <div className="shipper-item-list">
                  {(shipment.sellerOrder?.items || []).map((item) => (
                    <div className="shipper-item" key={item.id}>
                      <span>
                        {item.product_name}
                        {item.variant_name ? ` (${item.variant_name})` : ""}
                      </span>
                      <strong>x{item.quantity}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="shipper-section">
        <div className="shipper-section-head">
          <h2>Assigned To You</h2>
          <span>{assignedShipments.length} active records</span>
        </div>

        {assignedShipments.length === 0 ? (
          <div className="shipper-empty">
            <HiOutlineTruck />
            <p>You do not have any assigned shipments yet.</p>
          </div>
        ) : (
          <div className="shipper-card-grid">
            {assignedShipments.map((shipment) => (
              <article className="shipper-card" key={`assigned-${shipment.id}`}>
                <div className="shipper-card-top">
                  <div>
                    <span className="shipper-card-id">Shipment #{shipment.id}</span>
                    <span className={`shipper-card-status ${shipment.status}`}>{shipment.status}</span>
                  </div>
                  <span className="shipper-card-date">{formatDate(shipment.assigned_at || shipment.created_at)}</span>
                </div>

                <div className="shipper-meta">
                  <span>
                    <HiOutlineUser /> Seller: {shipment.sellerOrder?.seller?.full_name || "Unknown seller"}
                  </span>
                  <span>
                    <HiOutlineClipboardDocumentList /> Order: {shipment.sellerOrder?.order?.order_number || shipment.order_id}
                  </span>
                  <span>
                    <HiOutlineMapPin />{" "}
                    {shipment.sellerOrder?.order?.shippingAddress
                      ? `${shipment.sellerOrder.order.shippingAddress.city}, ${shipment.sellerOrder.order.shippingAddress.state}`
                      : "Address unavailable"}
                  </span>
                </div>

                <div className="shipper-item-list">
                  {(shipment.sellerOrder?.items || []).map((item) => (
                    <div className="shipper-item" key={item.id}>
                      <span>
                        {item.product_name}
                        {item.variant_name ? ` (${item.variant_name})` : ""}
                      </span>
                      <strong>x{item.quantity}</strong>
                    </div>
                  ))}
                </div>

                <div className="shipper-card-footer">
                  <span>Carrier: {shipment.carrier || "Not assigned"}</span>
                  <span>Tracking: {shipment.tracking_number || "Not assigned"}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ShipperDashboard;
