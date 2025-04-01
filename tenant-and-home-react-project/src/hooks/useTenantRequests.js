import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

/**
 * Custom Hook for Managing Tenant Requests (useTenantRequests)
 *
 * This custom hook is designed to fetch, manage, and delete tenant requests for a property management system.
 * It interacts with the AuthContext for authentication and token management, ensuring that the access token is valid before making any API calls.
 *
 * Features:
 * - Fetches tenant requests from the backend.
 * - Allows deletion of tenant requests with a confirmation modal.
 * - Manages loading, error, and modal states.
 * - Handles token expiration and refresh automatically before making requests.
 *
 * Key Functions:
 * - `fetchTenantRequests`: Fetches all tenant requests from the API and updates the state.
 * - `handleShowModal`: Opens a modal with the selected request for deletion.
 * - `handleDeleteRequest`: Deletes the selected tenant request and updates the state accordingly.
 *
 * Dependencies:
 * - React (`useState`, `useEffect`, `useContext`) for state management and side effects.
 * - `AuthContext`: Used to access authentication data, including the token.
 *
 * Usage:
 * ```jsx
 * const { tenantRequests, loading, error, showModal, handleShowModal, handleDeleteRequest } = useTenantRequests();
 * ```
 *
 * Example of handling the modal for deleting a request:
 * ```jsx
 * handleShowModal(request);  // To open the modal for the selected request
 * handleDeleteRequest();     // To delete the selected request
 * ```
 *
 * Notes:
 * - The hook ensures that the authentication token is valid and refreshes it if expired.
 * - Provides loading and error states for managing the user interface during asynchronous requests.
 */

const useTenantRequests = () => {
    const { auth } = useContext(AuthContext);
    const [tenantRequests, setTenantRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
// Utility function to check if the token is expired
const isTokenExpired = async (token) => {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return true; // Invalid token format

    const payload = JSON.parse(atob(tokenParts[1])); // Decode payload
    const exp = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    return exp < currentTime;
};
const fetchTenantRequests = async () => {
    let token = auth.accessToken;

    if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
    }

    try {
        // Check if token is expired before making the request
        const isExpired = await isTokenExpired(token);
        if (isExpired) {
            token = await refreshToken();
            if (!token) {
                throw new Error("Failed to refresh token. Please log in.");
            }
        }

        const response = await fetch("http://127.0.0.1:8000/tenant-tenancy-requests/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${auth.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to fetch tenant requests");
        }

        const data = await response.json();
        setTenantRequests(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
    // Fetch Tenant Requests
    useEffect(() => {
        

        fetchTenantRequests();
    }, [auth.accessToken]);

    // Open Delete Modal
    const handleShowModal = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    // Delete Tenant Request
    const handleDeleteRequest = async () => {
        if (!selectedRequest) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/tenant-tenancy-requests/${selectedRequest.id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete request");
            }

            // Update state after deletion
            setTenantRequests((prevRequests) =>
                prevRequests.filter((request) => request.id !== selectedRequest.id)
            );

            setShowModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        tenantRequests,
        loading,
        error,
        showModal,
        selectedRequest,
        handleShowModal,
        handleDeleteRequest,
        setShowModal,
        fetchTenantRequests
    };
};

export default useTenantRequests;
