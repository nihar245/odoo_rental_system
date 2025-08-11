// src/pages/AdminProductsPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Dummy products data
  useEffect(() => {
    const dummyProducts = [
      {
        id: 1,
        name: 'Professional Drilling Machine',
        category: 'Construction',
        price: 25,
        description: 'Heavy-duty drilling machine perfect for construction projects.',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 3,
        createdAt: '2024-01-01',
      },
      {
        id: 2,
        name: 'Garden Lawn Mower',
        category: 'Gardening',
        price: 15,
        description: 'Electric lawn mower with adjustable cutting height.',
        image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 5,
        createdAt: '2024-01-02',
      },
      {
        id: 3,
        name: 'Paint Sprayer Kit',
        category: 'Painting',
        price: 20,
        description: 'Professional paint sprayer with multiple nozzle sizes.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop&crop=center',
        isAvailable: false,
        stock: 0,
        createdAt: '2024-01-03',
      },
      {
        id: 4,
        name: 'Concrete Mixer',
        category: 'Construction',
        price: 35,
        description: 'Portable concrete mixer with 3.5 cubic feet capacity.',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 2,
        createdAt: '2024-01-04',
      },
      {
        id: 5,
        name: 'Hedge Trimmer',
        category: 'Gardening',
        price: 18,
        description: 'Cordless hedge trimmer with long reach.',
        image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 4,
        createdAt: '2024-01-05',
      },
      {
        id: 6,
        name: 'Pressure Washer',
        category: 'Cleaning',
        price: 30,
        description: 'High-pressure washer with adjustable settings.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 3,
        createdAt: '2024-01-06',
      },
      {
        id: 7,
        name: 'Scaffolding Set',
        category: 'Construction',
        price: 45,
        description: 'Complete scaffolding set with safety rails.',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop&crop=center',
        isAvailable: false,
        stock: 0,
        createdAt: '2024-01-07',
      },
      {
        id: 8,
        name: 'Leaf Blower',
        category: 'Gardening',
        price: 12,
        description: 'Gas-powered leaf blower with variable speed control.',
        image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 6,
        createdAt: '2024-01-08',
      },
      {
        id: 9,
        name: 'Circular Saw',
        category: 'Construction',
        price: 22,
        description: 'Professional circular saw with laser guide.',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 4,
        createdAt: '2024-01-09',
      },
      {
        id: 10,
        name: 'Garden Hose',
        category: 'Gardening',
        price: 8,
        description: 'Heavy-duty garden hose with adjustable nozzle.',
        image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 10,
        createdAt: '2024-01-10',
      },
      {
        id: 11,
        name: 'Paint Roller Set',
        category: 'Painting',
        price: 12,
        description: 'Professional paint roller set with multiple sizes.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 8,
        createdAt: '2024-01-11',
      },
      {
        id: 12,
        name: 'Steam Cleaner',
        category: 'Cleaning',
        price: 28,
        description: 'High-temperature steam cleaner for deep cleaning.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop&crop=center',
        isAvailable: true,
        stock: 2,
        createdAt: '2024-01-12',
      },
    ];

    setProducts(dummyProducts);
    setIsLoading(false);
  }, []);

  const categories = ['All', 'Construction', 'Gardening', 'Painting', 'Cleaning'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || categoryFilter === '' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = (productData) => {
    const newProduct = {
      id: products.length + 1,
      ...productData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts([...products, newProduct]);
    setShowAddForm(false);
  };

  const handleEditProduct = (productData) => {
    setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const toggleAvailability = (productId) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Products</h1>
              <p className="text-gray-600">Add, edit, and manage your rental equipment inventory</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary mt-4 sm:mt-0"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full sm:w-64"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field min-w-[150px]"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category === 'All' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${product.price}</div>
                      <div className="text-sm text-gray-500">per hour</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                      <div className="text-sm text-gray-500">units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAvailability(product.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          product.isAvailable
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-accent-600 hover:text-accent-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {(showAddForm || editingProduct) && (
          <ProductForm
            product={editingProduct}
            onSave={editingProduct ? handleEditProduct : handleAddProduct}
            onCancel={() => {
              setShowAddForm(false);
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Product Form Component
const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'Construction',
    price: product?.price || '',
    description: product?.description || '',
    stock: product?.stock || 1,
    isAvailable: product?.isAvailable ?? true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-accent-500' : ''}`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-accent-600">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Construction">Construction</option>
                <option value="Gardening">Gardening</option>
                <option value="Painting">Painting</option>
                <option value="Cleaning">Cleaning</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Hour ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`input-field ${errors.price ? 'border-accent-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-accent-600">{errors.price}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`input-field ${errors.stock ? 'border-accent-500' : ''}`}
                placeholder="1"
                min="0"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-accent-600">{errors.stock}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`input-field ${errors.description ? 'border-accent-500' : ''}`}
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-accent-600">{errors.description}</p>
              )}
            </div>

            {/* Available */}
            <div className="flex items-center">
              <input
                id="isAvailable"
                name="isAvailable"
                type="checkbox"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                Available for rent
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                {product ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
