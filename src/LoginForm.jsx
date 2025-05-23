import React, { useState } from 'react';
import MessageModal from './MessageModal';
import './App.css';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Fallback for local dev

// LoginForm component for user authentication.
function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, { // Updated API URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Login successful!');
        setShowModal(true);
        console.log('Login successful, token:', data.token);
        localStorage.setItem('token', data.token);
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
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

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Login</h2>
      <form onSubmit={loginUser} className="form-fields">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="form-input"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="form-input"
          required
        />
        <button
          type="submit"
          className="form-button login"
        >
          Login
        </button>
      </form>
      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default LoginForm;
