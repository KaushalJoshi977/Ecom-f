import React, { useState } from 'react';
import MessageModal from './MessageModal';
import './App.css'; // Import App.css for styling

// CheckoutPage component displays the order summary and allows the user to confirm the order.
function CheckoutPage({ orderDetails, onOrderConfirmed, onCancelCheckout }) {
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Handles the confirmation of the order.
  const handleConfirmOrder = async () => {
    // Ensure orderDetails and userEmail are available
    if (!orderDetails || !orderDetails.userEmail || !orderDetails.products || orderDetails.products.length === 0) {
      setMessage('Invalid order details. Please go back and try again.');
      setShowModal(true);
      return;
    }

    const token = localStorage.getItem('token'); // Get token from local storage
    const userEmail = orderDetails.userEmail; // Get user email from order details

    // --- Debugging Logs ---
    console.log('Attempting to confirm order...');
    console.log('Token from localStorage:', token);
    console.log('User Email for order:', userEmail);
    console.log('Order Products:', orderDetails.products);
    // --- End Debugging Logs ---

    if (!token) {
      setMessage('You are not authorized. Please log in again.');
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include token for authentication
        },
        body: JSON.stringify({
          userEmail: userEmail,
          products: orderDetails.products
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Order placed successfully!');
        setShowModal(true);
        // Notify parent (App.jsx) that the order was confirmed
        if (onOrderConfirmed) {
          onOrderConfirmed();
        }
      } else {
        setMessage(data.message || 'Failed to place order. Please try again.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Network error confirming order:', error);
      setMessage('Network error. Could not confirm order.');
      setShowModal(true);
    }
  };

  // Closes the message modal.
  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Order Summary</h2>

      {orderDetails && orderDetails.products && orderDetails.products.length > 0 ? (
        <>
          <div className="checkout-items">
            {orderDetails.products.map((item, index) => (
              <div key={index} className="checkout-item-card">
                <span className="checkout-item-name">{item.productName}</span>
                <span className="checkout-item-quantity">x {item.quantity}</span>
                <span className="checkout-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <h3>Total:</h3>
            <span className="checkout-total-amount">${orderDetails.totalAmount.toFixed(2)}</span>
          </div>

          <div className="checkout-buttons">
            <button onClick={handleConfirmOrder} className="checkout-confirm-button">
              Confirm Order
            </button>
            <button onClick={onCancelCheckout} className="checkout-cancel-button">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <p className="checkout-empty-message">No items in checkout. Please add products from the product list.</p>
      )}

      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default CheckoutPage;
