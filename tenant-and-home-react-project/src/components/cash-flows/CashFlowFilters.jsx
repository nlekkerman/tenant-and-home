import React from "react";
import { Button } from "react-bootstrap";

/**
 * CashFlowFilters Component
 *
 * This component renders a set of buttons that allow users to filter cash flow records 
 * based on different categories (e.g., Rent, Electricity, Garbage, Heating, Internet) 
 * and payment statuses (Paid, Pending). 
 *
 * Props:
 * - onFilter (function): A callback function that gets triggered when a button is clicked. 
 *   It receives two arguments: the filter type (either "category" or "status") and the filter value.
 *   If the "All Payments" button is clicked, it calls onFilter with "all" to show all records.
 *
 * Dependencies:
 * - React (for component structure)
 * - React-Bootstrap (for styling buttons)
 *
 * Usage:
 * <CashFlowFilters onFilter={handleFilter} />
 *
 */

const CashFlowFilters = ({ onFilter }) => {
  return (
    <div className="payments-filters">
      <Button variant="primary" onClick={() => onFilter("category", "rent")}>
        Rent
      </Button>
      <Button variant="danger" onClick={() => onFilter("category", "electricity")}>
        Electricity
      </Button>
      <Button variant="secondary" onClick={() => onFilter("category", "garbage")}>
        Garbage
      </Button>
      <Button variant="success" onClick={() => onFilter("category", "heating")}>
        Heating
      </Button>
      <Button variant="dark" onClick={() => onFilter("category", "internet")}>
        Internet
      </Button>
      <Button variant="success" onClick={() => onFilter("status", "paid")}>
        Paid
      </Button>
      <Button variant="info" onClick={() => onFilter("status", "pending")}>
        Pending
      </Button>
      <Button variant="warning" onClick={() => onFilter("all")}>
        All Payments
      </Button>
    </div>
  );
};

export default CashFlowFilters;
