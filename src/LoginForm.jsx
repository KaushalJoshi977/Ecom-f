import React, { useState } from 'react';
import MessageModal from './MessageModal'; // Import the MessageModal
import './App.css'; // Import App.css for styling

// LoginForm component for user authentication.
// It takes an onLoginSuccess function as a prop to notify the parent component of a successful login.
function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // State for modal message
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  // Handles the login form submission.
  const loginUser = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Login successful!');
        setShowModal(true);
        console.log('Login successful, token:', data.token);
        localStorage.setItem('token', data.token); // Store token in local storage
        if (onLoginSuccess) {
          onLoginSuccess(data.user); // Notify parent of successful login
        }
      } else {
        setMessage(data.message || 'Login failed. Please try again.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Network error during login:', error);
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
      <h2 className="form-title">Login</h2>
      <form onSubmit={loginUser} className="form-fields">
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
          className="form-button login"
        >
          Login
        </button>
      </form>

      {/* Message modal */}
      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default LoginForm;
