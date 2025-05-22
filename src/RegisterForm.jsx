import React, { useState } from 'react';
import MessageModal from './MessageModal'; // Import the MessageModal
import './App.css'; // Import App.css for styling

// RegisterForm component for new user registration.
// It takes an onRegisterSuccess function as a prop to notify the parent component of a successful registration.
function RegisterForm({ onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // State for modal message
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  // Handles the registration form submission.
  const registerUser = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Registration successful! You can now log in.');
        setShowModal(true);
        setName(''); // Clear form fields
        setEmail('');
        setPassword('');
        if (onRegisterSuccess) {
          onRegisterSuccess(); // Notify parent of successful registration
        }
      } else {
        setMessage(data.message || 'Registration failed. Please try again.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Network error during registration:', error);
      setMessage('Network error. Please check your connection.');
      setShowModal(true);
    }
  };

  // Closes the message modal.
  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Register</h2>
      <form onSubmit={registerUser} className="form-fields">
        {/* Name input field */}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          className="form-input"
          required
        />
        {/* Email input field */}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="form-input"
          required
        />
        {/* Password input field */}
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="form-input"
          required
        />
        {/* Submit button */}
        <button
          type="submit"
          className="form-button register"
        >
          Register
        </button>
      </form>

      {/* Message modal */}
      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default RegisterForm;
