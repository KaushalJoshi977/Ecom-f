import React, { useState } from 'react';
import MessageModal from './MessageModal';
import './App.css';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Fallback for local dev

// RegisterForm component for new user registration.
function RegisterForm({ onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/register`, { // Updated API URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Registration successful! You can now log in.');
        setShowModal(true);
        setName('');
        setEmail('');
        setPassword('');
        if (onRegisterSuccess) {
          onRegisterSuccess();
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

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Register</h2>
      <form onSubmit={registerUser} className="form-fields">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          className="form-input"
          required
        />
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
          className="form-button register"
        >
          Register
        </button>
      </form>
      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default RegisterForm;
