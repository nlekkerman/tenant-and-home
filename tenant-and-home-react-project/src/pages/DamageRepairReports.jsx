import React, { useState, useEffect, useContext } from "react";
import { Container, Card, Button, Row, Col, Alert, Modal, Image } from "react-bootstrap";
import { AuthContext } from "@/context/AuthContext";
import AddDamageRepairReport from "@/components/repairs/AddDamageRepairReport";

const DamageRepairReports = () => {
    const { auth, refreshToken, logout } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (!auth.accessToken) {
            setError("No authentication token found");
        }
    }, [auth]);

    const isTokenExpired = async (token) => {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return true; // Invalid token format

        const payload = JSON.parse(atob(tokenParts[1])); // Decode payload
        const exp = payload.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        return exp < currentTime;
    };

    const fetchReports = async () => {
        let token = auth.accessToken;
      
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

            let response = await fetch("http://127.0.0.1:8000/damage-reports/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Fetched Reports:", data); // Log the API response

                if (data && data.results && Array.isArray(data.results)) {
                    setReports(data.results);
                    console.log("Reports array set:", data.results);
                } else {
                    setError("Unexpected response format. Expected an array of reports in the 'results' key.");
                    console.error("Expected an array in 'results', but got:", data);
                }
            } else if (response.status === 401) {
                // Token is invalid or expired
                console.log("Token expired or invalid, attempting refresh...");
                const newToken = await refreshToken();

                if (!newToken) {
                    setError("Failed to refresh token. Please log in again.");
                    logout(); // Log out the user if token refresh fails
                    return;
                }

                response = await fetch("http://127.0.0.1:8000/damage-reports/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${newToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setReports(data);
                } else {
                    setError("Failed to fetch damage repair reports after token refresh.");
                    logout(); // Log out the user if refresh also fails
                }
            } else {
                throw new Error("Failed to fetch damage repair reports");
            }
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [auth.accessToken]);

    return (
        <Container className="mt-5">
            <h2 className="mb-4 text-center">🛠 Damage Repair Reports</h2>

            <Button variant="primary" onClick={() => setShowForm(true)} className="mb-3">+ Add Report</Button>

            {showForm && (
                <AddDamageRepairReport
                    onClose={() => setShowForm(false)}
                    onReportAdded={(newReport) => setReports([newReport, ...reports])}
                />
            )}

            {loading ? (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : reports.length > 0 ? (
                <Row>
                    {reports.map((report) => (
                        <Col key={report.id} md={6} lg={4} className="mb-4">
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <h5 className="card-title">Repair Request for:</h5>
                                    <p className="text-muted">{report.property_address}</p>
                                    <p><strong>Description:</strong> {report.description}</p>
                                    <p>
                                        <strong>Status:</strong>
                                        <span className={`badge ms-2 ${
                                            report.status === "pending" ? "bg-danger" :
                                            report.status === "in_progress" ? "bg-warning" :
                                            report.status === "resolved" ? "bg-success" : "bg-secondary"
                                        }`}>
                                            {report.status === "in_progress" ? "Fixing" : report.status}
                                        </span>
                                    </p>
                                    <p><strong>Reported At:</strong> {new Date(report.reported_at).toLocaleString()}</p>
                                    <p><strong>Resolved At:</strong> {report.resolved_at ? new Date(report.resolved_at).toLocaleString() : "Not Resolved Yet"}</p>
                                    <p><strong>Reported by:</strong> {report.tenant}</p>

                                    {report.repair_images && report.repair_images.length > 0 ? (
                                        <div>
                                            <h6>🖼 Repair Images:</h6>
                                            <Row>
                                                {report.repair_images.map((image, index) => (
                                                    <Col key={index} xs={4} className="mb-2">
                                                        <Image
                                                            src={image.image}
                                                            alt={`Repair Image ${index + 1}`}
                                                            className="img-fluid rounded"
                                                            onClick={() => setSelectedImage(image.image)}
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    ) : (
                                        <p className="text-muted">No images available.</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <p className="text-center">No damage repair reports found.</p>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <Modal show={true} onHide={() => setSelectedImage(null)} centered>
                    <Modal.Body className="text-center">
                        <Image src={selectedImage} alt="Full Image" fluid />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setSelectedImage(null)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Container>
    );
};

export default DamageRepairReports;
