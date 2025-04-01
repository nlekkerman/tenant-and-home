import React, { useState, useEffect } from "react";
import { FaHome, FaRegMoneyBillAlt, FaWrench, FaClipboardList, FaHandshake, FaTimes } from 'react-icons/fa';
import OwnedProperties from "@/components/owner/OwnedProperties";
import RentPaymentComponent from "@/components/owner/RentPaymentComponent";
import SetPaymentComponent from "@/components/owner/SetPaymentComponent";
import TenancyRequestComponent from "@/components/owner/OwnerTenancyRequestComponent";
import RepairRequests from "@/components/owner/RepairRequests";

const OwnersDashboard = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to handle the card click and set the active component
  const handleCardClick = (component) => {
    setLoading(true);  // Start loading when a component is clicked
    setActiveComponent(component);
  };

  // Function to handle closing of the active component and show card buttons again
  const handleClose = () => {
    setActiveComponent(null);
  };

  // Simulate loading the component after it mounts (for demonstration purposes)
  useEffect(() => {
    if (activeComponent !== null) {
      // Simulating a delay for loading (e.g., data fetching)
      const timer = setTimeout(() => {
        setLoading(false);  // Set loading to false after the component is loaded
      }, 500);  // Adjust delay as needed

      return () => clearTimeout(timer);  // Cleanup the timer on component unmount
    }
  }, [activeComponent]);

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4 pt-3">Owner's Dashboard</h1>

      {/* Conditionally render card buttons */}
      {activeComponent === null && (
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-4">
          <div className="col d-flex justify-content-center">
            <div className="card p-4 text-center card-equal-size" onClick={() => handleCardClick('ownedProperties')}>
              <FaHome size={50} />
              <h3>Owned Properties</h3>
            </div>
          </div>
          <div className="col d-flex justify-content-center">
            <div className="card p-4 text-center card-equal-size" onClick={() => handleCardClick('repairRequests')}>
              <FaWrench size={50} />
              <h3>Repair Requests</h3>
            </div>
          </div>
          <div className="col d-flex justify-content-center">
            <div className="card p-4 text-center card-equal-size" onClick={() => handleCardClick('tenancyRequests')}>
              <FaClipboardList size={50} />
              <h3>Tenancy Requests</h3>
            </div>
          </div>
          <div className="col d-flex justify-content-center">
            <div className="card p-4 text-center card-equal-size" onClick={() => handleCardClick('setPayment')}>
              <FaRegMoneyBillAlt size={50} />
              <h3>Set Payment</h3>
            </div>
          </div>
          <div className="col d-flex justify-content-center">
            <div className="card p-4 text-center card-equal-size" onClick={() => handleCardClick('rentPayment')}>
              <FaHandshake size={50} />
              <h3>Rent Payment</h3>
            </div>
          </div>
        </div>
      )}

      {/* Conditionally render the active component with a close button */}
      {activeComponent !== null && (
        <div className="mt-4">
          {/* Active Component */}
          <div className="card p-2">
            {/* Only show the close button when the component is loaded */}
            {!loading && (
              <button 
                onClick={handleClose} 
                className="btn btn-danger mb-4 d-block mx-auto close-button"
              >
                <FaTimes /> Exit
              </button>
            )}

            {/* Active Component */}
            {activeComponent === 'ownedProperties' && <OwnedProperties />}
            {activeComponent === 'repairRequests' && <RepairRequests />}
            {activeComponent === 'tenancyRequests' && <TenancyRequestComponent />}
            {activeComponent === 'setPayment' && <SetPaymentComponent />}
            {activeComponent === 'rentPayment' && <RentPaymentComponent />}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnersDashboard;
