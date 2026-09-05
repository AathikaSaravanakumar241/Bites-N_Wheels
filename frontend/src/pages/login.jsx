import truck from "../assets/food-truck.jpeg";

function Login() {
  return (
    <div className="login-page">

      <div className="login-container">

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

            <button className="btn">
              Login
            </button>

            <button className="btn btn-secondary">
              Register
            </button>

          </div>

          <button className="otp-button">
            Send OTP
          </button>

        </div>

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