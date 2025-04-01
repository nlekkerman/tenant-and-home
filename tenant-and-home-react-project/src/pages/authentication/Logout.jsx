import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Logout Component
 *
 * This component handles the user logout process. It asks the user for confirmation before logging them out of the application.
 * Upon confirmation, the user's authentication tokens are cleared from localStorage, and they are redirected to the home page.
 * It also provides an option to cancel the logout and return to the previous page.
 *
 * Features:
 * - Asks for user confirmation before logging out.
 * - Provides a button to confirm logout and another to cancel the action.
 * - Clears JWT tokens from localStorage upon logout.
 * - Redirects to the home page after successful logout.
 * - Cancels logout and navigates back to the home page if the user cancels.

 * Key Functions:
 * - `handleLogout`: Clears the authentication tokens and redirects the user to the home page after successful logout.
 * - `handleCancel`: Navigates the user back to the home page if they cancel the logout action.
 *
 * Usage:
 * ```jsx
 * <Logout />
 * ```
 *
 * Example of how the logout process works:
 * - The user is presented with a confirmation dialog for logging out.
 * - Upon confirming, JWT tokens are removed from localStorage, and the user is redirected to the homepage.
 * - If the user cancels, they are redirected to the homepage without logging out.
 *
 * Notes:
 * - `useNavigate` is used to redirect the user to the home page after the logout action is completed or canceled.
 * - `window.location.reload()` is called to reload the page and ensure the state is cleared.
 */

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
