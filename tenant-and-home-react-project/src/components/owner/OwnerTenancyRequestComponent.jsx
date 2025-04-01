import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { AuthContext } from "@/context/AuthContext";

const OwnerTenancyRequestComponent = () => {
  const [tenancyRequests, setTenancyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth, refreshToken } = useContext(AuthContext);
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
    fetchTenancyRequests();
  }, []);

  const fetchTenancyRequests = async () => {
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
      const response = await fetch("http://127.0.0.1:8000/tenancy-requests/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch tenancy requests");
      const data = await response.json();
      setTenancyRequests(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
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
        `http://127.0.0.1:8000/tenancy-requests/${id}/${action}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      // Update UI: filter out rejected requests or update status
      setTenancyRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === id ? { ...req, status: action } : req
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <p>Loading tenancy requests...</p>;
  if (error) return <p>Error: {error}</p>;

  const pendingRequests = tenancyRequests.filter(request => request.status === "pending");

return (
  <div className="notification-container p-2 p-md-5 mt-5">
    <h2>Pending Tenancy Requests</h2>
    {pendingRequests.length > 0 ? (
      <Row>
        {pendingRequests.map((request) => (
          <Col key={request.id} md={6} lg={4} className="tenancy-request-col mb-3 ">
            <Card className="tenancy-card shadow-sm card-hover">
              <Card.Body className="p-4">
                <h5 className="mb-3">
                  Hi{" "}
                  <strong className="bg-primary text-white px-2 py-1 rounded">
                    {request.owner_username}
                  </strong>
                  , you have a pending request for residency at 
                  <span className="fw-bold text-success"> {request.property_address}</span>.
                </h5>

                <div className="mb-3">
                  <p>
                    <strong>Status:</strong>
                    <span className="badge bg-warning">Pending</span>
                  </p>
                  <p>
                    <strong>Requested At:</strong>{" "}
                    {new Date(request.request_date).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 border rounded bg-light">
                  <h6 className="text-primary">Tenant Information</h6>
                  <p><strong>First Name:</strong> {request.tenant_first_name}</p>
                  <p><strong>Last Name:</strong> {request.tenant_last_name}</p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href={`mailto:${request.tenant_email}`} className="text-decoration-none">
                      {request.tenant_email}
                    </a>
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a href={`tel:${request.tenant_phone}`} className="text-decoration-none">
                      {request.tenant_phone || "N/A"}
                    </a>
                  </p>
                  <p>
                    <strong>Roomie World Rating:</strong>{" "}
                    <span className="fw-bold text-warning">
                      {request.tenant_rating || "Not Rated"}
                    </span>
                  </p>
                </div>

                <div className="mt-3 d-flex justify-content-between">
                  <Button variant="success" onClick={() => handleAction(request.id, "approve")}>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => handleAction(request.id, "reject")}>
                    Reject
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    ) : (
      <p>No pending tenancy requests found.</p>
    )}
  </div>
);

};

export default OwnerTenancyRequestComponent;
