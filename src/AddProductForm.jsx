import React, { useState } from 'react';
import MessageModal from './MessageModal'; // Import MessageModal
import './App.css'; // Import App.css for styling

// AddProductForm component for administrators to add new products.
function AddProductForm({ onProductAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(''); // For image URL
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Handles the submission of the add product form.
  const handleAddProduct = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const productData = {
      name,
      description,
      price: parseFloat(price), // Convert price to a number
      category,
      stock: parseInt(stock, 10), // Convert stock to an integer
      image,
    };

    // Basic validation
    if (!name || !description || !price || !category || !stock || !image) {
      setMessage('All fields are required.');
      setShowModal(true);
      return;
    }
    if (isNaN(productData.price) || productData.price <= 0) {
      setMessage('Price must be a positive number.');
      setShowModal(true);
      return;
    }
    if (isNaN(productData.stock) || productData.stock < 0) {
      setMessage('Stock must be a non-negative integer.');
      setShowModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Get the JWT token from local storage
      if (!token) {
        setMessage('You must be logged in as an admin to add products.');
        setShowModal(true);
        return;
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token for authentication
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Product added successfully!');
        setShowModal(true);
        // Clear form fields after successful submission
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setStock('');
        setImage('');
        if (onProductAdded) {
          onProductAdded(); // Notify parent component (App.jsx) that a product was added
        }
      } else {
        setMessage(data.message || 'Failed to add product. Please check your input.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Network error during product addition:', error);
      setMessage('Network error. Could not add product.');
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
      <h2 className="form-title">Add New Product</h2>
      <form onSubmit={handleAddProduct} className="form-fields">
        {/* Product Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
          className="form-input"
          required
        />
        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product Description"
          rows="3"
          className="form-textarea"
          required
        ></textarea>
        {/* Price */}
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          min="0.01"
          step="0.01"
          className="form-input"
          required
        />
        {/* Category */}
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="form-input"
          required
        />
        {/* Stock */}
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock Quantity"
          min="0"
          step="1"
          className="form-input"
          required
        />
        {/* Image URL */}
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL"
          className="form-input"
          required
        />
        {/* Submit Button */}
        <button
          type="submit"
          className="form-button add-product"
        >
          Add Product
        </button>
      </form>

      <MessageModal message={message} onClose={handleCloseModal} />
    </div>
  );
}

export default AddProductForm;
