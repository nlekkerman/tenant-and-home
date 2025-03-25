import React from "react";
import { useNavigate } from "react-router-dom";  // For redirection

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear JWT tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    
    // Redirect to home page after successful logout
    navigate("/home");
    window.location.reload();
  };

  const handleCancel = () => {
    // Redirect back to home page or previous page if user cancels
    navigate("/home");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md text-center">
      <h2 className="text-xl font-bold mb-4">Are you sure you want to log out?</h2>

      <div className="space-x-4">
        <button
          onClick={handleLogout}
          className="bg-success text-white px-4 py-2 rounded-md"
        >
          Yes, Log Out
        </button>

        <button
          onClick={handleCancel}
          className="bg-danger text-white px-4 py-2 rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Logout;
