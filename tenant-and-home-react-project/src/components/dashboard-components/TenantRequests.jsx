import React from "react";
import { Row, Col, Card, Button, Spinner, Modal } from "react-bootstrap";
import useTenantRequests from "@/hooks/useTenantRequests";

const TenantRequests = () => {
    const {
        tenantRequests,
        loading,
        showModal,
        selectedRequest,
        handleShowModal,
        handleDeleteRequest,
        setShowModal
    } = useTenantRequests();

    return (
        <>
            <Row className="mb-4">
                {loading ? (
                    <Col className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p>Loading requests...</p>
                    </Col>
                ) : tenantRequests.length === 0 ? (
                    <Col className="text-center">
                        <p>No pending requests available.</p>
                    </Col>
                ) : (
                    tenantRequests.map((request) => (
                        <Col key={request.id} md={6} lg={4} className="tenancy-request-col mb-3">
                            <Card className="tenancy-card shadow-sm">
                                <Card.Body className="p-4">
                                    <h5 className="mb-3">
                                        Hi <strong className="bg-primary text-white px-2 py-1 rounded">{request.owner_username}</strong>,
                                        you have a request for residency at
                                        <span className="fw-bold text-success"> {request.property_address}</span>.
                                    </h5>
                                    <p><strong>Status:</strong>
                                        <span className={`badge ${request.status === 'approved' ? 'bg-success' : request.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                                            {request.status}
                                        </span>
                                    </p>
                                    <p><strong>Requested At:</strong> {new Date(request.request_date).toLocaleString()}</p>
                                    {request.status === "pending" && (
                                        <div className="mt-3 d-flex justify-content-center">
                                            <Button variant="danger" onClick={() => handleShowModal(request)}>
                                                Delete Request
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            {/* Delete Request Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this request for 
                    <strong> {selectedRequest?.property_address} </strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteRequest}>
                        Confirm Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TenantRequests;
