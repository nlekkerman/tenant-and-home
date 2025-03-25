import React, { useState } from 'react';
import { Container, Modal, Button } from 'react-bootstrap';
import UserProfile from '@/components/dashboard-components/UserProfile';
import AddressHistory from '@/components/dashboard-components/AddressHistory';
import TenantRequests from '@/components/dashboard-components/TenantRequests';

const Dashboard = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Function to handle modal opening
    const handleShowModal = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    return (
        <Container className="mt-5">
            <UserProfile />
            <AddressHistory />

            {/* Pass handleShowModal to TenantRequests */}
            <TenantRequests handleShowModal={handleShowModal} />

            {/* Modal for deleting a request */}
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
                    <Button variant="danger">
                        Confirm Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Dashboard;
