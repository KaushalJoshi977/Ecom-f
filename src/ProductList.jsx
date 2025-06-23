import React, { useState, useEffect } from 'react';
import MessageModal from './MessageModal';
import './App.css';

// Get the API base URL from environment variables
// This line was missing or not used in your provided code
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Fallback for local dev

// ProductList component to display products and allow users to order them.
function ProductList({ onProceedToCheckout }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('You must be logged in to view products.');
          setShowModal(true);
          return;
        }

        // FIX: Use API_BASE_URL for the fetch request
        const res = await fetch(`${API_BASE_URL}/api/products`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (res.ok) {
          setProducts(data);
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

    const emailFromStorage = localStorage.getItem('userEmail');
    if (emailFromStorage) {
      setUserEmail(emailFromStorage);
    } else {
      console.warn("User email not found in localStorage. Order creation might fail without it.");
    }

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    let newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
    newQuantity = Math.min(newQuantity, product.stock);

    setCart(prevCart => ({
      ...prevCart,
      [productId]: newQuantity
    }));
  };

  const prepareOrderForCheckout = () => {
    let totalAmount = 0;
    const orderProducts = Object.keys(cart)
      .filter(productId => cart[productId] > 0)
      .map(productId => {
        const product = products.find(p => p._id === productId);
        const quantity = cart[productId];
        totalAmount += product.price * quantity;
        return {
          productName: product.name,
          quantity: quantity,
          price: product.price
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

    if (onProceedToCheckout) {
      onProceedToCheckout({
        userEmail: userEmail,
        products: orderProducts,
        totalAmount: totalAmount
      });
    }
  };

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
              <p className="product-price">Rs{product.price.toFixed(2)}</p>
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

      {products.length > 0 && (
        <div className="place-order-button-container">
          <button
            onClick={prepareOrderForCheckout}
            className="place-order-button"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default ProductList;
