// src/pages/ProductDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingData, setBookingData] = useState({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
  });
  const [isBooking, setIsBooking] = useState(false);

  // Dummy product data
  useEffect(() => {
    const allProducts = {
      1: {
        id: 1,
        name: 'Professional Drilling Machine',
        category: 'Construction',
        price: 25,
        description: 'Heavy-duty drilling machine perfect for construction projects. This professional-grade equipment includes safety features, multiple drill bits, and is designed for both residential and commercial use. Features include variable speed control, depth stop, and ergonomic design for extended use.',
        longDescription: `This professional drilling machine is built to handle the toughest construction challenges. With its powerful motor and precision engineering, it delivers consistent performance even in the most demanding conditions.

Key Features:
• 1200W powerful motor for heavy-duty drilling
• Variable speed control (0-3000 RPM)
• Depth stop for precise drilling depths
• Ergonomic design with anti-vibration handle
• Includes 5 different drill bit sizes
• Safety clutch for operator protection
• LED work light for improved visibility
• Quick-change chuck system

Perfect for:
• Concrete drilling
• Metal fabrication
• Woodworking projects
• Construction sites
• Home renovations

All equipment comes with a comprehensive safety manual and basic maintenance guide.`,
        images: [
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
        ],
        isAvailable: true,
        specifications: {
          'Power': '1200W',
          'Speed': '0-3000 RPM',
          'Chuck Size': '13mm',
          'Weight': '4.2kg',
          'Dimensions': '320 x 280 x 120mm',
          'Voltage': '220-240V',
          'Warranty': '1 Year',
        },
        reviews: [
          {
            id: 1,
            user: 'John D.',
            rating: 5,
            comment: 'Excellent drilling machine. Very powerful and easy to use.',
            date: '2024-01-15',
          },
          {
            id: 2,
            user: 'Sarah M.',
            rating: 4,
            comment: 'Great for construction projects. Good value for money.',
            date: '2024-01-10',
          },
        ],
      },
      2: {
        id: 2,
        name: 'Garden Lawn Mower',
        category: 'Gardening',
        price: 15,
        description: 'Electric lawn mower with adjustable cutting height. Perfect for maintaining your garden with eco-friendly operation.',
        longDescription: `This electric lawn mower is designed for both residential and light commercial use. It features a powerful electric motor that provides consistent cutting performance while being environmentally friendly.

Key Features:
• 1400W electric motor for reliable performance
• Adjustable cutting height (25-75mm)
• 40cm cutting width for efficient coverage
• Grass collection bag with 50L capacity
• Foldable handle for easy storage
• Safety switch for operator protection
• Lightweight design for easy maneuverability

Perfect for:
• Residential lawns
• Small to medium gardens
• Eco-conscious users
• Quiet operation areas
• Regular maintenance

Includes safety manual and basic maintenance guide.`,
        images: [
          'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=600&h=400&fit=crop&crop=center',
        ],
        isAvailable: true,
        specifications: {
          'Power': '1400W',
          'Cutting Width': '40cm',
          'Cutting Height': '25-75mm',
          'Weight': '12kg',
          'Dimensions': '120 x 40 x 110cm',
          'Voltage': '220-240V',
          'Warranty': '2 Years',
        },
        reviews: [
          {
            id: 1,
            user: 'Mike R.',
            rating: 5,
            comment: 'Great electric mower. Quiet and efficient.',
            date: '2024-01-20',
          },
          {
            id: 2,
            user: 'Lisa K.',
            rating: 4,
            comment: 'Easy to use and maintain. Perfect for my garden.',
            date: '2024-01-18',
          },
        ],
      },
      3: {
        id: 3,
        name: 'Paint Sprayer Kit',
        category: 'Painting',
        price: 20,
        description: 'Professional paint sprayer with multiple nozzle sizes. Ideal for large painting projects with professional finish.',
        longDescription: `This professional paint sprayer kit is designed for both DIY enthusiasts and professional painters. It provides a smooth, even finish on various surfaces with adjustable spray patterns.

Key Features:
• 600W motor for consistent paint flow
• Adjustable spray pattern (horizontal, vertical, circular)
• Multiple nozzle sizes (1.5mm, 2.0mm, 2.5mm)
• 1L paint container capacity
• Variable pressure control
• Easy-clean design
• Includes cleaning tools and spare parts

Perfect for:
• Interior walls and ceilings
• Furniture refinishing
• Fence and deck painting
• Automotive touch-ups
• Craft projects

Complete kit with all necessary accessories and detailed instructions.`,
        images: [
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop&crop=center',
        ],
        isAvailable: false,
        specifications: {
          'Power': '600W',
          'Nozzle Sizes': '1.5mm, 2.0mm, 2.5mm',
          'Container': '1L',
          'Weight': '2.8kg',
          'Dimensions': '25 x 15 x 30cm',
          'Voltage': '220-240V',
          'Warranty': '1 Year',
        },
        reviews: [
          {
            id: 1,
            user: 'David L.',
            rating: 5,
            comment: 'Professional quality sprayer. Excellent finish.',
            date: '2024-01-12',
          },
          {
            id: 2,
            user: 'Emma W.',
            rating: 4,
            comment: 'Easy to use and clean. Great for large projects.',
            date: '2024-01-08',
          },
        ],
      },
      4: {
        id: 4,
        name: 'Concrete Mixer',
        category: 'Construction',
        price: 35,
        description: 'Portable concrete mixer with 3.5 cubic feet capacity. Perfect for small to medium construction projects.',
        longDescription: `This portable concrete mixer is designed for both professional contractors and DIY enthusiasts. It provides consistent mixing for concrete, mortar, and other construction materials.

Key Features:
• 3.5 cubic feet mixing capacity
• 1/3 HP electric motor
• Steel drum with rust-resistant coating
• Adjustable stand for easy loading
• Wheels for portability
• Safety guard for operator protection
• Easy-clean design

Perfect for:
• Small construction projects
• Home renovations
• Patio and walkway construction
• Foundation work
• Masonry projects

Includes safety manual and maintenance guide.`,
        images: [
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
        ],
        isAvailable: true,
        specifications: {
          'Capacity': '3.5 cu ft',
          'Motor': '1/3 HP',
          'Drum Material': 'Steel',
          'Weight': '45kg',
          'Dimensions': '120 x 60 x 90cm',
          'Voltage': '220-240V',
          'Warranty': '1 Year',
        },
        reviews: [
          {
            id: 1,
            user: 'Tom B.',
            rating: 5,
            comment: 'Great mixer for small projects. Very portable.',
            date: '2024-01-22',
          },
          {
            id: 2,
            user: 'Rachel S.',
            rating: 4,
            comment: 'Easy to use and clean. Perfect for my patio project.',
            date: '2024-01-19',
          },
        ],
      },
      5: {
        id: 5,
        name: 'Hedge Trimmer',
        category: 'Gardening',
        price: 18,
        description: 'Cordless hedge trimmer with long reach. Battery-powered for easy maneuverability and quiet operation.',
        longDescription: `This cordless hedge trimmer is perfect for maintaining hedges, shrubs, and bushes. It features a long reach design and powerful battery operation for maximum convenience.

Key Features:
• 20V lithium-ion battery
• 60cm cutting blade length
• Adjustable cutting angle
• Lightweight design (2.1kg)
• Battery indicator light
• Safety lock switch
• Includes battery and charger

Perfect for:
• Hedge maintenance
• Shrub trimming
• Garden shaping
• Residential use
• Quiet operation areas

Complete kit with battery, charger, and safety equipment.`,
        images: [
          'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1592840496694-26d035b52b0d?w=600&h=400&fit=crop&crop=center',
        ],
        isAvailable: true,
        specifications: {
          'Battery': '20V Li-ion',
          'Blade Length': '60cm',
          'Weight': '2.1kg',
          'Cutting Angle': '0-90°',
          'Runtime': '45 minutes',
          'Charging Time': '2 hours',
          'Warranty': '2 Years',
        },
        reviews: [
          {
            id: 1,
            user: 'James H.',
            rating: 5,
            comment: 'Excellent battery life and very lightweight.',
            date: '2024-01-25',
          },
          {
            id: 2,
            user: 'Maria C.',
            rating: 4,
            comment: 'Easy to use and maintain. Great for my garden.',
            date: '2024-01-21',
          },
        ],
      },
    };

    const productId = parseInt(id);
    const dummyProduct = allProducts[productId] || allProducts[1]; // Default to first product if ID not found
    
    setProduct(dummyProduct);
    setIsLoading(false);
  }, [id]);

  const handleDateChange = (date, field) => {
    setBookingData(prev => ({
      ...prev,
      [field]: date,
    }));
  };

  const calculateTotalPrice = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays * product.price;
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Please select start and end dates');
      return;
    }

    setIsBooking(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Booking successful! You will receive a confirmation email shortly.');
      setIsBooking(false);
      navigate('/my-rentals');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-primary-600 text-sm font-medium"
              >
                Home
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-500 text-sm">{product.category}</span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 text-sm font-medium">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images and Details */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-primary-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Product Information */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.longDescription}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {product.reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{review.user}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                    <p className="text-gray-400 text-xs mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">${product.price}</div>
                  <div className="text-gray-500 text-sm">per day</div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{product.description}</p>

              <div className="flex items-center space-x-2">
                {product.isAvailable ? (
                  <span className="text-success-600 text-sm font-medium flex items-center">
                    <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                    Available for Rent
                  </span>
                ) : (
                  <span className="text-accent-600 text-sm font-medium flex items-center">
                    <div className="w-2 h-2 bg-accent-500 rounded-full mr-2"></div>
                    Currently Rented
                  </span>
                )}
              </div>
            </div>

            {/* Booking Form */}
            {product.isAvailable && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Book This Item</h2>
                
                <div className="space-y-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <DatePicker
                      selected={bookingData.startDate}
                      onChange={(date) => handleDateChange(date, 'startDate')}
                      minDate={new Date()}
                      className="input-field"
                      placeholderText="Select start date"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <DatePicker
                      selected={bookingData.endDate}
                      onChange={(date) => handleDateChange(date, 'endDate')}
                      minDate={bookingData.startDate || new Date()}
                      className="input-field"
                      placeholderText="Select end date"
                    />
                  </div>

                  {/* Total Price */}
                  {bookingData.startDate && bookingData.endDate && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Total Price:</span>
                        <span className="text-2xl font-bold text-primary-600">
                          ${calculateTotalPrice()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))} days × ${product.price}/day
                      </p>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={handleBooking}
                    disabled={!bookingData.startDate || !bookingData.endDate || isBooking}
                    className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-500 text-center">
                      Please{' '}
                      <button
                        onClick={() => navigate('/login', { state: { from: `/product/${id}` } })}
                        className="text-primary-600 hover:text-primary-500 font-medium"
                      >
                        sign in
                      </button>{' '}
                      to book this item
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
