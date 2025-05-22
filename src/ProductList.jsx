import React, { useState, useEffect } from 'react';
import MessageModal from './MessageModal'; // Import the MessageModal
import './App.css'; // Import App.css for styling

// ProductList component to display products and allow users to order them.
function ProductList({ onProceedToCheckout }) { // Added onProceedToCheckout prop
  const [products, setProducts] = useState([]); // State to store fetched products
  const [cart, setCart] = useState({}); // State to store items in the cart: {productId: quantity}
  const [message, setMessage] = useState(''); // State for modal message
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [userEmail, setUserEmail] = useState(''); // State to store the logged-in user's email

  // Fetch products from the backend when the component mounts.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from local storage
        if (!token) {
          setMessage('You must be logged in to view products.');
          setShowModal(true);
          return;
        }

        const res = await fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}` // Include token in headers
          }
        });
        const data = await res.json();

        if (res.ok) {
          setProducts(data); // Set the fetched products
        } else {
          setMessage(data.message || 'Failed to fetch products.');
          setShowModal(true);
        }
      } catch (error) {
        console.error('Network error fetching products:', error);
        setMessage('Network error. Could not load products.');
        setShowModal(true);
      }
    };

    // Retrieve user email from localStorage, which is set during login in App.jsx
    const emailFromStorage = localStorage.getItem('userEmail');
    if (emailFromStorage) {
      setUserEmail(emailFromStorage);
    } else {
      console.warn("User email not found in localStorage. Order creation might fail without it.");
    }

    fetchProducts();
  }, []);

  // Handles quantity change for a product in the cart.
  const handleQuantityChange = (productId, quantity) => {
    // Ensure quantity is a positive number and does not exceed stock
    const product = products.find(p => p._id === productId);
    if (!product) return; // Should not happen if productId is valid

    let newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
    newQuantity = Math.min(newQuantity, product.stock); // Do not exceed available stock

    setCart(prevCart => ({
      ...prevCart,
      [productId]: newQuantity
    }));
  };

  // Prepares the order details and calls the onProceedToCheckout prop.
  const prepareOrderForCheckout = () => {
    let totalAmount = 0;
    const orderProducts = Object.keys(cart)
      .filter(productId => cart[productId] > 0) // Only include products with quantity > 0
      .map(productId => {
        const product = products.find(p => p._id === productId);
        const quantity = cart[productId];
        totalAmount += product.price * quantity;
        return {
          productName: product.name, // Use productName as expected by backend
          quantity: quantity,
          price: product.price // Include price for checkout display
        };
      });

    if (orderProducts.length === 0) {
      setMessage('Your cart is empty. Please add products before proceeding to checkout.');
      setShowModal(true);
      return;
    }

    if (!userEmail) {
      setMessage('User email not found. Please log in again.');
      setShowModal(true);
      return;
    }

    // Call the parent's function to proceed to checkout page
    if (onProceedToCheckout) {
      onProceedToCheckout({
        userEmail: userEmail,
        products: orderProducts,
        totalAmount: totalAmount
      });
    }
  };

  // Closes the message modal.
  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="product-list-container">
      <h2 className="product-list-title">Available Products</h2>

      {products.length === 0 ? (
        <p className="product-list-empty">No products available at the moment.</p>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <img
                src={product.image || `https://placehold.co/200x200/E0E0E0/333333?text=No+Image`}
                alt={product.name}
                className="product-image"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/200x200/E0E0E0/333333?text=No+Image`; }}
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                Stock: {product.stock > 0 ? product.stock : 'Out of Stock'}
              </p>

              <div className="quantity-controls">
                <button
                  onClick={() => handleQuantityChange(product._id, (cart[product._id] || 0) - 1)}
                  className="quantity-button decrement"
                  disabled={product.stock === 0 || (cart[product._id] || 0) <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max={product.stock}
                  value={cart[product._id] || 0}
                  onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                  className="quantity-input"
                  disabled={product.stock === 0}
                />
                <button
                  onClick={() => handleQuantityChange(product._id, (cart[product._id] || 0) + 1)}
                  className="quantity-button increment"
                  disabled={product.stock === 0 || (cart[product._id] || 0) >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place Order Button */}
      {products.length > 0 && (
        <div className="place-order-button-container">
          <button
            onClick={prepareOrderForCheckout} // Changed to prepare for checkout
            className="place-order-button"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* Message modal */}
      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default ProductList;
