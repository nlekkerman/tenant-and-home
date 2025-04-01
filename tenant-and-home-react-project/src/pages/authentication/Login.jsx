import React, { useState, useContext  } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { AuthContext } from '@/context/AuthContext';

/**
 * Login Component
 *
 * This component provides the login form for users to sign in to the application.
 * It allows users to enter their username and password, then submits the data to the backend API for authentication.
 * Upon successful login, the authentication tokens are stored in the AuthContext, and the user is redirected to the home page.
 *
 * Features:
 * - Form fields for username and password input.
 * - Displays error messages if login fails.
 * - Shows a loading indicator while the login request is being processed.
 * - Redirects to the home page upon successful login.
 * - Provides a link to the "Forgot Password" page and "Register" page for new users.
 *
 * Key Functions:
 * - `handleChange`: Handles changes to form fields and updates the login data state.
 * - `handleSubmit`: Sends the login data to the backend API, processes the response, and updates the AuthContext on success.
 *
 * Usage:
 * ```jsx
 * <Login />
 * ```
 * 
 * Notes:
 * - The `login` function is provided by the `AuthContext` to store the authentication tokens and user data.
 * - Redirects are handled using `useNavigate` from React Router, which redirects users to the homepage after successful login.
 * - If an error occurs (e.g., invalid credentials), an error message is displayed on the screen.
 *
 * Example of how the login process works:
 * - The user enters their username and password and clicks "Login".
 * - If the login is successful, the user is redirected to the home page.
 * - If the login fails, an error message is shown.
 */

const Login = () => {
  const { login } = useContext(AuthContext);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      login(data);  // Use context to store tokens and update the state

      navigate("/home");  // Redirect to Home
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vw-100 d-flex justify-content-center align-items-center">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="text-center mb-4">Login</h1>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={loginData.username}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="mb-3 d-flex flex-column align-items-center">
  <button
    type="submit"
    className="btn btn-primary w-100 mb-2"
    disabled={loading}
  >
    {loading ? "Logging in..." : "Login"}
  </button>
  <Link to="/forgot-password" className="text-decoration-none">
    Forgot Password?
  </Link>
</div>

              </form>

              <p className="text-center mt-3">
                Don't have an account? <Link to="/register" className="text-decoration-none">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
