import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">© {new Date().getFullYear()} RentalHub. All rights reserved.</div>
        <nav className="flex items-center justify-center space-x-6 text-sm">
          <Link to="/customer/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Home</Link>
          <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Contact Us</Link>
          <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">About Us</a>
        </nav>
        <div className="flex items-center justify-end space-x-3">
          <a href="#" aria-label="Twitter" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"><Twitter size={18} /></a>
          <a href="#" aria-label="Facebook" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"><Facebook size={18} /></a>
          <a href="#" aria-label="Instagram" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"><Instagram size={18} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
