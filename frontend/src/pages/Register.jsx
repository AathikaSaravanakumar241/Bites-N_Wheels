import { useState } from "react";
import { useNavigate } from "react-router-dom";
import truck from "../assets/New_img.png";
import { post } from "../api.js";

function Register() {
  const navigate = useNavigate();

  const [role, setRole]         = useState("CUSTOMER");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await post(
        "/api/auth/register",
        { name, email, phone, password, role },
        false
      );
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-form">
          <h1>Bites-N-Wheels | Register</h1>

          {error && (
            <p style={{ color: "red", marginBottom: "var(--space-3)", fontSize: 14 }}>
              {error}
            </p>
          )}

          <form onSubmit={handleRegister}>
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

            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <div className="login-buttons">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Registering…" : "Register"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/")}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>

        <div className="login-image">
          <img src={truck} alt="Bites N Wheels Food Truck" />
        </div>

      </div>
    </div>
  );
}

export default Register;