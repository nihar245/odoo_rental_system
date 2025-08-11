// src/components/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { id, name, category, price, image, description, isAvailable } = product;

  return (
    <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image || 'https://via.placeholder.com/400x300?text=Product+Image'}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Not Available</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              ${price}
            </span>
            <span className="text-gray-500 text-sm ml-1">/hour</span>
          </div>
          
          {isAvailable ? (
            <span className="text-success-600 text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
              Available
            </span>
          ) : (
            <span className="text-accent-600 text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-accent-500 rounded-full mr-2"></div>
              Rented
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/product/${id}`}
            className="flex-1 btn-primary text-center py-2"
          >
            View Details
          </Link>
          
          {isAvailable && (
            <button className="btn-secondary py-2 px-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
