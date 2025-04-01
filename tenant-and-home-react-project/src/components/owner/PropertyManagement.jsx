import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { AuthContext } from "@/context/AuthContext";
import "@/styles/styles.css";

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [ownerUsername, setOwnerUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const { auth, refreshToken } = useContext(AuthContext);

  useEffect(() => {
    if (!auth.accessToken) {
      setError("No authentication token found");
    }
  }, [auth]);

  const fetchProperties = (page = 1) => {
    let token = auth.accessToken;

    if (!token) {
      setError("No authentication token found");
      return;
    }

    const isExpired = isTokenExpired(token);
    if (isExpired) {
      token = refreshToken();
      if (!token) {
        setError("Failed to refresh token. Please log in.");
        return;
      }
    }

    setLoading(true);
    fetch(`http://127.0.0.1:8000/properties/?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setProperties(data.results);
        setNextPage(data.next);
        setPrevPage(data.previous);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  const isTokenExpired = (token) => {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return true; // Invalid token format

    const payload = JSON.parse(atob(tokenParts[1])); // Decode payload
    const exp = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    return exp < currentTime;
  };

  useEffect(() => {
    fetchProperties();
  }, [auth]);

  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      fetchProperties(newPage);
    }
  };

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

  const closeModal = () => {
    setShowModal(false); // Close modal
  };

  if (loading && !selectedProperty) return <div className="text-center"><Spinner animation="border" /></div>;
  if (error) return <div className="alert alert-danger text-center">Error: {error.message}</div>;

  return (
    <div className="property-container mt-5">
      <h1 className="heading text-center">Properties</h1>

      <div className="property-content">
        <div className="property-list-container">
          {loading ? (
            <div className="loading-spinner-container d-flex justify-content-center">
              <Spinner className="p-2 text-dark" animation="border" variant="primary" />
            </div>
          ) : (
            <Row>
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
          )}

          {/* Pagination Controls */}
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Property Pagination">
              <ul className="pagination pagination-lg">
                <li className={`page-item ${!prevPage ? "disabled" : ""}`}>
                  <Button
                    variant="outline-primary"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!prevPage}
                    className="page-link"
                  >
                    « Previous
                  </Button>
                </li>
                <li className="page-item active">
                  <span className="page-link bg-dark text-white border-0">
                    Page {currentPage}
                  </span>
                </li>
                <li className={`page-item ${!nextPage ? "disabled" : ""}`}>
                  <Button
                    variant="outline-primary"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!nextPage}
                    className="page-link"
                  >
                    Next »
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Property Details Modal */}
      {showModal && selectedProperty && (
        <Modal show={showModal} onHide={closeModal} className="property-modal mt-5">
          <Modal.Header closeButton>
            <Modal.Title>Property Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <img
                  src={selectedProperty.main_image || "/default-image.jpg"}
                  alt="Property Main Image"
                  className="img-fluid rounded"
                />
              </Col>
              <Col md={6}>
                <h5>
                  {selectedProperty.street}, {selectedProperty.town}, {selectedProperty.air_code}
                </h5>
                <p><strong>Owner:</strong> {ownerUsername || "Loading..."}</p>
                <p><strong>Description:</strong> {selectedProperty.description || "No description available"}</p>
                <p><strong>Property Rating:</strong> {selectedProperty.property_rating}</p>
                <p><strong>Room Capacity:</strong> {selectedProperty.room_capacity}</p>
                <p><strong>People Capacity:</strong> {selectedProperty.people_capacity}</p>
                <p><strong>Rent Amount:</strong> ${selectedProperty.rent_amount}</p>
                <p><strong>Deposit Amount:</strong> ${selectedProperty.deposit_amount}</p>
                <p><strong>Property Supervisor:</strong> {selectedProperty.property_supervisor_name || "N/A"}</p>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default PropertyManagement;
