import React, { useState, useEffect, useContext } from "react";
import { Card, Button, Spinner, ListGroup, Badge } from "react-bootstrap";
import { AuthContext } from "@/context/AuthContext"; 

const AddressHistory = () => {
    const { auth, refreshToken } = useContext(AuthContext);
    const [addressHistory, setAddressHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
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

                const response = await fetch("http://127.0.0.1:8000/me/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Failed to fetch user data");
                }

                const data = await response.json();
                setAddressHistory(data.address_history || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [auth.accessToken]);

    // Utility function to check if the token is expired
    const isTokenExpired = async (token) => {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return true; // Invalid token format

        const payload = JSON.parse(atob(tokenParts[1])); // Decode payload
        const exp = payload.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        return exp < currentTime;
    };

    if (loading) {
        return (
            <Card className="mb-4 dashboard-card">
                <Card.Header>Address History</Card.Header>
                <Card.Body className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading address history...</p>
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="mb-4 dashboard-card">
                <Card.Header>Address History</Card.Header>
                <Card.Body>
                    <p className="text-danger">Error: {error}</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="mb-4 dashboard-card">
            <Card.Header>Address History</Card.Header>
            <Card.Body>
                {addressHistory.length > 0 ? (
                    <>
                        <ListGroup className="shadow-sm rounded">
    {addressHistory.slice(0, isExpanded ? addressHistory.length : 3).map((history, index) => (
        <ListGroup.Item key={index} className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-1">
                    <i className="bi bi-geo-alt-fill text-primary"></i> {history.address || "No Address"}
                </h5>
                <Badge bg="secondary" pill>
                    {index + 1}
                </Badge>
            </div>
            <small className="text-muted">
                <strong>Start Date:</strong> {new Date(history.start_date).toLocaleDateString()}
            </small>
            <small className="text-muted">
                <strong>End Date:</strong> {history.end_date ? new Date(history.end_date).toLocaleDateString() : "Present"}
            </small>
        </ListGroup.Item>
    ))}
</ListGroup>
                        {addressHistory.length > 3 && (
                            <Button variant="link" onClick={() => setIsExpanded(!isExpanded)}>
                                {isExpanded ? "Show Less" : "Show More"}
                            </Button>
                        )}
                    </>
                ) : (
                    <p>No address history available.</p>
                )}
            </Card.Body>
        </Card>
    );
};

export default AddressHistory;
