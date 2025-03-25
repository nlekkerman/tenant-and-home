import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Spinner, Image } from 'react-bootstrap';
import { useMessage } from "@/context/MessageContext";
import "@/styles/styles.css"

const PropertyListComponent = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [ownerUsername, setOwnerUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setMessage } = useMessage(); 
  const [showModal, setShowModal] = useState(false);
  const [hasMore, setHasMore] = useState(true); // To track if more data is available
  const [page, setPage] = useState(1);

  useEffect(() => {
    
    fetch('http://127.0.0.1:8000/properties/')
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setProperties(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const handleSelectProperty = (propertyId) => {
    setSelectedProperty(null);
    setLoading(true);

    fetch(`http://127.0.0.1:8000/properties/${propertyId}/`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedProperty(data);
        setLoading(false);
        setShowModal(true);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedProperty && selectedProperty.owner_username) {
      setOwnerUsername(selectedProperty.owner_username);
    }
  }, [selectedProperty]);

  const sendTenancyRequest = () => {
    closeModal();
    if (!selectedProperty) {
      console.warn("No property selected");
      return;
    }
  
    // Get the token from local storage
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('You must be logged in to send a tenancy request.');
      console.warn("No access token found in local storage");
      return;
    }
  
    // Log the selected property and token to confirm
    console.log("Sending tenancy request for property:", selectedProperty);
    console.log("Using token:", token);
  
    fetch('http://127.0.0.1:8000/tenancy-requests/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ property_id: selectedProperty.id }),
    })
      .then(async (response) => {
        console.log("Raw response:", response); // Log the raw response
  
        // Parse the response JSON
        const data = await response.json();
        console.log("Parsed response data:", data); // Log the parsed response
  
        // Check for successful request
        if (response.ok) {
          setMessage({ text: "Tenancy request sent successfully!", type: "success" });
        } else {
          // Log error response
          alert('Failed to send tenancy request: ' + (data.error || 'Please try again later.'));
          console.error("Error sending tenancy request:", data.error || 'Unknown error');
        }
      })
      .catch((error) => {
        // Log fetch error
        console.error("Fetch error:", error);
        alert('Failed to send tenancy request. Please try again later.');
      });
  };
  

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="mt-5 d-flex flex-column py-3 m-1 p-1">
      <h1 className="heading mb-4 text-center">Properties</h1>
      <div className="property-content">
        <div className="property-list-container">
          <Row>
            {/* Loop through properties and display them responsively */}
            {properties.map((property) => (
              <Col xs={12} sm={6} md={4} lg={3} key={property.id} className="mb-4">
                <div
                  className="property-list-item p-3 border rounded shadow-sm bg-light"
                  onClick={() => handleSelectProperty(property.id)}
                >
                  <div className="property-rating">
                    <strong>Rating:</strong> {property.property_rating}
                  </div>
                  <div className="property-card mt-2">
                    <div className="property-image-container mb-3">
                      {property.main_image ? (
                        <img
                          src={property.main_image}
                          alt="Property Thumbnail"
                          className="property-image-img img-fluid rounded"
                        />
                      ) : (
                        <div className="property-image-placeholder">Image Unavailable</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="property-room-capacity">
                    <strong>Capacity:</strong> {property.room_capacity}

                  </div>
                  <div className="property-address bg-info p-2">
                    <strong>{property.street}</strong>, {property.town}, {property.county}, {property.country}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {showModal && selectedProperty && (
        <Modal show={showModal} onHide={closeModal} className="property-modal mt-5">
          <Modal.Header closeButton>
            <Modal.Title>Property Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Image
                  src={selectedProperty.main_image || '/default-image.jpg'}
                  alt="Property Main Image"
                  fluid
                  rounded
                />
              </Col>
              <Col md={6}>
                <h5>{selectedProperty.street}, {selectedProperty.town}, {selectedProperty.air_code}</h5>
                <p><strong>Owner:</strong> {ownerUsername || 'Loading...'}</p>
                <p><strong>Description:</strong> {selectedProperty.description || 'No description available'}</p>
                <p><strong>Property Rating:</strong> {selectedProperty.property_rating}</p>
                <p><strong>Room Capacity:</strong> {selectedProperty.room_capacity}</p>
                <p><strong>People Capacity:</strong> {selectedProperty.people_capacity}</p>
                <p><strong>Rent Amount:</strong> ${selectedProperty.rent_amount}</p>
                <p><strong>Deposit Amount:</strong> ${selectedProperty.deposit_amount}</p>
                <p><strong>Property Supervisor:</strong> {selectedProperty.property_supervisor_name || 'N/A'}</p>
                <div className="d-flex justify-content-center align-items-center mt-3">
                  <Button variant="primary" onClick={sendTenancyRequest}>
                    Request Tenancy
                  </Button>
                </div>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default PropertyListComponent;
