import React, { useState } from "react";


export default function TruckOwnerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // T02: Truck Profile State
  const [truckProfile, setTruckProfile] = useState({
    name: "Gourmet Burgers on Wheels",
    tagline: "Fresh Grilled Goodness Everyday",
    status: "ACTIVE", // Options: ACTIVE, BREAKDOWN, CLOSED
  });

  // T03: Menu State
  const [menu, setMenu] = useState([
    { id: 1, name: "Pizza Margherita", price: 150, category: "Pizza", isVeg: true, available: true },
    { id: 2, name: "Chicken Pizza", price: 200, category: "Pizza", isVeg: false, available: false },
    { id: 3, name: "Classic Veg Burger", price: 120, category: "Burger", isVeg: true, available: true },
  ]);

  // T04: Route/Stations State
  const [stations, setStations] = useState([
    { id: 1, name: "Station A (IT Park)", time: "12:00 PM → 12:30 PM", conflict: false },
    { id: 2, name: "Station B (Chef's Plaza)", time: "1:00 PM → 2:00 PM", conflict: true, conflictInfo: "Taco Masters scheduled nearby at 1:30 PM" },
    { id: 3, name: "Station C (Metro Depot)", time: "3:00 PM → 4:00 PM", conflict: false },
  ]);

  // T06: Online Orders State
  const [orders, setOrders] = useState([
    { id: "1024", item: "Pizza Margherita x2", preorder: "6:30 PM", type: "ONLINE", status: "PENDING" },
    { id: "1025", item: "Classic Veg Burger x1", preorder: "Now", type: "ONLINE", status: "PREPARING" },
    { id: "5001", item: "Chicken Pizza x1", preorder: "Completed", type: "OFFLINE", status: "COMPLETED" },
  ]);

  // T07: POS / Offline Order Billing State
  const [posItem, setPosItem] = useState("1");
  const [posQty, setPosQty] = useState(1);
  const [posPayment, setPosPayment] = useState("CASH");

  // Menu Handlers
  const toggleMenuAvailability = (id) => {
    setMenu(menu.map((item) => (item.id === id ? { ...item, available: !item.available } : item)));
  };

  // Order Handlers
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  // Add Offline Order
  const handleSaveOfflineOrder = (e) => {
    e.preventDefault();
    const selectedProduct = menu.find((m) => m.id === parseInt(posItem));
    if (!selectedProduct) return;

    const newOrder = {
      id: `${Math.floor(1000 + Math.random() * 9000)}`,
      item: `${selectedProduct.name} x${posQty}`,
      preorder: "Now",
      type: "OFFLINE",
      status: "COMPLETED",
    };

    setOrders([newOrder, ...orders]);
    alert("Offline Order Created Successfully!");
  };

  return (
    <div className="truck-dashboard-layout">
      {/* SIDEBAR NAVIGATION */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">Bites-N-Wheels</div>
        <nav className="sidebar-nav">
          <button className={activeTab === "dashboard" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button className={activeTab === "menu" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("menu")}>Menu Setup</button>
          <button className={activeTab === "routes" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("routes")}>Stations & Route</button>
          <button className={activeTab === "orders" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("orders")}>Orders & POS</button>
          <button className={activeTab === "analytics" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("analytics")}>Analytics</button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-content">
        {/* TOP BAR */}
        <header className="dashboard-header">
          <h2>T05 — Owner Dashboard</h2>
          <div className="truck-identity">
            <span>{truckProfile.name}</span>
            <span className={`status-pill ${truckProfile.status.toLowerCase()}`}>{truckProfile.status}</span>
          </div>
        </header>

        {/* T02: TRUCK STATUS CONTROLS */}
        <section className="card-panel">
          <h3>T02 — Truck Status Controls</h3>
          <p className="subtext">{truckProfile.tagline}</p>
          <div className="status-selector">
            <button className={truckProfile.status === "ACTIVE" ? "btn" : "btn btn-secondary"} onClick={() => setTruckProfile({ ...truckProfile, status: "ACTIVE" })}>ACTIVE</button>
            <button className={truckProfile.status === "BREAKDOWN" ? "btn btn-danger" : "btn btn-secondary"} onClick={() => setTruckProfile({ ...truckProfile, status: "BREAKDOWN" })}>BREAKDOWN</button>
            <button className={truckProfile.status === "CLOSED" ? "btn btn-secondary" : "btn btn-secondary"} onClick={() => setTruckProfile({ ...truckProfile, status: "CLOSED" })}>CLOSED</button>
          </div>
        </section>

        {/* STATS OVERVIEW */}
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Today's Orders</h4>
            <p className="stat-value">{orders.length}</p>
          </div>
          <div className="stat-card">
            <h4>Online / Offline</h4>
            <p className="stat-value">{orders.filter(o => o.type === "ONLINE").length} / {orders.filter(o => o.type === "OFFLINE").length}</p>
          </div>
          <div className="stat-card">
            <h4>Total Sales</h4>
            <p className="stat-value">₹4,250</p>
          </div>
        </div>

        {/* T04: STATIONS & ROUTE */}
        {(activeTab === "dashboard" || activeTab === "routes") && (
          <section className="card-panel">
            <h3>T04 — Today's Route & Stations</h3>
            <div className="station-list">
              {stations.map((st) => (
                <div key={st.id} className="station-item">
                  <div>
                    <strong>{st.name}</strong> — <span className="text-muted">{st.time}</span>
                  </div>
                  {st.conflict && <div className="warning-box">Conflict Warning: {st.conflictInfo}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* T03: MENU MANAGEMENT */}
        {(activeTab === "dashboard" || activeTab === "menu") && (
          <section className="card-panel">
            <h3>T03 — Daily Menu Management</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {menu.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>₹{item.price}</td>
                    <td>{item.category}</td>
                    <td>{item.isVeg ? "Veg" : "Non-Veg"}</td>
                    <td>
                      <button className={item.available ? "btn-toggle on" : "btn-toggle off"} onClick={() => toggleMenuAvailability(item.id)}>
                        {item.available ? "ON" : "OFF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* T06 & T07: ORDERS AND POS BILLING */}
        {(activeTab === "dashboard" || activeTab === "orders") && (
          <div className="grid-two-col">
            {/* T06: ONLINE ORDERS */}
            <section className="card-panel">
              <h3>T06 — Active Orders</h3>
              <div className="order-list">
                {orders.map((ord) => (
                  <div key={ord.id} className="order-item">
                    <div>
                      <strong>#{ord.id}</strong> | {ord.item} ({ord.type})
                      <div>Status: <span className="badge">{ord.status}</span></div>
                    </div>
                    <div className="order-actions">
                      {ord.status === "PENDING" && <button className="btn" onClick={() => updateOrderStatus(ord.id, "PREPARING")}>Accept</button>}
                      {ord.status === "PREPARING" && <button className="btn" onClick={() => updateOrderStatus(ord.id, "READY")}>Ready</button>}
                      {ord.status === "READY" && <button className="btn" onClick={() => updateOrderStatus(ord.id, "COMPLETED")}>Complete</button>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* T07: POS BILLING */}
            <section className="card-panel">
              <h3>T07 — New Station Sale (POS)</h3>
              <form onSubmit={handleSaveOfflineOrder}>
                <label>Select Menu Item</label>
                <select value={posItem} onChange={(e) => setPosItem(e.target.value)}>
                  {menu.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} - ₹{m.price}</option>
                  ))}
                </select>

                <label>Quantity</label>
                <input type="number" min="1" value={posQty} onChange={(e) => setPosQty(parseInt(e.target.value) || 1)} />

                <label>Payment Method</label>
                <select value={posPayment} onChange={(e) => setPosPayment(e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI / Digital</option>
                </select>

                <button type="submit" className="btn" style={{ marginTop: "var(--space-3)", width: "100%" }}>Save Offline Order</button>
              </form>
            </section>
          </div>
        )}

        {/* T08: ANALYTICS */}
        {(activeTab === "dashboard" || activeTab === "analytics") && (
          <section className="card-panel">
            <h3>T08 — Statistics & Insights</h3>
            <div className="insight-box">
              💡 <strong>Demand Insight:</strong> Station B has the highest evening demand (6:00 PM – 8:00 PM). Consider remaining open 30 minutes longer.
            </div>
          </section>
        )}
      </main>
    </div>
  );
}