import React, { useEffect } from "react";
import { useMessage } from "@/context/MessageContext";
import { Alert } from "react-bootstrap";

const MessageDisplay = () => {
  const { message, setMessage } = useMessage();

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
