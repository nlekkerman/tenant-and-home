import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useMessage } from "@/context/MessageContext";

/**
 * Custom Hook for Cash Flow Management (useCashFlow)
 *
 * This custom hook is designed to fetch and manage cash flow data in an application.
 * It interacts with the AuthContext for authentication, refreshing tokens if needed, 
 * and uses the MessageContext for global message handling.
 *
 * Features:
 * - Fetches all cash flow data.
 * - Fetches pending cash flows separately.
 * - Allows filtering cash flows based on specified criteria.
 * - Automatically refreshes expired tokens.
 * - Manages loading and error states.
 *
 * Key Functions:
 * - `fetchData`: A reusable function that performs the actual fetch operation and handles token expiration.
 * - `fetchPendingCashFlows`: Fetches cash flows with a "pending" status.
 * - `fetchAllCashFlows`: Fetches all available cash flows.
 * - `fetchFilteredCashFlows`: Fetches filtered cash flows based on a given filter type and value.
 *
 * Dependencies:
 * - React (`useState`, `useEffect`, `useContext`) for state management and side effects.
 * - `AuthContext`: Used to access authentication data, including the token.
 * - `MessageContext`: Used to set global messages if needed.
 *
 * Usage:
 * ```jsx
 * const { cashFlows, pendingCashFlows, fetchAllCashFlows, fetchFilteredCashFlows, loading, error } = useCashFlow();
 * ```
 *
 * Example of using `fetchFilteredCashFlows` with a filter type of `date`:
 * ```jsx
 * fetchFilteredCashFlows("date", "2025-03-27");
 * ```
 *
 * Notes:
 * - The hook ensures that the authentication token is valid and refreshes it if expired.
 * - Provides loading and error states for managing the user interface during asynchronous requests.
 */

const useCashFlow = () => {
  const [cashFlows, setCashFlows] = useState([]);
  const [pendingCashFlows, setPendingCashFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { auth, refreshToken } = useContext(AuthContext);
  const { setMessage } = useMessage();

  const isTokenExpired = async (token) => {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return true;
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  };

  const fetchData = async (url) => {
    setLoading(true);
    setError(null);
    let token = auth.accessToken;
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return [];
    }

    try {
      if (await isTokenExpired(token)) {
        token = await refreshToken();
        if (!token) throw new Error("Failed to refresh token. Please log in.");
      }
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch cash flows");
      return await response.json();
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCashFlows = async () => {
    const data = await fetchData(
      "http://127.0.0.1:8000/user-cashflow/filter-by-status/?status=pending"
    );
    setPendingCashFlows(data);
  };

  const fetchAllCashFlows = async () => {
    const data = await fetchData("http://127.0.0.1:8000/user-cashflow/");
    console.log("DATA", data)
    setCashFlows(data);
  };

  const fetchFilteredCashFlows = async (filterType, value) => {
    const url = `http://127.0.0.1:8000/user-cashflow/filter-by-${filterType}/?${filterType}=${value}`;
    const data = await fetchData(url);
    setCashFlows(data);
  };

  useEffect(() => {
    fetchPendingCashFlows();
  }, []);

  return {
    cashFlows,
    pendingCashFlows,
    loading,
    error,
    fetchAllCashFlows,
    fetchFilteredCashFlows,
  };
};

export default useCashFlow;
