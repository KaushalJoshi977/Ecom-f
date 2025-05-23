import React, { useState, useEffect } from 'react';
import MessageModal from './MessageModal';
import './App.css';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Fallback for local dev

// MyOrders component for users to view their personal order history.
function MyOrders({ userEmail }) {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!userEmail) {
        setMessage('User email not available to fetch orders. Please log in again.');
        setShowModal(true);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('You must be logged in to view your orders.');
          setShowModal(true);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, { // Updated API URL
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (res.ok) {
          setOrders(data);
        } else {
          setMessage(data.message || 'Failed to fetch your orders.');
          setShowModal(true);
        }
      } catch (error) {
        console.error('Network error fetching orders:', error);
        setMessage('Network error. Could not load your orders.');
        setShowModal(true);
      }
    };

    fetchMyOrders();
  }, [userEmail]);

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="order-history-container">
      <h2 className="order-history-title">My Orders</h2>

      {orders.length === 0 ? (
        <p className="order-list-empty">You have not placed any orders yet.</p>
      ) : (
        <div className="order-grid">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span>Order ID: {order._id.substring(0, 8)}...</span>
                <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="order-details">
                {order.products.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span className="order-item-name">{item.product?.name || 'Product'}</span>
                    <span>x {item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                Total: ${order.totalAmount.toFixed(2)}
              </div>
              <div className={`order-status status-${order.status}`}>
                Status: {order.status}
              </div>
            </div>
          ))}
        </div>
      )}

      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default MyOrders;
