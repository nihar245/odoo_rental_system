// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
    availability: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Dummy data for demonstration
  useEffect(() => {
    const dummyProducts = [
      {
        id: 1,
        name: 'Professional Drilling Machine',
        category: 'Construction',
        price: 25,
        description: 'Heavy-duty drilling machine perfect for construction projects. Includes safety features and multiple drill bits.',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
      {
        id: 2,
        name: 'Garden Lawn Mower',
        category: 'Gardening',
        price: 15,
        description: 'Electric lawn mower with adjustable cutting height. Perfect for maintaining your garden.',
        image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
      {
        id: 3,
        name: 'Paint Sprayer Kit',
        category: 'Painting',
        price: 20,
        description: 'Professional paint sprayer with multiple nozzle sizes. Ideal for large painting projects.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop&crop=center',
        isAvailable: false,
      },
      {
        id: 4,
        name: 'Concrete Mixer',
        category: 'Construction',
        price: 35,
        description: 'Portable concrete mixer with 3.5 cubic feet capacity. Perfect for small to medium projects.',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
      {
        id: 5,
        name: 'Hedge Trimmer',
        category: 'Gardening',
        price: 18,
        description: 'Cordless hedge trimmer with long reach. Battery-powered for easy maneuverability.',
        image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
      {
        id: 6,
        name: 'Pressure Washer',
        category: 'Cleaning',
        price: 30,
        description: 'High-pressure washer with adjustable settings. Perfect for cleaning driveways and outdoor surfaces.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
      {
        id: 7,
        name: 'Scaffolding Set',
        category: 'Construction',
        price: 45,
        description: 'Complete scaffolding set with safety rails. Easy to assemble and disassemble.',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center',
        isAvailable: false,
      },
      {
        id: 8,
        name: 'Leaf Blower',
        category: 'Gardening',
        price: 12,
        description: 'Gas-powered leaf blower with variable speed control. Ideal for fall cleanup.',
        image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
      {
        id: 9,
        name: 'Circular Saw',
        category: 'Construction',
        price: 22,
        description: 'Professional circular saw with laser guide. Perfect for precise cutting of wood and metal.',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
      {
        id: 10,
        name: 'Garden Hose',
        category: 'Gardening',
        price: 8,
        description: 'Heavy-duty garden hose with adjustable nozzle. Ideal for watering plants and cleaning.',
        image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
      {
        id: 11,
        name: 'Paint Roller Set',
        category: 'Painting',
        price: 12,
        description: 'Professional paint roller set with multiple sizes. Perfect for interior and exterior painting.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
      {
        id: 12,
        name: 'Steam Cleaner',
        category: 'Cleaning',
        price: 28,
        description: 'High-temperature steam cleaner for deep cleaning. Sanitizes surfaces without chemicals.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop&crop=center',
        isAvailable: true,
      },
    ];

    setProducts(dummyProducts);
    setFilteredProducts(dummyProducts);
    setIsLoading(false);
  }, []);

  const categories = ['All', 'Construction', 'Gardening', 'Painting', 'Cleaning'];
  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: 'Under $15', value: '0-15' },
    { label: '$15 - $25', value: '15-25' },
    { label: '$25 - $40', value: '25-40' },
    { label: 'Over $40', value: '40+' },
  ];

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters) => {
    let filtered = [...products];

    // Search filter
    if (currentFilters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        product.category.toLowerCase().includes(currentFilters.search.toLowerCase())
      );
    }

    // Category filter
    if (currentFilters.category && currentFilters.category !== 'All') {
      filtered = filtered.filter(product => product.category === currentFilters.category);
    }

    // Price range filter
    if (currentFilters.priceRange) {
      const [min, max] = currentFilters.priceRange.split('-').map(Number);
      if (currentFilters.priceRange === '40+') {
        filtered = filtered.filter(product => product.price >= 40);
      } else if (max) {
        filtered = filtered.filter(product => product.price >= min && product.price <= max);
      } else {
        filtered = filtered.filter(product => product.price <= min);
      }
    }

    // Availability filter
    if (currentFilters.availability === 'available') {
      filtered = filtered.filter(product => product.isAvailable);
    } else if (currentFilters.availability === 'unavailable') {
      filtered = filtered.filter(product => !product.isAvailable);
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      priceRange: '',
      availability: 'all',
    };
    setFilters(clearedFilters);
    setFilteredProducts(products);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rent Equipment & Tools
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Find the perfect equipment for your project. From construction tools to gardening equipment, 
              we have everything you need to get the job done.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for equipment, tools, or categories..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-6 py-4 text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <button className="absolute right-2 top-2 btn-primary px-6 py-2">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field min-w-[150px]"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category === 'All' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Price Range Filter */}
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="input-field min-w-[150px]"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              {/* Availability Filter */}
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="input-field min-w-[150px]"
              >
                <option value="all">All Items</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="btn-secondary whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            <button
              onClick={clearFilters}
              className="mt-4 btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
