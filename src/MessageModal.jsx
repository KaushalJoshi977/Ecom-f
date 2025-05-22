import React from 'react';
import './App.css'; // Import App.css for styling

// MessageModal component for displaying messages to the user.
// It takes a message string and an onClose function as props.
const MessageModal = ({ message, onClose }) => {
  // If there's no message, the modal should not be visible.
  if (!message) return null;

  return (
    // Overlay for the modal, covers the entire screen and darkens the background.
    <div className="modal-overlay">
      {/* Modal content container */}
      <div className="modal-content">
        {/* Message text */}
        <p className="modal-message">{message}</p>
        {/* Close button */}
        <button
          onClick={onClose}
          className="modal-close-button"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MessageModal;
