import React, { useState, useEffect, useContext, } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Spinner, Alert, Card, Button, Row, Col, Modal } from "react-bootstrap";

const OwnedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // State for selected property and modal visibility
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { auth, refreshToken } = useContext(AuthContext);

  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return true; // Invalid token format

    const payload = JSON.parse(atob(tokenParts[1])); // Decode payload
    const exp = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    return exp < currentTime;
  };

  // Function to fetch owned properties
  const fetchProperties = async (page = 1) => {
    try {
      let token = auth.accessToken;

      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Check if token is expired and refresh if necessary
      const isExpired = isTokenExpired(token);
      if (isExpired) {
        token = refreshToken();
        if (!token) {
          throw new Error("Failed to refresh token. Please log in.");
        }
      }

      setLoading(true);
      setError(null);

      // Fetch properties with pagination
      const response = await fetch(
        `http://127.0.0.1:8000/owner-dashboard/?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      console.log("Fetched properties:", data); // Log to verify structure

      if (Array.isArray(data.results)) {
        setProperties(data.results);
        setNextPage(data.next);
        setPrevPage(data.previous);
        setCurrentPage(page);
      } else {
        setError("Unexpected response format: Expected an array.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties when the component mounts or page changes
  useEffect(() => {
    if (auth.accessToken) {
      fetchProperties(currentPage);
    }
  }, [auth.accessToken, currentPage, refreshToken]);

  // Function to fetch the selected property details
  const fetchPropertyDetails = async (propertyId) => {
    try {
      let token = auth.accessToken;

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/properties/${propertyId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch property details");
      }

      const data = await response.json();
      setSelectedProperty(data);
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // Render component
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      fetchProperties(newPage);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };
 
  const handleEdit = (propertyId) => {
    navigate(`/edit-property/${propertyId}`);
  };
  return (
    <div className="container mt-4 shadow-sm mb-4">
      <h2 className="text-center mb-4 pt-3">Your Properties</h2>

      {properties.length > 0 ? (
        <>
          <Row xs={1} sm={2} md={3} lg={4} className="g-2">
            {properties.map((property) => (
              <Col
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={property.id}
                className="mb-4"
              >
                <div
                  className="property-list-item p-3 border rounded shadow-sm bg-light card-hover"
                  onClick={() => fetchPropertyDetails(property.id)}
                >
                  <div className="property-rating">
                    <strong>Rating:</strong> {property.property_rating}
                  </div>
                  <div className="property-card mt-2 ">
                    <div className="property-image-container mb-3">
                      {property.main_image ? (
                        <img
                          src={property.main_image}
                          alt="Property Thumbnail"
                          className="property-image-img img-fluid rounded"
                        />
                      ) : (
                        <div className="property-image-placeholder">
                          Image Unavailable
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="property-room-capacity">
                    <strong>Capacity:</strong> {property.room_capacity}
                  </div>
                  <div className="property-address bg-info p-2">
                    <strong>{property.street}</strong>, {property.town},{" "}
                    {property.county}, {property.country}
                  </div>
                </div>
              </Col>
            ))}
          </Row>

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
        </>
      ) : (
        <div className="text-center">
          <Alert variant="info">You have no properties.</Alert>
        </div>
      )}

      {/* Property Details Modal */}
      {showModal && selectedProperty && (
        <Modal
          show={showModal}
          onHide={closeModal}
          className="property-modal mt-5"
        >
          <Modal.Header closeButton>
            <Modal.Title>Property Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <div className="image-card-container  d-flex justify-content-center">
                  <img
                    src={selectedProperty.main_image || "/default-image.jpg"}
                    alt="Property Main Image"
                    className="img-fluid rounded property-image-img"
                  />
                </div>
                <h5>
                  {selectedProperty.street}, {selectedProperty.town},{" "}
                  {selectedProperty.air_code}
                </h5>
                <p>
                  <strong>Owner:</strong>{" "}
                  {selectedProperty.owner_username || "Loading..."}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedProperty.description || "No description available"}
                </p>
                <p>
                  <strong>Property Rating:</strong>{" "}
                  {selectedProperty.property_rating}
                </p>
                <p>
                  <strong>Room Capacity:</strong>{" "}
                  {selectedProperty.room_capacity}
                </p>
                <p>
                  <strong>People Capacity:</strong>{" "}
                  {selectedProperty.people_capacity}
                </p>
                <p>
                  <strong>Rent Amount:</strong> ${selectedProperty.rent_amount}
                </p>
                <p>
                  <strong>Deposit Amount:</strong> $
                  {selectedProperty.deposit_amount}
                </p>
                <p>
                  <strong>Property Supervisor:</strong>{" "}
                  {selectedProperty.property_supervisor_name || "N/A"}
                </p>

                {selectedProperty.current_tenant &&
                selectedProperty.all_current_tenant.length > 0 ? (
                  <div className="mt-3 p-2 border rounded shadow-sm bg-light">
                    <h5 className="text-primary mb-3">Tenants</h5>
                    <div className="d-flex flex-column">
                      {selectedProperty.all_current_tenant.map(
                        (tenant, index) => (
                          <div
                            key={index}
                            className="tenant-card p-3 border rounded shadow-sm bg-white mb-3"
                            onClick={() => handleTenantClick(tenant)} // Handle click for each tenant
                            style={{ cursor: "pointer" }}
                          >
                            <h6 className="tenant-username text-primary">
                              {tenant.tenant_username || "N/A"}
                            </h6>
                            <p>
                              <strong>Start Date:</strong>{" "}
                              <span className="text-muted">
                                {tenant.start_date || "N/A"}
                              </span>
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-4 border rounded shadow-sm bg-light">
                    <h5 className="text-primary mb-3">No tenants currently</h5>
                  </div>
                )}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => handleEdit(selectedProperty.id)}
            >
              Edit
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default OwnedProperties;
