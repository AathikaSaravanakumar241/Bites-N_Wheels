import { useNavigate } from "react-router-dom";
import truck from "../assets/New_img.png";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Temporary login logic
    // Later connect this with your backend

    const role = "VENDOR";

    localStorage.setItem("role", role);

    navigate(role === "VENDOR" ? "/vendor" : "/user");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* LEFT SIDE - LOGIN FORM */}
        <div className="login-form">

          <h1>Bites-N-Wheels | Login</h1>

          <label>Email / Phone</label>

          <input
            type="text"
            placeholder="Enter your email or phone"
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
          />

          <div className="login-buttons">

            <button
              className="btn"
              onClick={handleLogin}
            >
              Login
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleRegister}
            >
              Register
            </button>

          </div>

        </div>

        {/* RIGHT SIDE - FOOD TRUCK */}
        <div className="login-image">

          <img
            src={truck}
            alt="Bites N Wheels Food Truck"
          />

        </div>

      </div>

    </div>
  );
}

export default Login;