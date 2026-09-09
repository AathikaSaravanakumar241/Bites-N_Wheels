import { useEffect, useState } from "react";
import { get as apiGet, post as apiPost, put as apiPut, del as apiDel, describeError } from "../../api.js";
import "./TruckMenu.css";

const API_URL = "/api/v1/truck/menu-items";

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

    // The truck list used to be derived from existing menu items, which meant a
    // new owner - who has none yet - could never select a truck, and so could
    // never add a first item. The backend resolves the truck from the token
    // anyway; this just needs to know which one it is.
    useEffect(() => {
        apiGet("/api/v1/truck/me")
            .then(truck => {
                if (!truck) return;
                setMyTruck(truck);
                setTruckId(String(truck.truckId));
            })
            .catch(() => {
                /* falls back to the ids discovered from existing menu items */
            });
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

    // An owner has exactly one truck, created at registration.
    const truckIds = myTruck ? [myTruck.truckId] : [];

    // GET /api/v1/truck/menu-items is already scoped to the signed-in owner's
    // truck, and the MenuItem JSON carries no truckId (the `truck` relation is
    // @JsonIgnore'd to keep the lazy proxy out of the response). Filtering on
    // item.truckId therefore compared against undefined and matched nothing,
    // which is why the menu always read "No food items found".
    const truckItems = truckId === "" ? [] : menuItems;

    const foodTypeItems = truckItems.filter(item => {
        if (foodType === "") {
            return true;
        }

        if (foodType === "ALL") {
            return true;
        }

        return item.foodType === foodType;
    });

    const categories = [
        ...new Set(
            foodTypeItems
                .map(item => item.categoryTag)
                .filter(category => category)
        )
    ];

    // Suggestions for the Add form. Deliberately wider than `categories`
    // above (which drives the filter dropdown and follows the current
    // filters): here we want every tag this truck has ever used, plus the
    // common ones, so a brand-new truck still gets useful hints.
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
        if (categoryTag === "") {
            return true;
        }

        return item.categoryTag === categoryTag;
    });

    function addMenu() {
        // Name the missing fields. The old message just said "fill all
        // required fields", which is no help when one of them is off-screen.
        const missing = [
            [truckId === "", "Truck"],
            [foodType === "", "Food Type"],
            [categoryTag.trim() === "", "Category"],
            [name.trim() === "", "Food Name"],
            [description.trim() === "", "Description"],
            [String(price).trim() === "", "Price"],
        ].filter(([bad]) => bad).map(([, label]) => label);

        if (missing.length > 0) {
            alert("Please fill: " + missing.join(", "));
            return;
        }

        if (Number(price) <= 0 || Number.isNaN(Number(price))) {
            alert("Price must be a number greater than 0.");
            return;
        }

        const menu = {
            truckId: Number(truckId),
            name: name,
            description: description,
            price: Number(price),
            categoryTag: categoryTag.trim(),
            foodType: foodType,
            available: available,
            stockQuantity:
                stockQuantity === ""
                    ? null
                    : Number(stockQuantity),
            availableFrom:
                availableFrom === ""
                    ? null
                    : availableFrom
        };

        apiPost(API_URL, menu)
            .then(() => {
                alert("Food item added successfully");
                clearForm();
                getMenu();
            })
            .catch(() => {
                alert("Unable to add food item");
            });
    }

    function updateMenu() {
        if (editingId === null) {
            return;
        }

        const menu = {
            truckId: Number(truckId),
            name: name,
            description: description,
            price: Number(price),
            categoryTag: categoryTag.trim(),
            foodType: foodType,
            available: available,
            stockQuantity:
                stockQuantity === ""
                    ? null
                    : Number(stockQuantity),
            availableFrom:
                availableFrom === ""
                    ? null
                    : availableFrom
        };

        apiPut(`${API_URL}/${editingId}`, menu)
            .then(() => {
                alert("Food item updated successfully");
                clearForm();
                getMenu();
            })
            .catch(() => {
                alert("Unable to update food item");
            });
    }

    function deleteMenu(id) {
        const confirmation = window.confirm(
            "Are you sure you want to delete this food item?"
        );

        if (!confirmation) {
            return;
        }

        apiDel(`${API_URL}/${id}`)
            .then(() => {
                alert("Food item deleted successfully");
                getMenu();
            })
            .catch(() => {
                alert("Unable to delete food item");
            });
    }

    function editMenu(item) {
        setEditingId(item.itemId);
        setTruckId(item.truckId || "");
        setFoodType(item.foodType || "");
        setCategoryTag(item.categoryTag || "");
        setName(item.name || "");
        setDescription(item.description || "");
        setPrice(item.price || "");
        setAvailable(item.available === true);
        setStockQuantity(item.stockQuantity ?? "");
        setAvailableFrom(item.availableFrom ?? "");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function clearForm() {
        setEditingId(null);
        // Keep the truck selected. There is only ever one for this owner, and
        // clearing it hid the menu list behind "Select a truck" after every
        // add - exactly when you want to see what you just added.
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
            <div className="page-header">
                <h1>Menu Management</h1>
                <p>Manage the food items available in your food truck</p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="menu-form">
                <h2>
                    {editingId !== null
                        ? "Update Food Item"
                        : "Add Food Item"}
                </h2>

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

                    {/* Free text, not a select: the category list is built from
                        this truck's existing items, so on a new truck it is
                        empty and there would be nothing to pick - making the
                        first item impossible to add. The datalist still offers
                        whatever has been used before. */}
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
                        onChange={e =>
                            setName(e.target.value)
                        }
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>

                    <textarea
                        placeholder="Enter food description"
                        value={description}
                        onChange={e =>
                            setDescription(e.target.value)
                        }
                    />
                </div>

                <div className="form-group">
                    <label>Price</label>

                    <input
                        type="number"
                        placeholder="Enter price"
                        value={price}
                        onChange={e =>
                            setPrice(e.target.value)
                        }
                    />
                </div>

                <div className="form-group">
                    <label>Stock Quantity</label>

                    <input
                        type="number"
                        placeholder="Enter stock quantity"
                        value={stockQuantity}
                        onChange={e =>
                            setStockQuantity(e.target.value)
                        }
                    />
                </div>

                <div className="form-group">
                    <label>Available From</label>

                    <input
                        type="time"
                        value={availableFrom}
                        onChange={e =>
                            setAvailableFrom(e.target.value)
                        }
                    />
                </div>

                <div className="available-box">
                    <input
                        type="checkbox"
                        checked={available}
                        onChange={e =>
                            setAvailable(e.target.checked)
                        }
                    />

                    <label>Available</label>
                </div>

                <div className="form-buttons">
                    {editingId !== null ? (
                        <>
                            <button
                                className="update-button"
                                onClick={updateMenu}
                            >
                                Update Menu
                            </button>

                            <button
                                className="cancel-button"
                                onClick={clearForm}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className="add-button"
                            onClick={addMenu}
                        >
                            Add Menu
                        </button>
                    )}
                </div>
            </div>

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
                        onChange={e =>
                            setCategoryTag(e.target.value)
                        }
                    >
                        <option value="">All Categories</option>

                        {categories.map((category, index) => (
                            <option
                                key={index}
                                value={category}
                            >
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && (
                <p className="loading">
                    Loading menu...
                </p>
            )}

            <div className="menu-list">
                {!loading &&
                    truckId !== "" &&
                    displayedItems.length === 0 && (
                        <div className="no-food">
                            <h3>No food items found</h3>
                            <p>
                                There are no matching food
                                items for this truck and filter.
                            </p>
                        </div>
                    )}

                {!loading &&
                    truckId === "" && (
                        <div className="no-food">
                            <h3>Select a truck</h3>
                            <p>
                                Select a truck to view its menu.
                            </p>
                        </div>
                    )}

                {displayedItems.map(item => (
                    <div
                        className="food-card"
                        key={item.itemId}
                    >
                        <div className="food-details">
                            <h3>{item.name}</h3>

                            <p>{item.description}</p>

                            <h4>₹{item.price}</h4>

                            <div className="food-information">
                                <span>
                                    Truck {item.truckId}
                                </span>

                                <span>
                                    {item.categoryTag}
                                </span>

                                <span>
                                    {item.foodType}
                                </span>

                                <span>
                                    {item.available
                                        ? "Available"
                                        : "Unavailable"}
                                </span>

                                {item.stockQuantity !== null &&
                                    item.stockQuantity !== undefined && (
                                        <span>
                                            Stock:{" "}
                                            {item.stockQuantity}
                                        </span>
                                    )}
                            </div>
                        </div>

                        <div className="food-buttons">
                            <button
                                className="edit-button"
                                onClick={() =>
                                    editMenu(item)
                                }
                            >
                                Edit
                            </button>

                            <button
                                className="delete-button"
                                onClick={() =>
                                    deleteMenu(item.itemId)
                                }
                            >
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