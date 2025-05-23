import React, { useState } from 'react';
import MessageModal from './MessageModal';
import './App.css';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Fallback for local dev

// AddProductForm component for administrators to add new products.
function AddProductForm({ onProductAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const productData = {
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock, 10),
      image,
    };

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
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in as an admin to add products.');
        setShowModal(true);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/products`, { // Updated API URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Product added successfully!');
        setShowModal(true);
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setStock('');
        setImage('');
        if (onProductAdded) {
          onProductAdded();
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

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Add New Product</h2>
      <form onSubmit={handleAddProduct} className="form-fields">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
          className="form-input"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product Description"
          rows="3"
          className="form-textarea"
          required
        ></textarea>
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
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="form-input"
          required
        />
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
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL"
          className="form-input"
          required
        />
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
