import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-6 sm:mt-10 border-t border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center text-center sm:text-left">
          <div className="text-sm text-zinc-600 dark:text-zinc-300 order-1 sm:order-1">
            © {new Date().getFullYear()} RentalHub. All rights reserved.
          </div>
          <nav className="flex items-center justify-center sm:justify-center space-x-4 sm:space-x-6 text-sm order-3 sm:order-2">
            <Link to="/customer/dashboard" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
            <Link to="/contact" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">Contact Us</Link>
            <a href="#" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">About Us</a>
          </nav>
          <div className="flex items-center justify-center sm:justify-end space-x-3 order-2 sm:order-3">
            <a href="#" aria-label="Twitter" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"><Twitter size={18} /></a>
            <a href="#" aria-label="Facebook" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"><Instagram size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
