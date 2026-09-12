import { useEffect, useMemo, useState } from "react";
import { get as apiGet, patch as apiPatch, describeError } from "../../api.js";
import "./TruckOrders.css";

const API_URL = "/api/v1/truck/orders";

const TABS = [
  { key: "ALL", label: "All Orders" },
  { key: "PENDING", label: "Pending" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "PREPARING", label: "Preparing" },
  { key: "READY", label: "Ready" },
  { key: "COMPLETED", label: "Completed" },
];

function TruckOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    getOrders();
  }, []);

  function getOrders() {
    setLoading(true);
    setError("");
    apiGet(API_URL)
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(describeError(err, "Unable to load orders."));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function updateStatus(orderId, status) {
    setError("");
    apiPatch(`${API_URL}/${orderId}/status`, { status })
      .then(() => {
        getOrders();
      })
      .catch(() => {
        setError("Unable to update order status.");
      });
  }

  function acceptOrder(orderId) {
    updateStatus(orderId, "ACCEPTED");
  }

  function rejectOrder(orderId) {
    updateStatus(orderId, "REJECTED");
  }

  function startPreparing(orderId) {
    updateStatus(orderId, "PREPARING");
  }

  function markReady(orderId) {
    updateStatus(orderId, "READY");
  }

  function completeOrder(orderId) {
    updateStatus(orderId, "COMPLETED");
  }

  function getCustomerName(order) {
    return order.customerName || "Walk-in";
  }

  function getFoodItems(order) {
    if (!order.items || order.items.length === 0) {
      return "No food items";
    }
    return order.items.map((item, index) => {
      const itemName = item.name || "Item";
      const quantity = item.quantity || 1;
      return (
        <span className="to-item-badge" key={index}>
          {itemName} × {quantity}
        </span>
      );
    });
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function formatAmount(value) {
    if (value === null || value === undefined) return "₹0.00";
    return `₹${Number(value).toFixed(2)}`;
  }

  function getScheduleType(order) {
    return (
      order.schedule?.scheduleType ||
      order.schedule?.type ||
      order.scheduleType ||
      "-"
    );
  }

  const counts = useMemo(() => {
    const map = { ALL: orders.length, PENDING: 0, ACCEPTED: 0, PREPARING: 0, READY: 0, COMPLETED: 0 };
    orders.forEach((o) => {
      if (map[o.status] !== undefined) map[o.status]++;
    });
    return map;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  function renderActions(order) {
    const status = order.status;
    if (status === "PENDING") {
      return (
        <div className="to-action-group">
          <button
            type="button"
            className="to-btn-primary"
            onClick={() => acceptOrder(order.orderId)}
          >
            Accept
          </button>
          <button
            type="button"
            className="to-btn-secondary"
            onClick={() => rejectOrder(order.orderId)}
          >
            Reject
          </button>
        </div>
      );
    }
    if (status === "ACCEPTED") {
      return (
        <button
          type="button"
          className="to-btn-primary"
          onClick={() => startPreparing(order.orderId)}
        >
          Start Preparing
        </button>
      );
    }
    if (status === "PREPARING") {
      return (
        <button
          type="button"
          className="to-btn-primary"
          onClick={() => markReady(order.orderId)}
        >
          Mark Ready
        </button>
      );
    }
    if (status === "READY") {
      return (
        <button
          type="button"
          className="to-btn-dark"
          onClick={() => completeOrder(order.orderId)}
        >
          Complete
        </button>
      );
    }
    if (status === "COMPLETED") {
      return <span className="to-status-pill is-completed">Completed</span>;
    }
    if (status === "REJECTED") {
      return <span className="to-status-pill is-rejected">Rejected</span>;
    }
    return <span className="to-muted-text">-</span>;
  }

  function getStatusPill(status) {
    switch (status) {
      case "PENDING":
        return <span className="to-status-pill is-pending">Pending</span>;
      case "ACCEPTED":
        return <span className="to-status-pill is-accepted">Accepted</span>;
      case "PREPARING":
        return <span className="to-status-pill is-preparing">Preparing</span>;
      case "READY":
        return <span className="to-status-pill is-ready">Ready</span>;
      case "COMPLETED":
        return <span className="to-status-pill is-completed">Completed</span>;
      case "REJECTED":
        return <span className="to-status-pill is-rejected">Rejected</span>;
      default:
        return <span className="to-status-pill">{status || "Unknown"}</span>;
    }
  }

  return (
    <div className="to-container">
      {error && <div className="to-alert is-error">{error}</div>}

      {/* TOP CONTROLS & TABS */}
      <div className="to-toolbar">
        <div className="to-tabs">
          {TABS.map((tab) => {
            const count = counts[tab.key] ?? 0;
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={`to-tab ${isActive ? "is-active" : ""}`}
                onClick={() => setStatusFilter(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="to-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="to-refresh-btn"
          onClick={getOrders}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh Orders"}
        </button>
      </div>

      {/* ORDERS CARD & TABLE */}
      <div className="to-card">
        <div className="to-card-header">
          <div className="to-card-header-left">
            <h2 className="to-card-title">
              {statusFilter === "ALL" ? "All Orders" : `${TABS.find((t) => t.key === statusFilter)?.label} Orders`}
            </h2>
            <span className="to-card-count">{filteredOrders.length} orders</span>
          </div>
        </div>

        {loading && orders.length === 0 ? (
          <div className="to-empty-msg">
            <p>Loading real-time orders…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="to-empty-msg">
            <h3>No orders found</h3>
            <p>There are currently no orders in this category.</p>
          </div>
        ) : (
          <div className="to-table-wrap">
            <table className="to-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Food Items</th>
                  <th>Type</th>
                  <th>Schedule</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="is-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <span className="to-order-id">#{order.orderId}</span>
                    </td>
                    <td>
                      <span className="to-customer-name">
                        {getCustomerName(order)}
                      </span>
                    </td>
                    <td>
                      <div className="to-items-wrap">
                        {getFoodItems(order)}
                      </div>
                    </td>
                    <td>
                      <span className="to-badge-neutral">
                        {order.orderType || "ONLINE"}
                      </span>
                    </td>
                    <td>
                      <span className="to-muted-text">
                        {getScheduleType(order)}
                      </span>
                    </td>
                    <td>
                      <span className="to-time-text">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span className="to-amount">
                        {formatAmount(order.totalAmount)}
                      </span>
                    </td>
                    <td>
                      {getStatusPill(order.status)}
                    </td>
                    <td className="is-right">
                      {renderActions(order)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TruckOrders;