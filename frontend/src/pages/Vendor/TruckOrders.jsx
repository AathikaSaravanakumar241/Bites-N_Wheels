import { useEffect, useState } from "react";
import { get as apiGet, patch as apiPatch, describeError } from "../../api.js";
import "./TruckOrders.css";

const API_URL = "/api/v1/truck/orders";

function TruckOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        // The API now sends customerName directly. It used to read order.user,
        // which is @JsonIgnore'd on the entity and so was always undefined -
        // every order showed as "Guest".
        return order.customerName || "Walk-in";
    }

    function getFoodItems(order) {
        if (!order.items || order.items.length === 0) {
            return "No food items";
        }

        return order.items.map((item, index) => {
            // Was item.item?.name - also @JsonIgnore'd, hence "Food Item".
            const itemName = item.name || "Item";
            const quantity = item.quantity || 1;

            return (
                <span className="food-item" key={index}>
                    {itemName} x {quantity}
                </span>
            );
        });
    }

    function getStatusClass(status) {
        if (!status) {
            return "status";
        }

        return `status ${status.toLowerCase()}`;
    }

    function formatDateTime(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString();
    }

    function formatAmount(value) {
        if (value === null || value === undefined) {
            return "₹0.00";
        }

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

    function renderActions(order) {
        const status = order.status;

        if (status === "PENDING") {
            return (
                <>
                    <button
                        className="action-button accept-button"
                        onClick={() => acceptOrder(order.orderId)}
                    >
                        Accept
                    </button>

                    <button
                        className="action-button reject-button"
                        onClick={() => rejectOrder(order.orderId)}
                    >
                        Reject
                    </button>
                </>
            );
        }

        if (status === "ACCEPTED") {
            return (
                <button
                    className="action-button prepare-button"
                    onClick={() => startPreparing(order.orderId)}
                >
                    Start Preparing
                </button>
            );
        }

        if (status === "PREPARING") {
            return (
                <button
                    className="action-button ready-button"
                    onClick={() => markReady(order.orderId)}
                >
                    Mark Ready
                </button>
            );
        }

        if (status === "READY") {
            return (
                <button
                    className="action-button complete-button"
                    onClick={() => completeOrder(order.orderId)}
                >
                    Complete
                </button>
            );
        }

        if (status === "COMPLETED") {
            return (
                <span className="completed-text">
                    Order Completed
                </span>
            );
        }

        if (status === "REJECTED") {
            return (
                <span className="rejected-text">
                    Order Rejected
                </span>
            );
        }

        return (
            <span className="no-action">
                No Action
            </span>
        );
    }

    return (
        <div className="truck-orders-container">

            <div className="page-header">
                <div>
                    <h1>Truck Orders</h1>

                    <p>
                        View and manage customer orders for your food truck.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={getOrders}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh Orders"}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <section className="orders-section">

                <div className="orders-header">
                    <div>
                        <h2>Customer Orders</h2>

                        <p className="section-description">
                            Accept, prepare and complete customer orders.
                        </p>
                    </div>

                    <div className="order-count">
                        Total Orders: {orders.length}
                    </div>
                </div>

                {loading ? (
                    <div className="loading">
                        <p>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="no-orders">
                        <h3>No Orders Found</h3>

                        <p>
                            There are currently no orders for your truck.
                        </p>
                    </div>
                ) : (
                    <div className="orders-table-container">

                        <table className="orders-table">

                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Food Items</th>
                                    <th>Order Type</th>
                                    <th>Schedule Type</th>
                                    <th>Rejected Reason</th>
                                    <th>Scheduled Time</th>
                                    <th>Total Amount</th>
                                    <th>Created At</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {orders.map((order) => (
                                    <tr key={order.orderId}>

                                        <td>
                                            <span className="order-id">
                                                #{order.orderId}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="customer-name">
                                                {getCustomerName(order)}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="food-items">
                                                {getFoodItems(order)}
                                            </div>
                                        </td>

                                        <td>
                                            <span className="order-type">
                                                {order.orderType || "-"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="schedule-type">
                                                {getScheduleType(order)}
                                            </span>
                                        </td>

                                        <td>
                                            {order.rejectReason ? (
                                                <span className="reject-reason">
                                                    {order.rejectReason}
                                                </span>
                                            ) : (
                                                <span className="not-available">
                                                    -
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <span className="scheduled-time">
                                                {formatDateTime(
                                                    order.scheduledTime
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="order-price">
                                                {formatAmount(
                                                    order.totalAmount
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="created-at">
                                                {formatDateTime(
                                                    order.createdAt
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    order.status
                                                )}
                                            >
                                                {order.status || "UNKNOWN"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="order-actions">
                                                {renderActions(order)}
                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </div>
    );
}

export default TruckOrders;