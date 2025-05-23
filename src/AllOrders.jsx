import React, { useState, useEffect } from 'react';
import MessageModal from './MessageModal';
import './App.css';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Fallback for local dev

// AllOrders component for administrators to view and manage all orders.
function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in as an admin to view all orders.');
        setShowModal(true);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/orders`, { // Updated API URL
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        setOrders(data);
      } else {
        setMessage(data.message || 'Failed to fetch all orders.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Network error fetching all orders:', error);
      setMessage('Network error. Could not load all orders.');
      setShowModal(true);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in as an admin to update order status.');
        setShowModal(true);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, { // Updated API URL
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Order ${orderId.substring(0, 8)}... status updated to ${newStatus}.`);
        setShowModal(true);
        fetchAllOrders();
      } else {
        setMessage(data.message || 'Failed to update order status.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Network error updating order status:', error);
      setMessage('Network error. Could not update order status.');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="order-history-container">
      <h2 className="order-history-title">All Orders</h2>

      {orders.length === 0 ? (
        <p className="order-list-empty">No orders found.</p>
      ) : (
        <div className="order-grid">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span>Order ID: {order._id.substring(0, 8)}...</span>
                <span>User: {order.user?.name || order.user?.email || 'N/A'}</span>
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
              <div className="order-actions">
                <label htmlFor={`status-${order._id}`} className="sr-only">Change status for order {order._id}</label>
                <select
                  id={`status-${order._id}`}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className={`order-status status-${order.status}`}>
                Current Status: {order.status}
              </div>
            </div>
          ))}
        </div>
      )}

      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default AllOrders;
