import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const RentPaymentComponent = () => {
  const { auth, refreshToken } = useContext(AuthContext);
  const [properties, setProperties] = useState([]); // Store properties
  const [selectedProperty, setSelectedProperty] = useState(null); // Selected property
  const [deadline, setDeadline] = useState(""); // Deadline date
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(false); // Reset loading on hot reload
  }, []);
  
  // Function to get default deadline (1 month from today)
  const getDefaultDeadline = () => {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
  };

  // Set default deadline on mount
  useEffect(() => {
    setDeadline(getDefaultDeadline());
  }, []);

  // Fetch properties for the logged-in owner
  useEffect(() => {
    if (!auth.accessToken) {
      setError("No authentication token found");
      return;
    } 
   
  }, [auth]);
  const isTokenExpired = async (token) => {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return true;

    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  };
  // FETCH PROPERTIES
  useEffect(() => {
    const fetchProperties = async () => {
        setLoading(true);
        let token = auth.accessToken;

        try {
            const isExpired = await isTokenExpired(token);
            if (isExpired) {
              token = await refreshToken();
              if (!token) {
                setError("Failed to refresh token. Please log in.");
                setLoading(false);
                return;
              }
            }
          const response = await fetch("http://127.0.0.1:8000/owner-payments-properties/", {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
    
          if (response.ok) {
            const data = await response.json();
            setProperties(data); // Store fetched properties
          } else {
            throw new Error("Failed to fetch properties");
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
    fetchProperties();
  }, []);
 
  const handleSubmit = async () => {
    if (!selectedProperty || !deadline) {
      setError("Both property and deadline are required.");
      return;
    }
  
    let token = auth.accessToken;
    setLoading(true);
    setError(null);
    setMessage(null);
  
    try {
      const isExpired = await isTokenExpired(token);
      if (isExpired) {
        token = await refreshToken();
        if (!token) {
          setError("Failed to refresh token. Please log in.");
          setLoading(false);
          return;
        }
      }
  
      // Ensure deadline is in the correct format (date only, no time)
      const deadlineDate = new Date(deadline).toISOString().split("T")[0]; 
  
      // Log the formatted deadline to check if it's correct
      console.log("Submitting Rent Payment with deadline:", deadlineDate);
  
      // Send both property ID and deadline in the request body
      const response = await fetch("http://127.0.0.1:8000/rent-payments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({
          property: selectedProperty.id, // Send selected property ID
          deadline: deadlineDate, // Send formatted deadline
        }),
      });
  
      if (response.ok) {
        setMessage("Rent payment created successfully!");
        setDeadline(getDefaultDeadline()); // Reset deadline after submission
        setSelectedProperty(null);
      } else {
        throw new Error("Failed to create rent payment");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Create Rent Payment</h3>

      {/* Select Property Dropdown */}
      <div className="form-group">
        <label htmlFor="propertySelect">Select Property:</label>
        <select
          id="propertySelect"
          className="form-control"
          value={selectedProperty ? selectedProperty.id : ""}
          onChange={(e) => {
            const selected = properties.find(
              (property) => property.id === parseInt(e.target.value)
            );
            setSelectedProperty(selected);
          }}
        >
          <option value="">-- Select a Property --</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.house_number} {property.street}, {property.town}
            </option>
          ))}
        </select>
      </div>

      {/* Display Rent Amount */}
      {selectedProperty && (
        <div className="form-group mt-3">
          <label>Rent Amount:</label>
          <p className="form-control-plaintext font-weight-bold">
            €{selectedProperty.rent_amount}
          </p>
        </div>
      )}

      {/* Deadline Field */}
      <div className="form-group">
  <label htmlFor="deadline">Deadline:</label>
  <p id="deadline" className="form-control">{deadline}</p>
</div>

      {/* Submit Button */}
      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Loading Properties..." : "Create Payment"}
      </button>

      {/* Display Error and Success Messages */}
      {error && <p className="mt-3 text-danger">{error}</p>}
      {message && <p className="mt-3 text-success">{message}</p>}
    </div>
  );
};

export default RentPaymentComponent;
