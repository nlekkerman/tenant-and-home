import React, { useEffect } from "react";
import { useMessage } from "@/context/MessageContext";
import { Alert } from "react-bootstrap";

/**
 * MessageDisplay Component
 *
 * This component displays temporary messages (alerts) to users.
 * Messages automatically disappear after a short duration.
 *
 * Features:
 * - Retrieves messages from `MessageContext`.
 * - Automatically clears messages after 3 seconds.
 * - Displays success or error messages using Bootstrap alerts.
 *
 * State & Hooks:
 * - `message` (object | null): The current message to display.
 * - `setMessage` (function): Clears the message after a timeout.
 * - `useEffect`: Handles automatic dismissal of messages.
 *
 * Behavior:
 * - If a message is present, it is displayed as an alert.
 * - The message disappears after 3 seconds.
 * - A cleanup function prevents memory leaks if the component unmounts.
 *
 * Dependencies:
 * - React (for state and lifecycle management).
 * - React-Bootstrap (for `Alert` component).
 * - MessageContext (for managing messages globally).
 *
 * Usage:
 * <MessageDisplay />
 */

const MessageDisplay = () => {
  const { message, setMessage } = useMessage();
  console.log('Current message from context:', message);

  // Effect hook to automatically clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);  // Clear the message after 3 seconds
      }, 3000);  // Adjust the duration as needed

      // Cleanup function to clear the timeout if message changes or component unmounts
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  return message ? (
    <Alert variant={message.type === 'error' ? 'danger' : 'success'}
    className="custom-alert">
      {message.text}
    </Alert>
  ) : null;
};

export default MessageDisplay;
