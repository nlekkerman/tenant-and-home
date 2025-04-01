import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const AddDamageRepairReport = ({ onClose, onReportAdded }) => {
  const { auth, refreshToken, logout } = useContext(AuthContext);
  const [description, setDescription] = useState("");
  const [repairImages, setRepairImages] = useState([]);
  const [error, setError] = useState(null);
  const [property, setProperty] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // Check if token is expired before making the request
  let token = auth.accessToken;

  const [propertyId, setPropertyId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!auth.accessToken) {
      setError("No authentication token found");
    }
  }, [auth]);

  const isTokenExpired = async (token) => {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return true; // Invalid token format

    const payload = JSON.parse(atob(tokenParts[1])); // Decode payload
    const exp = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    return exp < currentTime;
  };

  useEffect(() => {
    const fetchUserProperty = async () => {
      try {
        // Check if token is expired before making the request
        let token = auth.accessToken;
        const isExpired = await isTokenExpired(token);
        if (isExpired) {
          token = await refreshToken();
          if (!token) {
            throw new Error("Failed to refresh token. Please log in.");
          }
        }
        const response = await fetch("http://127.0.0.1:8000/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json(); // Read the response body once here
          console.log("Fetched User Data:", data); // Debugging

          // Set the username if available
          setUsername(`${data.first_name} ${data.last_name}`);

          // Handle current address
          if (data.current_address) {
            setAddress(data.current_address); // Set address from current_address
            console.log("Current Address:", data.current_address); // Debugging

            if (data.property_id) {
              setPropertyId(data.property_id); // Set property_id from current address
              setProperty(data.property_id); // Ensure property is set for form
              console.log(
                "Property ID from current_address:",
                data.property_id
              ); // Debugging
            } else {
              setPropertyId(null);
              setProperty(null); // Clear form if no property_id
              console.log("No property_id found in current_address.");
            }
          } else {
            setErrorMessage("No current address associated with the tenant.");
          }

          // Handle address history
          if (data.address_history && data.address_history.length > 0) {
            const currentAddressHistory = data.address_history[0]; // Assuming first address is current
            setAddress(currentAddressHistory.address); // Set address from address_history
            console.log("Address History:", currentAddressHistory); // Debugging

            // Ensure property_id exists in address history
            if (currentAddressHistory.address.propertyId) {
              setPropertyId(currentAddressHistory.address.property_id);
              setProperty(currentAddressHistory.address.propertyId); // Set property from history
              console.log(
                "Property ID from address_history:",
                currentAddressHistory.address.property_id
              ); // Debugging
            }
          } else {
            setErrorMessage("No address history found for the tenant.");
          }
        } else {
          setErrorMessage(
            "Failed to fetch tenant details. Status: " + response.status
          );
        }
      } catch (err) {
        setErrorMessage("Failed to fetch tenant details.");
        console.error(err); // Log error for debugging
      }
    };

    fetchUserProperty();
  }, [token]);

  const handleImageChange = (e) => {
    setRepairImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Authentication required.");
      return;
    }
    if (!property) {
      setErrorMessage("Property is required.");
      return;
    }
    if (!description) {
      setErrorMessage("Description is required.");
      return;
    }
    if (repairImages.length === 0) {
      setErrorMessage("At least one repair image is required.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("property", property);

    // Append images to formData
    Array.from(repairImages).forEach((image) => {
      formData.append("repair_images", image); // Assuming the backend expects 'repair_images' as key
    });

    try {
      // Check if token is expired before making the request
      let token = auth.accessToken;
      const isExpired = await isTokenExpired(token);
      if (isExpired) {
        token = await refreshToken();
        if (!token) {
          throw new Error("Failed to refresh token. Please log in.");
        }
      }
      const response = await fetch("http://127.0.0.1:8000/damage-reports/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      const newReport = await response.json();
      console.log("API Response:", newReport);

      // Wrap the response in an array if it's an object
      const reports = Array.isArray(newReport) ? newReport : [newReport];

      // Now pass the reports to onReportAdded
      onReportAdded(reports);
      onReportAdded(newReport); // Notify parent to refresh the list
      setMessage({
        text: "Repair request sent successfully!",
        type: "success",
      });
      setTimeout(() => {
        setMessage(null);
      }, 1000); // 2000 milliseconds = 2 seconds
      onClose(); // Close the modal or form
    } catch (err) {
      setError(err.message);
      setMessage({
        text: "Yor Repair request in not sent this time, please try again!",
        type: "success",
      });
      setTimeout(() => {
        setMessage(null);
      }, 1000); // 2000 milliseconds = 2 seconds
    }
  };

  return (
    <div className="form-container">
      <h3>Add Damage Repair Report</h3>
      {error && <p className="text-danger">{error}</p>}
      {errorMessage && <p className="text-danger">{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tenant Name</label>
          <input
            type="text"
            className="form-control"
            value={username}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Property Address</label>
          <input
            type="text"
            className="form-control"
            value={address}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Upload Images</label>
          <input
            type="file"
            className="form-control"
            multiple
            onChange={handleImageChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Report
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddDamageRepairReport;
