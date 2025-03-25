import React, { useState, useEffect, useContext, useLo } from "react"; 
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

const Navbar = () => {
  const { auth } = useContext(AuthContext);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAccessTokenValid, setIsAccessTokenValid] = useState(true);
  const location = useLocation();
  const token = auth.accessToken;

  // Function to check if access token is expired
  const isTokenExpired = (token) => {
    if (!token) return true; // No token means expired

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp; // Check if expired
    } catch (err) {
      return true; // If token can't be decoded, treat as expired
    }
  };

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      setIsAccessTokenValid(false);
    } else {
      setIsAccessTokenValid(true);
    }
  }, [token]);

  useEffect(() => {
    const fetchUserProperty = async () => {
      if (!token || isTokenExpired(token)) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.owner_username === data.username) {
            setIsOwner(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };

    fetchUserProperty();
  }, [token]);

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

   // 🚀 Function to close menu when clicking a link
   const closeMobileMenu = () => setMobileMenuOpen(false);

   // Automatically close menu when navigating
   useEffect(() => {
     closeMobileMenu();
   }, [location]);
 

  // FIX: Update `isAuthenticated` logic
  const isAuthenticated = auth.isAuthenticated && isAccessTokenValid;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home">Roomie World</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={isMobileMenuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
          onClick={toggleMobileMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
            </li>

            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                {isAccessTokenValid && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/cashflows">Cash Flows</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/damage-repair-reports">Repairs</Link>
                    </li>
                    {isOwner && (
                      <li className="nav-item">
                        <Link className="nav-link bg-dark" to="/owners-dashboard">Owner</Link>
                      </li>
                    )}
                  </>
                )}
                <li className="nav-item">
                  <Link className="nav-link text-white px-4 py-2 rounded" to="/logout">Log Out</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
