import React, { useState, useEffect, useContext } from "react";
import { Card, Image, Button } from "react-bootstrap";
import { useMessage } from "@/context/MessageContext";
import { AuthContext } from '@/context/AuthContext'; 

const UserProfile = () => {
    const { auth, refreshToken } = useContext(AuthContext);
    const { setMessage } = useMessage();
    
    // State variables to manage loading, error, and user data
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true); // Set loading to true initially
    const [error, setError] = useState(null);

    useEffect(() => {
        // Function to fetch user data
        const fetchUserData = async () => {
            let token = auth.accessToken;
            console.log("TTTTTTTTTTOKEN", token);
        
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

                let response = await fetch("http://127.0.0.1:8000/me/", {
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
                setUserData(data); // Set the user data after fetching

            } catch (err) {
                setError(err.message); // Catch and set errors
            } finally {
                setLoading(false); // Set loading to false after fetching is complete
            }
        };

        fetchUserData();
    }, [auth.accessToken]); // Re-run when access token changes

    // Utility function to check if the token is expired
    const isTokenExpired = async (token) => {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return true; // Invalid token format

        const payload = JSON.parse(atob(tokenParts[1])); // Decode payload
        const exp = payload.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        return exp < currentTime;
    };

    // Conditional rendering based on loading, error, and data state
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!userData) return <div>No user data available.</div>;

    // Destructure the user data from the state
    const { first_name, last_name, email, phone_number, user_rating_in_app, profile_image } = userData;

    return (
        <Card className="mb-4 dashboard-card">
            <Card.Body>
                <Card.Title>User Information</Card.Title>
                <div className="text-center">
                    <Image
                        src={profile_image || "https://via.placeholder.com/150"}
                        alt="Profile"
                        roundedCircle
                        style={{ width: "150px", height: "150px", objectFit: "cover", border: "2px solid #ddd" }}
                    />
                </div>
                <Card.Text><strong>Full Name:</strong> {first_name} {last_name}</Card.Text>
                <Card.Text><strong>Email:</strong> {email}</Card.Text>
                <Card.Text><strong>Phone:</strong> {phone_number || "Not provided"}</Card.Text>
                <Card.Text><strong>User Rating:</strong> {user_rating_in_app || "No rating yet"}</Card.Text>
                <Button variant="primary" href="/edit-profile">Edit Profile</Button>
            </Card.Body>
        </Card>
    );
};

export default UserProfile;
