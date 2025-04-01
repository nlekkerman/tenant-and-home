import React from "react";
import { ListGroup, Spinner } from "react-bootstrap";

/**
 * CashFlowList Component
 *
 * This component displays a list of cash flow transactions using Bootstrap's ListGroup. 
 * It provides conditional rendering based on loading, error, and available cash flow data.
 *
 * Props:
 * - cashFlows (array): A list of cash flow objects, each containing:
 *   - category (string): The type of payment (e.g., Rent, Electricity, etc.).
 *   - status (string): Payment status (e.g., Paid, Pending).
 *   - amount (number): The amount of the payment.
 *   - date (string | Date): The date of the transaction.
 * - loading (boolean): If true, displays a loading spinner.
 * - error (string | null): If not null, displays an error message.
 *
 * Behavior:
 * - If `loading` is true, a spinner is displayed.
 * - If `error` is present, an error message is shown.
 * - If `cashFlows` is empty, a message is displayed indicating no cash flows were found.
 * - Otherwise, it renders each transaction as a list item.
 * - Paid transactions are highlighted with a bold "PAID" label in green.
 *
 * Dependencies:
 * - React (for component structure)
 * - React-Bootstrap (for styling and UI elements)
 *
 * Usage:
 * <CashFlowList cashFlows={data} loading={isLoading} error={errorMessage} />
 *
 */

const CashFlowList = ({ cashFlows, loading, error }) => {
  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <ListGroup>
      {cashFlows.length === 0 ? (
        <p className="text-muted">No cash flows found.</p>
      ) : (
        cashFlows.map((flow, index) => (
          <ListGroup.Item key={index} className="payments-list-item">
            <div>
              <p><strong>Category:</strong> {flow.category}</p>
              <p><strong>Status:</strong> {flow.status}</p>
              <p><strong>Amount:</strong> ${flow.amount}</p>
              <p><strong>Date:</strong> {new Date(flow.date).toLocaleDateString()}</p>
            </div>
            {flow.status === "paid" && <p className="text-success fw-bold">PAID</p>}
          </ListGroup.Item>
        ))
      )}
    </ListGroup>
  );
};

export default CashFlowList;
