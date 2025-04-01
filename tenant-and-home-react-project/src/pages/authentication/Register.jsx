import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link here

/**
 * Register Component
 *
 * This component handles the user registration process. It allows users to enter their personal details,
 * create a username and password, and register for the application. If registration is successful,
 * JWT tokens are stored in localStorage, and the user is redirected to the home page.
 *
 * Features:
 * - Allows the user to input personal details (first name, last name, username, email, password).
 * - Confirms that the entered passwords match before submitting the form.
 * - Displays error messages if registration fails.
 * - Stores the JWT tokens (access and refresh) in localStorage upon successful registration.
 * - Redirects the user to the home page after successful registration.
 * - Provides a link to the login page for users who already have an account.

 * Key Functions:
 * - `handleChange`: Updates the state with form input values.
 * - `handleSubmit`: Handles the form submission, validates input, and sends the registration request.
 *
 * Usage:
 * ```jsx
 * <Register />
 * ```
 *
 * Example of how the registration process works:
 * - The user fills out the registration form with personal details.
 * - Upon clicking the register button, the form data is validated.
 * - If successful, JWT tokens are stored in localStorage, and the user is redirected to the home page.
 * - If passwords do not match or registration fails, an error message is displayed.
 *
 * Notes:
 * - `useNavigate` is used to redirect the user to the home page after successful registration or to the login page if they already have an account.
 * - Form data includes first name, last name, username, email, password, and confirm password fields.
 */

const Register = () => {
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",  // New field for first name
    last_name: "",   // New field for last name
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (registerData.password !== registerData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/accounts/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData), // Send the entire registerData, including first and last names
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await response.json();
    
      // Save JWT tokens to localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      navigate("/home");  // Redirect to Home page after successful registration
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
              <h1 className="text-center mb-4">Register</h1>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="first_name" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={registerData.first_name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="last_name" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={registerData.last_name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={registerData.username}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={registerData.email}
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
                    value={registerData.password}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={registerData.confirm_password}
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
                    {loading ? "Registering..." : "Register"}
                  </button>
                  <Link to="/login" className="text-decoration-none">
                    Already have an account? Login here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
