import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from "@/context/AuthContext";
import { Button, Form, Alert } from 'react-bootstrap';

const EditProperty = () => {
  const { auth } = useContext(AuthContext);
  const [property, setProperty] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(new FormData());
  const navigate = useNavigate();
  const { id } = useParams();  // Get the ID from URL params

  // Fetch property details for editing
  const fetchPropertyDetails = async () => {
    try {
      let token = auth.accessToken;
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const url = `http://127.0.0.1:8000/properties/${id}/`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch property details");
      }

      const data = await response.json();
      setProperty(data);  // Set the property state with fetched data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.accessToken) {
      fetchPropertyDetails();
    }
  }, [auth.accessToken, id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update the property state
    setProperty((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Append text fields to formData
    formData.append(name, value);  // Use append instead of set
    console.log(`Form updated: ${name} = ${value}`);
    console.log("Current property state:", property);
    console.log("Current formData:", formData);
  };

  // Handle file input changes (for images)
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    // Check if files are selected
    if (files.length > 0) {
      // For each file, append it to the FormData object
      for (let file of files) {
        formData.append(name, file);
      }
    }

    // Log the files being added to formData
    console.log(`Files updated for ${name}:`);
    for (let file of files) {
      console.log(`  - ${file.name}`);
    }
    console.log("Current formData:", formData);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let token = auth.accessToken;
      if (!token) {
        setError("No authentication token found");
        return;
      }

      formData.append('id', id);  // Add the property ID to formData

      // Log the data before submission
      console.log("Submitting form with the following data:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Submit the form data using PATCH request
      const response = await fetch(`http://127.0.0.1:8000/properties/${id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update property");
      }

      // Redirect to owned properties page
      navigate('/owned-properties');
    } catch (err) {
      setError(err.message || "An error occurred while updating the property.");
      console.error("Error during submit:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2>Edit Property</h2>
      <Form onSubmit={handleSubmit}>
        {/* Form fields */}
        <Form.Group controlId="propertyStreet">
          <Form.Label>Street</Form.Label>
          <Form.Control
            type="text"
            name="street"
            value={property.street || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="propertyTown">
          <Form.Label>Town</Form.Label>
          <Form.Control
            type="text"
            name="town"
            value={property.town || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="propertyDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={property.description || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="propertyRentAmount">
          <Form.Label>Rent Amount</Form.Label>
          <Form.Control
            type="number"
            name="rent_amount"
            value={property.rent_amount || ''}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Main Image field */}
        <Form.Group controlId="propertyMainImage">
          <Form.Label>Main Image</Form.Label>
          <Form.Control
            type="file"
            name="main_image"
            onChange={handleFileChange}
          />
        </Form.Group>

        {/* Room Images field */}
        <Form.Group controlId="propertyRoomImages">
          <Form.Label>Room Images</Form.Label>
          <Form.Control
            type="file"
            name="room_image"
            multiple
            onChange={handleFileChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Save Changes
        </Button>
      </Form>
    </div>
  );
};

export default EditProperty;
