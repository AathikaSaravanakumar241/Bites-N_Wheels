import { Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import UserHome from "./pages/User/UserHome.jsx";
import CategoryPage from "./pages/User/Category.jsx";
import FoodTrucks from "./pages/User/FoodTrucks.jsx";
import Cart from "./pages/User/Cart.jsx";
import Checkout from "./pages/User/Checkout.jsx";
import OrderPlaced from "./pages/User/OrderPlaced.jsx";
import TrackOrder from "./pages/User/TrackOrder.jsx";
import UserOrders from "./pages/User/UserOrders.jsx";
import UserProfile from "./pages/User/UserProfile.jsx";
import VendorHome from "./pages/Vendor/VendorHome.jsx";
import VendorJourney from "./pages/Vendor/VendorJourney.jsx";
import VendorProfile from "./pages/Vendor/VendorProfile.jsx";
import VendorOrdersPage from "./pages/Vendor/VendorOrdersPage.jsx";
import VendorMenuPage from "./pages/Vendor/VendorMenuPage.jsx";
import VendorBillingPage from "./pages/Vendor/VendorBillingPage.jsx";
import { CartProvider } from "./pages/User/CartContext.jsx";
import "./App.css";
function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {}
        <Route path="/user" element={<UserHome />} />
        <Route path="/user/category/:categoryId" element={<CategoryPage />} />
        <Route path="/user/food/:foodName" element={<FoodTrucks />} />
        <Route path="/user/orders" element={<UserOrders />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/cart" element={<Cart />} />
        <Route path="/user/checkout" element={<Checkout />} />
        <Route path="/user/order/:orderId" element={<OrderPlaced />} />
        <Route path="/user/track/:orderId" element={<TrackOrder />} />
        {}
        <Route path="/vendor" element={<VendorHome />} />
        <Route path="/vendor/journey" element={<VendorJourney />} />
        <Route path="/vendor/orders" element={<VendorOrdersPage />} />
        <Route path="/vendor/menu" element={<VendorMenuPage />} />
        <Route path="/vendor/billing" element={<VendorBillingPage />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />
      </Routes>
    </CartProvider>
  );
}
export default App;
