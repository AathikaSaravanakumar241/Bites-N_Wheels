import { useEffect, useState, useCallback } from "react";
import { get as apiGet, post as apiPost, put as apiPut, del as apiDel, describeError } from "../../api.js";
import FoodTruckLoader from "../../components/FoodTruckLoader.jsx";
import "./TruckMenu.css";

const API_URL = "/api/v1/truck/menu-items";

/* ─── Toast helpers ─── */
let _toastId = 0;
function useToasts() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((text, type = "success") => {
        const id = ++_toastId;
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Confirm action">
            <div className="confirm-box">
                <div className="confirm-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <p className="confirm-message">{message}</p>
                <div className="confirm-buttons">
                    <button className="confirm-cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="confirm-delete-btn" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Toast List ─── */
function ToastList({ toasts, onRemove }) {
    return (
        <div className="toast-stack" aria-live="polite" aria-atomic="false">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast--${t.type}`} role="status">
                    <span className="toast-icon" aria-hidden="true">
                        {t.type === "success"
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        }
                    </span>
                    <span className="toast-text">{t.text}</span>
                    <button className="toast-close" aria-label="Dismiss" onClick={() => onRemove(t.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                </div>
            ))}
        </div>
    );
}

/* ─── Main Component ─── */
function TruckMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [truckId, setTruckId] = useState("");
    const [myTruck, setMyTruck] = useState(null);
    const [foodType, setFoodType] = useState("");
    const [categoryTag, setCategoryTag] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [available, setAvailable] = useState(true);
    const [stockQuantity, setStockQuantity] = useState("");
    const [availableFrom, setAvailableFrom] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null); // itemId to delete, or null

    const { toasts, addToast, removeToast } = useToasts();

    useEffect(() => {
        apiGet("/api/v1/truck/me")
            .then(truck => {
                if (!truck) return;
                setMyTruck(truck);
                setTruckId(String(truck.truckId));
            })
            .catch(() => {});
    }, []);

    function getMenu() {
        setLoading(true);
        setError("");
        apiGet(API_URL)
            .then(data => {
                setMenuItems(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                setError(describeError(err, "Unable to load menu items."));
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const currentTruckId = truckId || (myTruck ? String(myTruck.truckId) : "");
    const truckIds = myTruck ? [myTruck.truckId] : [];
    const truckItems = menuItems;
    const foodTypeItems = truckItems.filter(item => {
        if (foodType === "" || foodType === "ALL") return true;
        return item.foodType === foodType;
    });
    const categories = [
        ...new Set(
            foodTypeItems
                .map(item => item.categoryTag)
                .filter(category => category)
        )
    ];
    const COMMON_CATEGORIES = [
        "Beverages", "Biryani", "Burgers", "Desserts", "North Indian",
        "Pizza", "Rolls", "Snacks", "South Indian", "Street Food",
    ];
    const knownCategories = [
        ...new Set([
            ...menuItems.map(item => item.categoryTag).filter(Boolean),
            ...COMMON_CATEGORIES,
        ]),
    ].sort((a, b) => a.localeCompare(b));

    const displayedItems = foodTypeItems.filter(item => {
        if (categoryTag === "") return true;
        return item.categoryTag === categoryTag;
    });

    function addMenu() {
        setFormError("");
        const missing = [
            [truckId === "", "Truck"],
            [foodType === "", "Food Type"],
            [categoryTag.trim() === "", "Category"],
            [name.trim() === "", "Food Name"],
            [description.trim() === "", "Description"],
            [String(price).trim() === "", "Price"],
        ].filter(([bad]) => bad).map(([, label]) => label);

        if (missing.length > 0) {
            setFormError("Please fill in: " + missing.join(", "));
            return;
        }
        if (Number(price) <= 0 || Number.isNaN(Number(price))) {
            setFormError("Price must be a number greater than 0.");
            return;
        }
        const menu = {
            truckId: Number(truckId),
            name,
            description,
            price: Number(price),
            categoryTag: categoryTag.trim(),
            foodType,
            available,
            stockQuantity: stockQuantity === "" ? null : Number(stockQuantity),
            availableFrom: availableFrom === "" ? null : availableFrom,
        };
        apiPost(API_URL, menu)
            .then(() => {
                addToast("Food item added successfully!", "success");
                clearForm();
                getMenu();
            })
            .catch(() => {
                addToast("Unable to add food item. Please try again.", "error");
            });
    }

    function updateMenu() {
        if (editingId === null) return;
        setFormError("");
        const menu = {
            truckId: Number(truckId),
            name,
            description,
            price: Number(price),
            categoryTag: categoryTag.trim(),
            foodType,
            available,
            stockQuantity: stockQuantity === "" ? null : Number(stockQuantity),
            availableFrom: availableFrom === "" ? null : availableFrom,
        };
        apiPut(`${API_URL}/${editingId}`, menu)
            .then(() => {
                addToast("Food item updated successfully!", "success");
                clearForm();
                getMenu();
            })
            .catch(() => {
                addToast("Unable to update food item. Please try again.", "error");
            });
    }

    function requestDelete(id) {
        setConfirmDelete(id);
    }

    function confirmDeleteItem() {
        const id = confirmDelete;
        setConfirmDelete(null);
        apiDel(`${API_URL}/${id}`)
            .then(() => {
                addToast("Food item deleted successfully.", "success");
                getMenu();
            })
            .catch(() => {
                addToast("Unable to delete food item. Please try again.", "error");
            });
    }

    function editMenu(item) {
        setFormError("");
        setEditingId(item.itemId);
        setTruckId(item.truckId ? String(item.truckId) : (myTruck ? String(myTruck.truckId) : ""));
        setFoodType(item.foodType || "");
        setCategoryTag(item.categoryTag || "");
        setName(item.name || "");
        setDescription(item.description || "");
        setPrice(item.price || "");
        setAvailable(item.available === true);
        setStockQuantity(item.stockQuantity ?? "");
        setAvailableFrom(item.availableFrom ?? "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function clearForm() {
        setEditingId(null);
        setFormError("");
        setTruckId(myTruck ? String(myTruck.truckId) : "");
        setFoodType("");
        setCategoryTag("");
        setName("");
        setDescription("");
        setPrice("");
        setAvailable(true);
        setStockQuantity("");
        setAvailableFrom("");
    }

    useEffect(() => {
        getMenu();
    }, []);

    return (
        <div className="truck-menu-container">
            {/* Toast Notifications */}
            <ToastList toasts={toasts} onRemove={removeToast} />

            {/* Delete Confirmation Dialog */}
            {confirmDelete !== null && (
                <ConfirmDialog
                    message="Are you sure you want to delete this food item? This action cannot be undone."
                    onConfirm={confirmDeleteItem}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {/* API load error */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* ─── ADD / EDIT FORM ─── */}
            <div className="menu-form">
                <h2>
                    {editingId !== null ? "Update Food Item" : "Add Food Item"}
                </h2>

                {/* Inline form validation error */}
                {formError && (
                    <div className="form-error-banner" role="alert">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {formError}
                    </div>
                )}

                <div className="form-group">
                    <label>Truck</label>
                    <select
                        value={truckId}
                        onChange={e => {
                            setTruckId(e.target.value);
                            setFoodType("");
                            setCategoryTag("");
                        }}
                    >
                        <option value="">Select Truck</option>
                        {truckIds.map(id => (
                            <option key={id} value={id}>
                                {myTruck && String(myTruck.truckId) === String(id)
                                    ? myTruck.name
                                    : `Truck ${id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Food Type</label>
                    <select
                        value={foodType}
                        disabled={truckId === ""}
                        onChange={e => {
                            setFoodType(e.target.value);
                            setCategoryTag("");
                        }}
                    >
                        <option value="">Select Food Type</option>
                        <option value="VEG">Veg</option>
                        <option value="NON_VEG">Non-Veg</option>
                        <option value="ALL">All</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Category</label>
                    {}
                    <input
                        type="text"
                        list="category-suggestions"
                        value={categoryTag}
                        disabled={truckId === "" || foodType === ""}
                        placeholder="e.g. Biryani, Beverages, Street Food"
                        onChange={e => setCategoryTag(e.target.value)}
                    />
                    <datalist id="category-suggestions">
                        {knownCategories.map((category, index) => (
                            <option key={index} value={category} />
                        ))}
                    </datalist>
                </div>

                <div className="form-group">
                    <label>Food Name</label>
                    <input
                        type="text"
                        placeholder="Enter food name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        placeholder="Enter food description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Price</label>
                    <input
                        type="number"
                        placeholder="Enter price"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                        type="number"
                        placeholder="Enter stock quantity"
                        value={stockQuantity}
                        onChange={e => setStockQuantity(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Available From</label>
                    <input
                        type="time"
                        value={availableFrom}
                        onChange={e => setAvailableFrom(e.target.value)}
                    />
                </div>

                <div className="available-box">
                    <input
                        type="checkbox"
                        checked={available}
                        onChange={e => setAvailable(e.target.checked)}
                    />
                    <label>Available</label>
                </div>

                <div className="form-buttons">
                    {editingId !== null ? (
                        <>
                            <button className="update-button" onClick={updateMenu}>
                                Update Menu
                            </button>
                            <button className="cancel-button" onClick={clearForm}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button className="add-button" onClick={addMenu}>
                            Add Menu
                        </button>
                    )}
                </div>
            </div>

            {/* ─── FILTER + LIST PANEL ─── */}
            <div className="view-section">
                <h2>Truck Menu</h2>
                <div className="filter-group">
                    <label>Truck</label>
                    <select
                        value={truckId}
                        onChange={e => {
                            setTruckId(e.target.value);
                            setFoodType("");
                            setCategoryTag("");
                        }}
                    >
                        <option value="">Select Truck</option>
                        {truckIds.map(id => (
                            <option key={id} value={id}>
                                {myTruck && String(myTruck.truckId) === String(id)
                                    ? myTruck.name
                                    : `Truck ${id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Food Type</label>
                    <select
                        value={foodType}
                        disabled={truckId === ""}
                        onChange={e => {
                            setFoodType(e.target.value);
                            setCategoryTag("");
                        }}
                    >
                        <option value="">All Food Types</option>
                        <option value="VEG">Veg</option>
                        <option value="NON_VEG">Non-Veg</option>
                        <option value="ALL">All</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Category</label>
                    <select
                        value={categoryTag}
                        disabled={truckId === ""}
                        onChange={e => setCategoryTag(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && (
                <FoodTruckLoader
                    message="Preparing your menu items…"
                    subtext="Loading ingredients, stock & pricing"
                    compact
                />
            )}

            <div className="menu-list">
                {!loading && currentTruckId !== "" && displayedItems.length === 0 && (
                    <div className="no-food">
                        <h3>No food items found</h3>
                        <p>There are no matching food items for this truck and filter.</p>
                    </div>
                )}
                {!loading && currentTruckId === "" && displayedItems.length === 0 && (
                    <div className="no-food">
                        <h3>Select a truck</h3>
                        <p>Select a truck to view its menu.</p>
                    </div>
                )}
                {displayedItems.map(item => (
                    <div className="food-card" key={item.itemId}>
                        <div className="food-details">
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <h4>₹{item.price}</h4>
                            <div className="food-information">
                                <span>Truck {item.truckId || currentTruckId}</span>
                                <span>{item.categoryTag}</span>
                                <span>{item.foodType}</span>
                                <span>{item.available ? "Available" : "Unavailable"}</span>
                                {item.stockQuantity !== null && item.stockQuantity !== undefined && (
                                    <span>Stock: {item.stockQuantity}</span>
                                )}
                            </div>
                        </div>
                        <div className="food-buttons">
                            <button className="edit-button" onClick={() => editMenu(item)}>
                                Edit
                            </button>
                            <button className="delete-button" onClick={() => requestDelete(item.itemId)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TruckMenu;