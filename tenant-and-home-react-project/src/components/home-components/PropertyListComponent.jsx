import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Spinner,
  Image,
} from "react-bootstrap";
import { useMessage } from "@/context/MessageContext";
import "@/styles/styles.css";
import { AuthContext } from "@/context/AuthContext";

/**
 * PropertyListComponent
 *
 * This component fetches and displays a list of rental properties with pagination.
 * Users can view property details and send tenancy requests.
 *
 * Features:
 * - Fetches property listings from an API (`/properties/`) with pagination.
 * - Displays property details including images, rating, capacity, and location.
 * - Allows users to view full property details in a modal.
 * - Supports pagination for browsing multiple pages of properties.
 * - Enables users to send tenancy requests.
 *
 * State & Hooks:
 * - `properties` (array): Stores the list of fetched properties.
 * - `selectedProperty` (object | null): Stores details of the selected property.
 * - `ownerUsername` (string): Stores the username of the property owner.
 * - `loading` (boolean): Manages loading state while fetching data.
 * - `error` (string | null): Stores error messages if fetching fails.
 * - `showModal` (boolean): Controls the visibility of the property details modal.
 * - `currentPage`, `nextPage`, `prevPage` (pagination state).
 *
 * Behavior:
 * - Fetches property data on mount and updates when navigating pages.
 * - Opens a modal when a property is selected, showing its details.
 * - Sends a tenancy request via API if the user is authenticated.
 *
 * Dependencies:
 * - React (for state management and rendering).
 * - React-Bootstrap (for UI components such as `Card`, `Modal`, `Button`).
 * - MessageContext (for displaying global notifications).
 *
 * Usage:
 * <PropertyListComponent />
 */

const PropertyListComponent = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [ownerUsername, setOwnerUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setMessage } = useMessage();
  const [showModal, setShowModal] = useState(false);
  const { auth, refreshToken } = useContext(AuthContext);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
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
        throw new Error("Failed to refresh token. Please log in.");
      }
    }
    setLoading(true);
    fetch(`http://127.0.0.1:8000/properties/?page=${page}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setProperties(data.results); // Use `results` from paginated response
        setNextPage(data.next); // Store next page URL
        setPrevPage(data.previous); // Store previous page URL
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

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

  const sendTenancyRequest = () => {
    closeModal();
    if (!selectedProperty) {
      console.warn("No property selected");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in to send a tenancy request.");
      console.warn("No access token found in local storage");
      return;
    }

    fetch("http://127.0.0.1:8000/tenancy-requests/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ property_id: selectedProperty.id }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          setMessage({
            text: "Tenancy request sent successfully!",
            type: "success",
          });
        } else {
          alert(
            "Failed to send tenancy request: " +
              (data.error || "Please try again later.")
          );
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("Failed to send tenancy request. Please try again later.");
      });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="mt-5 d-flex flex-column py-3 m-1 p-1">
      <h1 className="heading mt-5 mb-4 text-center">Properties</h1>
      <div className="property-content">
        <div className="property-list-container">
          {loading ? (
            <div className="loading-spinner-container d-flex justify-content-center">
              <Spinner
                className="p-2 text-dark"
                animation="border"
                variant="primary"
              />
            </div>
          ) : (
            <>
              <Row>
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
                      className="property-list-item p-3 card-hover border rounded shadow-sm bg-light"
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
                            <div className="property-image-placeholder">
                              Image Unavailable
                            </div>
                          )}
                        </div>
                      </div>
                      <p></p>{" "}
                      <div className="property-address bg-info p-2">
                        <strong>{property.street}</strong>, {property.town},{" "}
                        {property.county}
                      </div>
                      <div className="property-room-description">
                        {property.description || "No description available"}
                      </div>
                      <div className="property-room-capacity">
                        <strong>Capacity:</strong> {property.room_capacity}
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
          )}
        </div>
      </div>

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
              <Col md={6}>
                <Image
                  src={selectedProperty.main_image || "/default-image.jpg"}
                  alt="Property Main Image"
                  fluid
                  rounded
                />
              </Col>
              <Col md={6}>
                <h5>
                  {selectedProperty.street}, {selectedProperty.town},{" "}
                  {selectedProperty.air_code}
                </h5>
                <p>
                  <strong>Owner:</strong> {ownerUsername || "Loading..."}
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
