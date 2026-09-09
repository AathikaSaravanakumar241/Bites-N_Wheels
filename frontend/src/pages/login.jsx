import { useState } from "react";
import { useNavigate } from "react-router-dom";
import truck from "../assets/New_img.png";
import { post, saveToken } from "../api.js";
import { setSession } from "../session.js";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  // api.js redirects here with ?expired=1 when a token is rejected, so the
  // user is told why they are back at the login form.
  const [error, setError]       = useState(
    new URLSearchParams(window.location.search).has("expired")
      ? "Your session expired. Please sign in again."
      : ""
  );
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await post("/api/auth/login", { email, password }, false);

      saveToken(data.token);
      setSession("bnw_role",   data.role);
      setSession("bnw_userId", String(data.userId));
      setSession("bnw_name",   data.name);
      setSession("bnw_email",  data.email);
      setSession("bnw_phone",  data.phone ?? "");

      navigate(data.role === "TRUCK_OWNER" ? "/vendor" : "/user");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-form">
          <h1>Bites-N-Wheels | Login</h1>

          {error && (
            <p style={{ color: "red", marginBottom: "var(--space-3)", fontSize: 14 }}>
              {error}
            </p>
          )}

          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="login-buttons">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Logging in…" : "Login"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/register")}
              >
                Register
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

export default Login;