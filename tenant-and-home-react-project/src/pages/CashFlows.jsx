import React, { useState, useEffect, useContext } from "react";
import { Button, Card, ListGroup, Spinner } from "react-bootstrap";
import { AuthContext } from "@/context/AuthContext";
import { useMessage } from "@/context/MessageContext";

/**
 * CashFlows Component for Managing and Displaying User Cash Flow Data
 *
 * This component is responsible for fetching and managing the user's cash flow data, 
 * handling authentication states, and displaying cash flow information with filtering 
 * and pending payment functionalities.
 *
 * Features:
 * - Fetches all cash flows and pending cash flows.
 * - Filters cash flows by category (e.g., rent, electricity) and status (e.g., paid, pending).
 * - Displays a list of cash flows with payment options.
 * - Automatically refreshes the authentication token if expired.
 * - Manages loading and error states to improve user experience.
 *
 * Key Functions:
 * - `fetchPendingCashFlows`: Fetches cash flows with a "pending" status.
 * - `fetchAllCashFlows`: Fetches all available cash flows.
 * - `fetchCategoryCashFlow`: Fetches cash flows filtered by category.
 * - `fetchStatusCashFlows`: Fetches cash flows filtered by status (paid or pending).
 * - `handleSetPaymentForFlow`: Sets the payment status for a specific cash flow item.
 * - `handleFilterStatus`: Handles the filter action for status (paid/pending).
 * - `handleFilterCategory`: Handles the filter action for categories (e.g., rent, electricity).
 * - `toggleFilters`: Toggles the visibility of the filter options.
 *
 * Dependencies:
 * - React (`useState`, `useEffect`, `useContext`) for state management and side effects.
 * - `AuthContext`: Used to access authentication data, including the access token and token refresh functionality.
 * - `MessageContext`: Used to display global messages to the user, such as errors or success notifications.
 * - `React-Bootstrap`: Provides UI components like buttons, spinners, and cards for displaying cash flows and filters.
 *
 * Usage:
 * ```jsx
 * const { cashFlows, pendingCashFlows, fetchAllCashFlows, fetchFilteredCashFlows, loading, error } = CashFlows();
 * ```
 *
 * Notes:
 * - The component ensures that the authentication token is valid, refreshing it if expired.
 * - Provides loading and error states, displayed via spinners or error messages, to guide the user.
 * - Allows users to filter cash flows by category and status, making it easier to navigate financial data.
 */
