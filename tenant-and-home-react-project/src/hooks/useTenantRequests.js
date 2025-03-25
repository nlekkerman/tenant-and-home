import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

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

    // Fetch Tenant Requests
    useEffect(() => {
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
        setShowModal
    };
};

export default useTenantRequests;
