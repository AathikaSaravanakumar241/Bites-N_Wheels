import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/login.jsx";
import TruckMenu from "./pages/TruckMenu.jsx";
import TruckOrders from "./pages/TruckOrders.jsx";
import TruckBilling from "./pages/TruckBilling.jsx";
import "./App.css";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/truck/menu" element={<TruckMenu />} />
            <Route path="/truck/orders" element={<TruckOrders />} />
            <Route path="/truck/billing" element={<TruckBilling />} />
        </Routes>
    );
}

export default App;