import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProductList from './ProductList';
import AddProductForm from './AddProductForm';
import CheckoutPage from './CheckoutPage';
import MyOrders from './MyOrders';
import AllOrders from './AllOrders';
import MessageModal from './MessageModal';
import './App.css'; // Ensure App.css is imported for global styles

// Main application component.
function App() {
  // State to manage which page is currently active ('login', 'register', 'dashboard', 'products', 'addProduct', 'checkout', 'myOrders', 'allOrders').
  const [currentPage, setCurrentPage] = useState('login');
  // State to manage user login status.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to store user information after successful login.
  const [user, setUser] = useState(null);
  // State for modal messages
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  // State to store order details before proceeding to checkout
  const [currentOrderDetails, setCurrentOrderDetails] = useState(null);

  // useEffect hook to check for a token in local storage on component mount.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setCurrentPage('dashboard');
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userEmail');
          setIsLoggedIn(false);
          setCurrentPage('login');
        }
      } else {
        setUser({ name: 'User' }); // Fallback placeholder
        setCurrentPage('dashboard');
      }
    }
  }, []);

  // Handles successful login from LoginForm.
  const handleLoginSuccess = (loggedInUser) => {
    setIsLoggedIn(true);
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('userEmail', loggedInUser.email);
    setCurrentPage('dashboard');
  };

  // Handles successful registration from RegisterForm.
  const handleRegisterSuccess = () => {
    setMessage('Registration successful! Please log in.');
    setShowModal(true);
    setCurrentPage('login');
  };

  // Handles user logout.
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('login');
  };

  // Handles proceeding from ProductList to CheckoutPage.
  const handleProceedToCheckout = (orderDetails) => {
    setCurrentOrderDetails(orderDetails);
    setCurrentPage('checkout');
  };

  // Handles order confirmation from CheckoutPage.
  const handleOrderConfirmed = () => {
    setMessage('Order placed successfully!');
    setShowModal(true);
    setCurrentOrderDetails(null); // Clear order details
    setCurrentPage('myOrders'); // Redirect to user's order history
  };

  // Handles cancellation from CheckoutPage.
  const handleCancelCheckout = () => {
    setCurrentOrderDetails(null); // Clear order details
    setCurrentPage('products'); // Go back to product list
  };

  // Closes the message modal.
  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1 className="navbar-title">Perfect Store</h1> {/* Changed website name */}
        <div className="navbar-links">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`navbar-button ${currentPage === 'dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('products')}
                className={`navbar-button ${currentPage === 'products' ? 'active' : ''}`}
              >
                Products
              </button>
              <button
                onClick={() => setCurrentPage('myOrders')}
                className={`navbar-button ${currentPage === 'myOrders' ? 'active' : ''}`}
              >
                My Orders
              </button>
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => setCurrentPage('addProduct')}
                    className={`navbar-button ${currentPage === 'addProduct' ? 'active' : ''}`}
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => setCurrentPage('allOrders')}
                    className={`navbar-button ${currentPage === 'allOrders' ? 'active' : ''}`}
                  >
                    All Orders
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="navbar-logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentPage('login')}
                className={`navbar-button ${currentPage === 'login' ? 'active' : ''}`}
              >
                Login
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className={`navbar-button ${currentPage === 'register' ? 'active' : ''}`}
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Welcome message displayed separately */}
      {isLoggedIn && (
        <div className="welcome-message-container">
          <span className="navbar-welcome">Welcome, {user?.name || 'User'}!</span>
        </div>
      )}

      {/* Main content area */}
      <main className="main-content-area">
        {!isLoggedIn && currentPage === 'login' && <LoginForm onLoginSuccess={handleLoginSuccess} />}
        {!isLoggedIn && currentPage === 'register' && <RegisterForm onRegisterSuccess={handleRegisterSuccess} />}

        {isLoggedIn && currentPage === 'dashboard' && (
          <div className="dashboard-welcome">
            <h2>Welcome to your Dashboard, {user?.name || 'User'}!</h2>
            <p>From here, you can manage your account and explore products.</p>
            <button
              onClick={() => setCurrentPage('products')}
              className="dashboard-view-products-button"
            >
              View Products
            </button>
          </div>
        )}

        {isLoggedIn && currentPage === 'products' && <ProductList onProceedToCheckout={handleProceedToCheckout} />}

        {isLoggedIn && currentPage === 'addProduct' && user?.role === 'admin' && (
          <AddProductForm onProductAdded={() => {
            setMessage('Product added successfully!');
            setShowModal(true);
            setCurrentPage('products');
          }} />
        )}

        {isLoggedIn && currentPage === 'checkout' && (
          <CheckoutPage
            orderDetails={currentOrderDetails}
            onOrderConfirmed={handleOrderConfirmed}
            onCancelCheckout={handleCancelCheckout}
          />
        )}

        {isLoggedIn && currentPage === 'myOrders' && <MyOrders userEmail={user?.email} />}

        {isLoggedIn && currentPage === 'allOrders' && user?.role === 'admin' && <AllOrders />}
      </main>

      {/* Global Message Modal */}
      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default App;
