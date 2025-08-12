import React from 'react';
import Layout from '../components/Layout';

const ContactPage: React.FC = () => {
  return (
    <Layout title="Contact Us">
      <div className="card p-4 sm:p-6 max-w-xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">We're here to help</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">Reach out to us via email or phone.</p>
        <div className="space-y-3 sm:space-y-4 text-gray-900 dark:text-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
            <span className="font-medium text-sm sm:text-base">Email: </span>
            <a className="text-indigo-600 dark:text-indigo-300 hover:underline text-sm sm:text-base" href="mailto:support@rentalhub.com">support@rentalhub.com</a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
            <span className="font-medium text-sm sm:text-base">Mobile: </span>
            <a className="text-indigo-600 dark:text-indigo-300 hover:underline text-sm sm:text-base" href="tel:+919999999999">+91 99999 99999</a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
            <span className="font-medium text-sm sm:text-base">Address: </span>
            <span className="text-sm sm:text-base">123 Business Ave, Suite 100, New York, NY 10001</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
            <span className="font-medium text-sm sm:text-base">Hours: </span>
            <span className="text-sm sm:text-base">Monday - Friday: 9:00 AM - 6:00 PM</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;


