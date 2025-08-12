import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ProductDetail from './pages/customer/ProductDetail';
import MyRentals from './pages/customer/MyRentals';
import PaymentPage from './pages/customer/PaymentPage';
import ProfilePage from './pages/customer/ProfilePage';
import MyInvoices from './pages/customer/MyInvoices';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import PricelistManagement from './pages/admin/PricelistManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ReturnsManagement from './pages/admin/ReturnsManagement';
import ReportsPage from './pages/admin/ReportsPage';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import RentalShop from './pages/customer/RentalShop';
import WishlistPage from './pages/customer/WishlistPage';
import OrdersPage from './pages/customer/OrdersPage';
import ContactPage from './pages/ContactPage';
import AdminRental from './pages/admin/AdminRental';
import SettingsPage from './pages/admin/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/rental-shop" element={<RentalShop />} />
              <Route path="/customer/wishlist" element={<WishlistPage />} />
              <Route path="/customer/orders" element={<OrdersPage />} />
              <Route path="/customer/invoices" element={<MyInvoices />} />
              <Route path="/customer/product/:id" element={<ProductDetail />} />
              <Route path="/customer/rentals" element={<MyRentals />} />
              <Route path="/customer/payment/:rentalId" element={<PaymentPage />} />
              <Route path="/customer/profile" element={<ProfilePage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/pricelists" element={<PricelistManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/returns" element={<ReturnsManagement />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/invoices" element={<InvoiceManagement />} />
              <Route path="/admin/rental" element={<AdminRental />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;