import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Card, Modal, Form, Button, Badge, Alert, Spinner } from "react-bootstrap";import { AuthContext } from "@/context/AuthContext";

const RepairRequests = () => {
    const { auth, refreshToken } = useContext(AuthContext);
  const [repairRequests, setRepairRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
  // Fetch repair requests
  useEffect(() => {
    fetchRepairRequests();
  }, []);

  const fetchRepairRequests = async () => {
    let token = auth?.accessToken;
    
    if (!token) {
      setError("No authentication token found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isExpired = await isTokenExpired(token);
      if (isExpired) {
        token = await refreshToken();
        if (!token) {
          throw new Error("Failed to refresh token. Please log in.");
        }
      }

      const response = await fetch("http://127.0.0.1:8000/damage-reports/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch damage repair reports");
      }

      const data = await response.json();
      setRepairRequests(data.results || []); // Ensure data is an array
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status); // Set default status to the current one
    setShowModal(true);
  };

  const updateRepairStatus = async (requestId, newStatus) => {
    let token = auth?.accessToken;
    
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
        `http://127.0.0.1:8000/damage-reports/${requestId}/update-status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        console.error(`❌ Failed to update status. HTTP Status: ${response.status}`);
        throw new Error("Failed to update status");
      }

      const data = await response.json();
      return data.new_status; // Assuming the API returns the updated status
    } catch (error) {
      console.error("❌ Error updating repair status:", error);
    }
  };
  const getStatusVariant = (status) => {
    switch (status) {
        case "pending":
            return "warning";
        case "in_progress":
            return "primary";
        case "resolved":
            return "success";
        default:
            return "secondary";
    }
};
  // **Handle Status Update**
  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;
    console.log(`🔧 Handling status update for request ID: ${selectedRequest.id}`);

    try {
      const updatedStatus = await updateRepairStatus(selectedRequest.id, newStatus);

      if (updatedStatus) {
        console.log(`✅ Status updated successfully: ${updatedStatus}`);

        // **Update repairRequests state**
        setRepairRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === selectedRequest.id ? { ...request, status: updatedStatus } : request
          )
        );

        // **Update the selected request state**
        setSelectedRequest((prev) => ({ ...prev, status: updatedStatus }));

        setShowModal(false);
      } else {
        console.error("❌ Failed to update status.");
      }
    } catch (error) {
      console.error("❌ Error in handleStatusUpdate:", error);
    }
  };

  return (
    <div className="repair-requests-section mt-4">
        <h4 className="mb-3">Repair Requests</h4>

        {loading ? (
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
            </div>
        ) : error ? (
            <Alert variant="danger">{error}</Alert>
        ) : repairRequests.length > 0 ? (
            <Row>
                {repairRequests.map((request) => (
                    <Col key={request.id} md={6} lg={4} className="mb-3">
                        <Card className="shadow-sm border-0 repair-card card-hover" onClick={() => handleRequestClick(request)} style={{ cursor: "pointer" }}>
                            <Card.Body>
                                <Card.Title className="mb-3">{request.property_address}</Card.Title>
                                <Card.Text>
                                    <strong>Description:</strong> {request.description}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Status: </strong>
                                    <Badge bg={getStatusVariant(request.status)} className="p-2">
                                        {request.status === "in_progress"
                                            ? "In Progress"
                                            : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </Badge>
                                </Card.Text>
                                <Card.Text className="text-muted">
                                    <small>
                                        <strong>Reported At:</strong> {new Date(request.reported_at).toLocaleString()}
                                    </small>
                                </Card.Text>
                                <Card.Text>
                                    <strong>Reported by:</strong> {request.tenant}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        ) : (
            <Alert variant="info" className="text-center">
                No repair requests found.
            </Alert>
        )}

        {/* Status Update Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Update Repair Status</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedRequest && (
                    <>
                        <p>
                            <strong>Property:</strong> {selectedRequest.property_address}
                        </p>
                        <p>
                            <strong>Description:</strong> {selectedRequest.description}
                        </p>
                        <Form.Group>
                            <Form.Label>Status</Form.Label>
                            <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </Form.Select>
                        </Form.Group>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleStatusUpdate}>
    Update Status
</Button>
            </Modal.Footer>
        </Modal>
    </div>
);
};

export default RepairRequests;