const CashFlows = () => {
  const [cashFlows, setCashFlows] = useState([]);
  const [allCashFlows, setAllCashFlows] = useState([]);
  const [pendingCashFlows, setPendingCashFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedFlows, setSelectedFlows] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const { auth, refreshToken } = useContext(AuthContext);
  const { setMessage } = useMessage();

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

  // Fetch ONLY pending cash flows on load
  const fetchPendingCashFlows = async () => {
    setLoading(true);
    setError(null);
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
        "http://127.0.0.1:8000/user-cashflow/filter-by-status/?status=pending",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending cash flows");
      }

      const data = await response.json();
      setPendingCashFlows(data); // Show only pending on load
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all cash flows
  const fetchAllCashFlows = async () => {
    setLoading(true);
    setError(null);

    // Check if token is expired before making the request
    let token = auth.accessToken;
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // Check if token is expired before making the request
      const isExpired = await isTokenExpired(token);
      if (isExpired) {
        token = await refreshToken();
        if (!token) {
          throw new Error("Failed to refresh token. Please log in.");
        }
      }
      const response = await fetch("http://127.0.0.1:8000/user-cashflow/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cash flows");
      }

      const data = await response.json();
      setAllCashFlows(data); // Store all cash flows
      setCashFlows(data); // Display all cash flows
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category-based cash flows
  const fetchCategoryCashFlow = async (category) => {
    // Check if token is expired before making the request
    let token = auth.accessToken;
    const isExpired = await isTokenExpired(token);
    if (isExpired) {
      token = await refreshToken();
      if (!token) {
        throw new Error("Failed to refresh token. Please log in.");
      }
    }

    setLoading(true);
    try {
      const url = `http://127.0.0.1:8000/user-cashflow/filter-by-category/?category=${category}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cash flows");
      }

      const data = await response.json();
      setCashFlows(data); // Update filtered cash flows
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch status-based cash flows (Paid or Pending)
  const fetchStatusCashFlows = async (status) => {
    // Check if token is expired before making the request
    let token = auth.accessToken;
    const isExpired = await isTokenExpired(token);
    if (isExpired) {
      token = await refreshToken();
      if (!token) {
        throw new Error("Failed to refresh token. Please log in.");
      }
    }

    setLoading(true);
    try {
      const url = `http://127.0.0.1:8000/user-cashflow/filter-by-status/?status=${status}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cash flows");
      }

      const data = await response.json();
      setCashFlows(data); // Update filtered cash flows
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter by status button click (Paid or Pending)
  const handleFilterStatus = (status) => {
    setFilterStatus(status); // Update status filter
    fetchStatusCashFlows(status); // Call fetchStatusCashFlows
  };

  // Handle filter by category button click
  const handleFilterCategory = (category) => {
    setFilterCategory(category); // Update category filter
    fetchCategoryCashFlow(category); // Call fetchCategoryCashFlow
  };

  // Fetch pending cash flows on mount
  useEffect(() => {
    fetchPendingCashFlows(); // Only pending on first load
  }, []);

  const handleCheckboxChange = (flowId) => {
    setSelectedFlows((prevSelected) => ({
      ...prevSelected,
      [flowId]: !prevSelected[flowId],
    }));
  };

  // Handle the toggle of the filter visibility and reset cash flows accordingly
  const toggleFilters = () => {
    setShowFilters((prevState) => {
      const newShowFilters = !prevState;
      if (!newShowFilters) {
        setCashFlows(allCashFlows); // Reset to all cash flows when filters are hidden
      }
      return newShowFilters;
    });
  };
  const handleSetPaymentForFlow = async (flowId) => {
    // Check if token is expired before making the request
    setMessage({ text: "Processing Payment...", type: "info" });
    let token = auth.accessToken;
    const isExpired = await isTokenExpired(token);
    if (isExpired) {
      token = await refreshToken();
      if (!token) {
        throw new Error("Failed to refresh token. Please log in.");
      }
    }

    try {
      const flowToPay = pendingCashFlows.find((flow) => flow.id === flowId);

      if (!flowToPay) {
        setError("Cash flow not found.");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/user-cashflow/${flowToPay.id}/mark_to_pay_order/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update cash flow payment status");
      }

      // Optionally update state to reflect changes
      setSelectedFlows((prevSelected) => {
        const newSelectedFlows = { ...prevSelected };
        delete newSelectedFlows[flowId];
        return newSelectedFlows;
      });

      // Remove the paid flow from pendingCashFlows and mark it as paid
      setPendingCashFlows((prevPending) =>
        prevPending.filter((flow) => flow.id !== flowId)
      );

      setCashFlows((prevCashFlows) =>
        prevCashFlows.map((flow) =>
          flow.id === flowId ? { ...flow, status: "paid" } : flow
        )
      );

      setMessage({ text: "Payment was successful!", type: "success" });

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {/* Button to toggle the visibility of the Card */}
      <Button
        className="toggle-filters-btn"
        variant="info"
        onClick={toggleFilters}
      >
        FILTER
      </Button>

      {/* Conditionally render the card and filters only when 'showFilters' is true */}
      {showFilters && (
        <Card className="payments-card">
          <Card.Header className="payments-card-header">
            Explore Your Payments
          </Card.Header>
          <Card.Body>
            {/* Filter Buttons */}
            <div className="payments-filters">
              <Button
                className="filter-btn rent"
                variant="primary"
                onClick={() => handleFilterCategory("rent")}
              >
                Filter by Rent
              </Button>
              <Button
                className="filter-btn electricity"
                variant="danger"
                onClick={() => handleFilterCategory("electricity")}
              >
                Filter by Electricity
              </Button>
              <Button
                className="filter-btn garbage"
                variant="secondary"
                onClick={() => handleFilterCategory("garbage")}
              >
                Filter by Garbage
              </Button>
              <Button
                className="filter-btn heating"
                variant="success"
                onClick={() => handleFilterCategory("heating")}
              >
                Filter by Heating
              </Button>
              <Button
                className="filter-btn internet"
                variant="dark"
                onClick={() => handleFilterCategory("internet")}
              >
                Filter by Internet
              </Button>
              <Button
                className="filter-btn paid"
                variant="success"
                onClick={() => handleFilterStatus("paid")}
              >
                Filter by Paid
              </Button>
              <Button
                className="filter-btn pending"
                variant="info"
                onClick={() => handleFilterStatus("pending")}
              >
                Filter by Pending
              </Button>
              <Button
                className="filter-btn all-payments"
                variant="warning"
                onClick={fetchAllCashFlows}
              >
                (All Payments)
              </Button>
            </div>

            {/* Display Cash Flows */}
            {loading ? (
              <Spinner
                className="payments-spinner"
                animation="border"
                variant="primary"
              />
            ) : error ? (
              <p className="payments-error text-danger">{error}</p>
            ) : (
              <>
                {/* Only show this message when the filters are active and no cash flows are found */}
                {showFilters && cashFlows.length === 0 && (
                  <p className="no-payments-message">
                    No cash flows found with the applied filters.
                  </p>
                )}

                {/* Display the paid cash flow items */}
                {cashFlows.length > 0 && (
                  <ListGroup className="payments-list">
                    {cashFlows.map((flow, index) => (
                      <ListGroup.Item
                        className="payments-list-item"
                        key={index}
                      >
                        <div className="payment-details">
                          <p className="payment-category">
                            <strong>Category:</strong> {flow.category}
                          </p>
                          <p className="payment-status">
                            <strong>Status:</strong> {flow.status}
                          </p>
                          <p className="payment-amount">
                            <strong>Amount:</strong> {flow.amount}
                          </p>
                          <p className="payment-date">
                            <strong>Date:</strong>{" "}
                            {new Date(flow.date).toLocaleDateString()}
                          </p>
                        </div>
                        {/* Display "PAID" label for paid items */}
                        {flow.status === "paid" && (
                          <p className="payment-status-paid text-success fw-bold fs-3">
                            PAID
                          </p>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      )}

      <div className="pending-payments-container">
        {loading ? (
          <Spinner animation="border" variant="primary" />
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="container mt-5">
            {/* Check if there are pending payments */}
            {pendingCashFlows.length > 0 ? (
              <div className="pending-payments d-flex flex-column">
                <h4 className="text-center mb-4">Pending Payments</h4>
                <div className="row d-flex flex-column justify-content-center shadow-sm">
                  {pendingCashFlows.map((flow) => (
                    <div key={flow.id} className="col-md-6 col-lg-4 mb-3 payment-card-style">
                      <div className="payment-card-container">
                        <div className="card-body">
                          <div className="payment-details">
                            <p className="payment-category">
                              <strong>Category:</strong> {flow.category}
                            </p>
                            <p className="payment-status ">
                              <strong className="">Status:</strong> {flow.status}
                            </p>
                            <p className="payment-amount">
                              <strong>Amount:</strong> ${flow.amount}
                            </p>
                            <p className="payment-date">
                              <strong>Date:</strong>{" "}
                              {new Date(flow.date).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="payment-actions mt-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="payment-checkbox">
                                <input
                                  type="checkbox"
                                  id={`payment-checkbox-${flow.id}`}
                                  checked={selectedFlows[flow.id] || false}
                                  onChange={() => handleCheckboxChange(flow.id)}
                                />
                                <label htmlFor={`payment-checkbox-${flow.id}`}>
                                  Pay Now
                                </label>
                              </div>
                              <Button
                                variant="primary"
                                onClick={() => handleSetPaymentForFlow(flow.id)}
                                disabled={!selectedFlows[flow.id]}
                              >
                                Set Payment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Display this message when no pending payments
              <p className="text-center text-muted">
                No pending payments at the moment.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlows;
