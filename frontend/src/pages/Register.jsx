import { useState } from "react";
import { useNavigate } from "react-router-dom";
import truck from "../assets/New_img.png";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("CUSTOMER");

  const handleRegister = () => {
    localStorage.setItem("role", role === "TRUCK_OWNER" ? "VENDOR" : "USER");
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* LEFT SIDE - REGISTER FORM */}
        <div className="login-form">
          <h1>Bites-N-Wheels | Register</h1>

          <label>Select Role Type</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg)",
              color: "var(--text)",
              font: "16px var(--sans)",
            }}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="TRUCK_OWNER">Truck Owner</option>
          </select>

          {/* DYNAMIC FIELDS BASED ON ROLE */}
          {role === "CUSTOMER" ? (
            <>
              <label>Full Name</label>
              <input type="text" placeholder="Enter your full name" />

              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" />

              <label>Phone Number</label>
              <input type="text" placeholder="Enter phone number" />

              <label>Password</label>
              <input type="password" placeholder="Enter password" />
            </>
          ) : (
            <>
              <label>Business / Truck Name</label>
              <input type="text" placeholder="Enter business name" />

              <label>Contact Person</label>
              <input type="text" placeholder="Enter contact name" />

              <label>Email Address</label>
              <input type="email" placeholder="Enter email address" />

              <label>Business Address</label>
              <input type="text" placeholder="Enter business address" />

              <label>Password</label>
              <input type="password" placeholder="Enter password" />
            </>
          )}

          <div className="login-buttons">
            <button className="btn" onClick={handleRegister}>
              Register
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - FOOD TRUCK IMAGE */}
        <div className="login-image">
          <img src={truck} alt="Bites N Wheels Food Truck" />
        </div>
      </div>
    </div>
  );
}

export default Register;