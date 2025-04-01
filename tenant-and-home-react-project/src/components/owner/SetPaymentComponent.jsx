import React, { useEffect, useState, useContext } from "react";
import { Button, Card, Spinner, Form, Alert } from "react-bootstrap";
import { useMessage } from "@/context/MessageContext";
import { AuthContext } from "@/context/AuthContext";

const SetPaymentComponent = () => {
  const [payments, setPayments] = useState([]);
  const [properties, setProperties] = useState([]);
  const { setMessage } = useMessage(); 
  const [loading, setLoading] = useState(false);
  const { auth, refreshToken } = useContext(AuthContext);

  const [newPayment, setNewPayment] = useState({
    property: "",
    category: "electricity",
    amount: "",
    deadline: "",
    description: "",
  });

  useEffect(() => {
    if (!auth.accessToken) {
      setMessage({ text: "No authentication token found", type: "error" });
    } else {
      fetchUserProperties(); // Fetch properties when component mounts
    }
  }, [auth]);

  // Function to check if the token has expired
  const isTokenExpired = async (token) => {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return true;

    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  };

  // Fetch the user's properties
  const fetchUserProperties = async () => {
    setLoading(true);
    let token = auth.accessToken;

    try {
      const isExpired = await isTokenExpired(token);
      if (isExpired) {
        token = await refreshToken();
        if (!token) {
          setMessage({ text: "Failed to refresh token. Please log in.", type: "error" });
          setLoading(false);
          return;
        }
      }
      const response = await fetch("http://127.0.0.1:8000/owner-payments-properties/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      setProperties(data); 
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load properties", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new payment
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    let token = auth.accessToken;

    setLoading(true);  // Disable button and show loading spinner

    try {
      const isExpired = await isTokenExpired(token);
      if (isExpired) {
        token = await refreshToken();
        if (!token) {
          setMessage({ text: "Failed to refresh token. Please log in.", type: "error" });
          setLoading(false);
          return;
        }
      }

      const formattedPayment = {
        ...newPayment,
        deadline: newPayment.deadline
          ? new Date(newPayment.deadline).toISOString().split("T")[0] // Ensures YYYY-MM-DD format
          : null,
      };

      const response = await fetch("http://127.0.0.1:8000/property-payments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedPayment),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage({ text: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPayment created successfully!", type: "success" });
      } else {
        setMessage({ text: responseData.error || "Failed to create payment", type: "error" });
      }

    } catch (err) {
      console.error("Error creating payment:", err);
      setMessage({ text: "Failed to create payment!", type: "error" });
    } finally {
      setLoading(false);  // Re-enable button
    }
  };

  return (
    <div className="container mt-4 pt-3">
      <h2 className="mb-4">Property Payments</h2>

      {/* Message displayed globally using the context */}
      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

      <Form onSubmit={handleCreatePayment} className="mb-4">
        <h4>Create New Payment</h4>

        {/* Property selection */}
        <Form.Group className="mb-2">
          <Form.Label>Select Property</Form.Label>
          <Form.Select
            value={newPayment.property}
            onChange={(e) => setNewPayment({ ...newPayment, property: e.target.value })}
            required
          >
            <option value="">-- Select a Property --</option>
            {properties.length > 0 ? (
              properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.house_number} {property.street} {property.town} {property.county}
                </option>
              ))
            ) : (
              <option disabled>No properties available</option>
            )}
          </Form.Select>
        </Form.Group>

        {/* Category selection */}
        <Form.Group className="mb-2">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={newPayment.category}
            onChange={(e) => setNewPayment({ ...newPayment, category: e.target.value })}
          >
            <option value="electricity">Electricity</option>
            <option value="garbage">Garbage</option>
            <option value="internet">Internet</option>
            <option value="heating">Heating</option>
          </Form.Select>
        </Form.Group>

        {/* Amount input */}
        <Form.Group className="mb-2">
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="number"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
            required
          />
        </Form.Group>

        {/* Deadline input */}
        <Form.Group className="mb-2">
          <Form.Label>Deadline</Form.Label>
          <Form.Control
            type="date"
            value={newPayment.deadline}
            onChange={(e) => setNewPayment({ ...newPayment, deadline: e.target.value })}
            min={new Date().toISOString().split("T")[0]} // Prevent past dates
          />
        </Form.Group>

        {/* Description input */}
        <Form.Group className="mb-2">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            value={newPayment.description}
            onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          disabled={properties.length === 0}
        >
          {loading ? "Loading Properties..." : "Create Payment"}
        </Button>
      </Form>
    </div>
  );
};

export default SetPaymentComponent;
