import { Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import TruckOwnerDashboard from "./pages/TruckownerDashboard.jsx";
import VendorHome from "./pages/Vendor/VendorHome.jsx";
import UserHome from "./pages/User/UserHome.jsx";
import CategoryPage from "./pages/User/Category.jsx";
import Cart from "./pages/User/Cart.jsx";
import Checkout from "./pages/User/Checkout.jsx";
import OrderPlaced from "./pages/User/OrderPlaced.jsx";
import TrackOrder from "./pages/User/TrackOrder.jsx";
import { CartProvider } from "./pages/User/CartContext.jsx";
import "./App.css";

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* customer flow */}
        <Route path="/user" element={<UserHome />} />
        <Route path="/user/category/:categoryId" element={<CategoryPage />} />
        <Route path="/user/cart" element={<Cart />} />
        <Route path="/user/checkout" element={<Checkout />} />
        <Route path="/user/order/:orderId" element={<OrderPlaced />} />
        <Route path="/user/track/:orderId" element={<TrackOrder />} />

        {/* vendor */}
        <Route path="/vendor" element={<VendorHome />} />
        <Route path="/vendor/dashboard" element={<TruckOwnerDashboard />} />
      </Routes>
    </CartProvider>
  );
}

export default App;