import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Card, Button, Spinner, Modal } from "react-bootstrap";
import useTenantRequests from "@/hooks/useTenantRequests";
import { AuthContext } from "@/context/AuthContext";
import { useMessage } from "@/context/MessageContext";

const TenantRequests = () => {
  const { auth, refreshToken } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false); // For toggling request history
  const { setMessage } = useMessage();
  const {
    tenantRequests,
    loading,
    showModal,
    selectedRequest,
    handleShowModal,
    handleDeleteRequest,
    setShowModal,
    fetchTenantRequests,
  } = useTenantRequests();

  useEffect(() => {
    if (!auth.accessToken) {
      setError("No authentication token found");
    }
  }, [auth]);

  const isTokenExpired = async (token) => {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return true;

    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  };

  const handleCancelConfirmed = async () => {
    if (!selectedRequest) return;

    let token = auth.accessToken;
    if (!token) {
      setError("No authentication token found");
      return;
    }

    try {
      const isExpired = await isTokenExpired(token);
      if (isExpired) {
        token = await refreshToken();
        if (!token) {
          throw new Error("Failed to refresh token. Please log in.");
        }
      }

      const response = await fetch(
        `http://127.0.0.1:8000/tenancy-requests/${selectedRequest.id}/cancel/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to cancel request");

      setMessage({ type: "success", text: "Request successfully canceled!" });
      fetchTenantRequests();
      setShowModal(false);
    } catch (error) {
      setMessage({ type: "error", text: `Error: ${error.message}` });
    }
  };

  // Separate active (pending) requests from the rest (history)
  const activeRequests = tenantRequests.filter(
    (request) => request.status === "pending"
  );
  const requestHistory = tenantRequests.filter(
    (request) => request.status !== "pending"
  );

  return (
    <>
      {/* Pending Requests Container */}
      <Row className="mb-4">
        {loading ? (
          <Col className="text-center">
            <Spinner animation="border" variant="primary" />
            <p>Loading requests...</p>
          </Col>
        ) : activeRequests.length === 0 ? (
          <Col className="text-center">
            <p>No pending requests available.</p>
          </Col>
        ) : (
          activeRequests.map((request) => (
            <Col
              key={request.id}
              md={6}
              lg={4}
              className="tenancy-request-col mb-3"
            >
              <Card className="tenancy-card shadow-sm border rounded">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">
                    You have requested tenancy at{" "}
                    <span className="fw-bold text-success">
                      {request.property_address}
                    </span>
                    .
                  </h5>
                  <p>
                    Your request is currently{" "}
                    <span
                      className={`badge px-3 py-2 ${
                        request.status === "approved"
                          ? "bg-success"
                          : request.status === "rejected"
                          ? "bg-danger"
                          : "bg-warning"
                      }`}
                    >
                      {request.status}
                    </span>
                    . We will notify you once there’s an update.
                  </p>
                  <p className="mb-4">
                    This request was made on{" "}
                    <span className="fw-bold">
                      {new Date(request.request_date).toLocaleString()}
                    </span>
                    .
                  </p>

                  {/* Tenant Details */}
                  <Card className="p-3 border rounded bg-light">
                    <h6 className="text-primary fw-bold">Your Details</h6>
                    <p>
                      <strong>Name:</strong> {request.tenant_first_name}{" "}
                      {request.tenant_last_name}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      <a
                        href={`mailto:${request.tenant_email}`}
                        className="text-decoration-none"
                      >
                        {request.tenant_email}
                      </a>
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      <a
                        href={`tel:${request.tenant_phone}`}
                        className="text-decoration-none"
                      >
                        {request.tenant_phone || "N/A"}
                      </a>
                    </p>
                    <p>
                      <strong>Roomie World Rating:</strong>{" "}
                      <span className="fw-bold text-warning">
                        {request.tenant_rating || "Not Rated"}
                      </span>
                    </p>
                  </Card>

                  {/* Action Buttons */}
                  {request.status === "pending" && (
                    <div className="mt-4 d-flex justify-content-center">
                      <Button
                        variant="danger"
                        onClick={() => handleShowModal(request)}
                      >
                        ❌ Cancel Request
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Request History Container */}
      {showHistory && requestHistory.length > 0 && (
        <Row className="mt-4">
          {requestHistory.map((request) => (
            <Col
              key={request.id}
              md={6}
              lg={4}
              className="tenancy-request-col mb-3"
            >
              <Card className="tenancy-card shadow-sm border rounded">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">
                    You have requested tenancy at{" "}
                    <span className="fw-bold text-success">
                      {request.property_address}
                    </span>
                    .
                  </h5>
                  <p>
                    Your request was{" "}
                    <span
                      className={`badge px-3 py-2 ${
                        request.status === "approved"
                          ? "bg-success"
                          : request.status === "rejected"
                          ? "bg-danger"
                          : "bg-warning"
                      }`}
                    >
                      {request.status}
                    </span>
                    .
                  </p>
                  <p className="mb-4">
                    This request was made on{" "}
                    <span className="fw-bold">
                      {new Date(request.request_date).toLocaleString()}
                    </span>
                    .
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      {/* Show Request History Button */}
      {requestHistory.length > 0 && (
        <Col className="text-center mt-4">
          <Button variant="info" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? "Close Request History" : "Show Request History"}
          </Button>
        </Col>
      )}
      {/* Delete Request Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel your request for{" "}
          <strong>{selectedRequest?.property_address}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            No, Go Back
          </Button>
          <Button variant="warning" onClick={handleCancelConfirmed}>
            Yes, Cancel Request
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TenantRequests;
