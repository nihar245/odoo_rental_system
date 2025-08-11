// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-accent-100 mb-6">
            <span className="text-6xl font-bold text-accent-600">404</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary px-8 py-3 text-base font-medium"
            >
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="btn-secondary px-8 py-3 text-base font-medium"
            >
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12">
            <p className="text-sm text-gray-500 mb-4">Or try these helpful links:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Browse Equipment
              </Link>
              <Link
                to="/my-rentals"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                My Rentals
              </Link>
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
