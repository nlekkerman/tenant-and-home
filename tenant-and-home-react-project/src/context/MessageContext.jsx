import { createContext, useContext, useState } from "react";

/**
 * Message Context (MessageContext)
 *
 * This context provides a global messaging system for displaying status messages.
 * It allows components to set and access messages for user notifications.
 *
 * Features:
 * - Uses React's Context API to manage message state globally.
 * - Provides a `setMessage` function to update the message.
 * - Messages can be used for success, error, or informational alerts.
 *
 * State & Hooks:
 * - `message` (state): Holds the current message object `{ text: string, type: string }`.
 * - `useMessage` (custom hook): Simplifies access to `message` and `setMessage` within components.
 *
 * Usage:
 * ```jsx
 * <MessageProvider>
 *   <App />
 * </MessageProvider>
 * ```
 *
 * Example of setting a message:
 * ```jsx
 * const { setMessage } = useMessage();
 * setMessage({ text: "Action successful!", type: "success" });
 * ```
 *
 * Dependencies:
 * - React (`createContext`, `useContext`, `useState`) for managing message state.
 */

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);

  return (
    <MessageContext.Provider value={{ message, setMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

// ✅ Correctly define and export the custom hook
export const useMessage = () => {
  return useContext(MessageContext);
};
