import React, { useState } from 'react';
import { Container, Modal, Button } from 'react-bootstrap';
import UserProfile from '@/components/dashboard-components/UserProfile';
import AddressHistory from '@/components/dashboard-components/AddressHistory';
import TenantRequests from '@/components/dashboard-components/TenantRequests';

/**
 * Dashboard Component for Managing User Profile, Address History, and Tenant Requests
 *
 * This component serves as the main dashboard for a user. It includes the user's profile information, 
 * address history, and tenant requests. Additionally, it handles the display and deletion of tenant requests 
 * via a modal interface.
 *
 * Features:
 * - Displays the user's profile and address history.
 * - Manages tenant requests with the option to delete them through a modal.
 * - Uses a modal to confirm the deletion of a request.
 * - Passes a handler to the `TenantRequests` component to open the modal with the selected request.
 *
 * Key Functions:
 * - `handleShowModal`: A function that opens the modal and sets the selected request to be deleted.
 * - Modal functionality to confirm deletion or cancel the action.
 *
 * Dependencies:
 * - React (`useState`) for state management.
 * - `React-Bootstrap`: Provides UI components like `Container`, `Modal`, `Button`, and others for layout and UI interaction.
 * - `UserProfile`: A component that displays the user's profile information.
 * - `AddressHistory`: A component that shows the user's address history.
 * - `TenantRequests`: A component responsible for displaying the tenant requests and passing data to open the modal.
 *
 * Usage:
 * ```jsx
 * <Dashboard />
 * ```
 *
 * Notes:
 * - The modal is conditionally rendered based on the state of `showModal`.
 * - The modal is used to confirm whether the user wants to delete a tenant request.
 * - When a request is selected, its data is passed into the modal, showing the property address for confirmation.
 * - The modal can be dismissed with the "Cancel" button, or the deletion can be confirmed with the "Confirm Delete" button.
 */

const Dashboard = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Function to handle modal opening
    const handleShowModal = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    return (
        <Container className="my-5 pt-5">
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
