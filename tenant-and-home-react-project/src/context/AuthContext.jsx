import React, { createContext, useState, useEffect } from "react";

// Create Context
export const AuthContext = createContext();

// AuthProvider component will wrap the app
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
    isAuthenticated: !!localStorage.getItem("access_token"),
  });

  // Update authentication status if access token is null
  useEffect(() => {
    if (!auth.accessToken) {
      setAuth((prev) => ({ ...prev, isAuthenticated: false }));
    }
  }, [auth.accessToken]);

  // Login function to save tokens in localStorage
  const login = (tokens) => {
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    setAuth({
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
      isAuthenticated: true,
    });
  };

  // Logout function to clear tokens from localStorage
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAuth({ accessToken: null, refreshToken: null, isAuthenticated: false });
  };

  // Refresh token function to get a new access token
  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      logout(); // No refresh token found, force logout
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/accounts/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const refreshData = await response.json();
        
        // Update tokens in localStorage
        localStorage.setItem("access_token", refreshData.access);
        localStorage.setItem("refresh_token", refreshData.refresh);

        // Update auth state
        setAuth({
          accessToken: refreshData.access,
          refreshToken: refreshData.refresh,
          isAuthenticated: true,
        });

        return refreshData.access; // Return new access token if needed
      } else {
        logout();
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
