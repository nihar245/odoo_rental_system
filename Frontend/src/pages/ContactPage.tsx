import React from 'react';
import Layout from '../components/Layout';

const ContactPage: React.FC = () => {
  return (
    <Layout title="Contact Us">
      <div className="card p-6 max-w-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">We're here to help</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Reach out to us via email or phone.</p>
        <div className="space-y-2 text-gray-900 dark:text-gray-100">
          <div>
            <span className="font-medium">Email: </span>
            <a className="text-indigo-600 dark:text-indigo-300" href="mailto:support@rentalhub.com">support@rentalhub.com</a>
          </div>
          <div>
            <span className="font-medium">Mobile: </span>
            <a className="text-indigo-600 dark:text-indigo-300" href="tel:+919999999999">+91 99999 99999</a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;


