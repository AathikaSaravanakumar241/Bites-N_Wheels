import { useEffect, useState } from "react";
import { get as apiGet, post as apiPost, describeError } from "../../api.js";
import "./TruckBilling.css";

const MENU_API_URL = "/api/v1/truck/menu-items";
const ORDER_API_URL = "/api/v1/truck/offline-orders";

function TruckBilling() {
    const [menuItems, setMenuItems] = useState([]);
    const [billItems, setBillItems] = useState([]);

    const [customerName, setCustomerName] = useState("");
    const [selectedItem, setSelectedItem] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        getMenuItems();
    }, []);

    function getMenuItems() {
        setLoading(true);
        setError("");

        apiGet(MENU_API_URL)
            .then((data) => {
                const availableItems = Array.isArray(data)
                    ? data.filter((item) => item.available === true)
                    : [];
                setMenuItems(availableItems);
            })
            .catch((err) => {
                setError(describeError(err, "Unable to load food items."));
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function addItem() {
        setError("");
        setMessage("");

        if (!selectedItem) {
            setError("Please select a food item.");
            return;
        }

        if (quantity < 1) {
            setError("Quantity must be at least 1.");
            return;
        }

        const item = menuItems.find(
            (menuItem) => String(menuItem.itemId) === String(selectedItem)
        );

        if (!item) {
            setError("Selected food item was not found.");
            return;
        }

        const existingItem = billItems.find(
            (billItem) => billItem.itemId === item.itemId
        );

        if (existingItem) {
            setBillItems(
                billItems.map((billItem) =>
                    billItem.itemId === item.itemId
                        ? {
                              ...billItem,
                              quantity: billItem.quantity + Number(quantity),
                          }
                        : billItem
                )
            );
        } else {
            setBillItems([
                ...billItems,
                {
                    itemId: item.itemId,
                    name: item.name,
                    price: Number(item.price),
                    quantity: Number(quantity),
                },
            ]);
        }

        setSelectedItem("");
        setQuantity(1);
    }

    function increaseQuantity(itemId) {
        setBillItems(
            billItems.map((item) =>
                item.itemId === itemId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    }

    function decreaseQuantity(itemId) {
        setBillItems(
            billItems
                .map((item) =>
                    item.itemId === itemId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    }

    function removeItem(itemId) {
        setBillItems(
            billItems.filter((item) => item.itemId !== itemId)
        );
    }

    function getSubtotal(item) {
        return Number(item.price) * item.quantity;
    }

    function getTotal() {
        return billItems.reduce(
            (total, item) => total + getSubtotal(item),
            0
        );
    }

    function clearBill() {
        setCustomerName("");
        setSelectedItem("");
        setQuantity(1);
        setPaymentMethod("CASH");
        setBillItems([]);
        setError("");
        setMessage("");
    }

    function generateBill() {
        setError("");
        setMessage("");

        if (!customerName.trim()) {
            setError("Please enter the customer name.");
            return;
        }

        if (billItems.length === 0) {
            setError("Please add at least one food item.");
            return;
        }

        const body = {
            stationId:     null,
            totalAmount:   getTotal(),
            // the backend reads "price" here, not "priceAtOrder"
            items: billItems.map((item) => ({
                itemId:   item.itemId,
                quantity: item.quantity,
                price:    item.price,
            })),
        };

        apiPost(ORDER_API_URL, body)
            .then(() => {
                setMessage("Bill generated and order saved successfully.");
                setTimeout(() => { clearBill(); }, 1500);
            })
            .catch((err) => {
                // surface what the backend actually said - a swallowed error
                // here is why this failure looked like "nothing happens"
                setError(describeError(err, "Failed to save the order."));
            });
    }

    return (
        <div className="truck-billing-container">

            <div className="page-header">
                <div>
                    <h1>Billing / Offline Order</h1>
                    <p>
                        Create bills for customers purchasing directly from
                        the food truck.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={getMenuItems}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh Menu"}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            <section className="billing-section">

                <div className="section-title">
                    <h2>Create Offline Bill</h2>
                    <p>
                        Add food items and generate the customer's bill.
                    </p>
                </div>

                <div className="billing-form">

                    <div className="form-group">
                        <label>Customer Name</label>

                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) =>
                                setCustomerName(e.target.value)
                            }
                            placeholder="Enter customer name"
                        />
                    </div>

                    <div className="food-selection">

                        <div className="form-group">
                            <label>Select Food Item</label>

                            <select
                                value={selectedItem}
                                onChange={(e) =>
                                    setSelectedItem(e.target.value)
                                }
                                disabled={loading}
                            >
                                <option value="">
                                    Select food item
                                </option>

                                {menuItems.map((item) => (
                                    <option
                                        key={item.itemId}
                                        value={item.itemId}
                                    >
                                        {item.name} - ₹
                                        {Number(item.price).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group quantity-group">
                            <label>Quantity</label>

                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(Number(e.target.value))
                                }
                            />
                        </div>

                        <button
                            className="add-item-button"
                            onClick={addItem}
                        >
                            Add Item
                        </button>

                    </div>

                </div>

            </section>

            <section className="bill-items-section">

                <div className="section-header">
                    <div>
                        <h2>Bill Items</h2>
                        <p>
                            Food items added to the current bill.
                        </p>
                    </div>

                    <div className="item-count">
                        Items: {billItems.length}
                    </div>
                </div>

                {billItems.length === 0 ? (

                    <div className="no-items">
                        <h3>No Items Added</h3>
                        <p>
                            Select a food item and click "Add Item" to create
                            the bill.
                        </p>
                    </div>

                ) : (

                    <div className="billing-table-container">

                        <table className="billing-table">

                            <thead>
                                <tr>
                                    <th>Food Item</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {billItems.map((item) => (

                                    <tr key={item.itemId}>

                                        <td>
                                            <span className="food-name">
                                                {item.name}
                                            </span>
                                        </td>

                                        <td>
                                            ₹{item.price.toFixed(2)}
                                        </td>

                                        <td>

                                            <div className="quantity-control">

                                                <button
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            item.itemId
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>

                                                <span>
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        increaseQuantity(
                                                            item.itemId
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>

                                        </td>

                                        <td>
                                            <span className="subtotal">
                                                ₹
                                                {getSubtotal(item).toFixed(2)}
                                            </span>
                                        </td>

                                        <td>

                                            <button
                                                className="remove-button"
                                                onClick={() =>
                                                    removeItem(item.itemId)
                                                }
                                            >
                                                Remove
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

            <section className="bill-summary">

                <div className="payment-section">

                    <label>Payment Method</label>

                    <select
                        value={paymentMethod}
                        onChange={(e) =>
                            setPaymentMethod(e.target.value)
                        }
                    >
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                    </select>

                </div>

                <div className="total-section">

                    <span>Total Amount</span>

                    <strong>
                        ₹{getTotal().toFixed(2)}
                    </strong>

                </div>

            </section>

            <div className="billing-actions">

                <button
                    className="generate-button"
                    onClick={generateBill}
                >
                    Generate Bill
                </button>

                <button
                    className="clear-button"
                    onClick={clearBill}
                >
                    Clear Bill
                </button>

            </div>

        </div>
    );
}

export default TruckBilling;