import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { LogOut, Package, Home as HomeIcon, ShoppingCart, Heart, Phone, Sun, Moon, LayoutGrid } from 'lucide-react';
import Footer from './Footer';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps { children: ReactNode; title: string; showTabs?: boolean; activeTab?: string; }

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const isGuest = !user;
  const homePath = user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
  const rentalPath = '/customer/rental-shop';

  const handleLogout = () => { setUser(null); navigate('/login'); };

  const CustomerNav = () => (
    <div className="h-16 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {isGuest && (
          <span className="mr-2 px-2 py-1 rounded bg-indigo-50 text-indigo-700 dark:bg-gray-800 dark:text-indigo-300 text-xs sm:text-sm font-medium whitespace-nowrap">Guest Mode – Dashboard</span>
        )}
        <button onClick={() => navigate(homePath)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700 flex items-center space-x-2"><HomeIcon size={16} /><span>Dashboard</span></button>
        <button onClick={() => navigate(rentalPath)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700 flex items-center space-x-2"><Package size={16} /><span>RentalShop</span></button>
        {!isGuest && (
          <>
            <button onClick={() => navigate('/customer/wishlist')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700 flex items-center space-x-2"><Heart size={16} /><span>Wishlist</span></button>
            <button onClick={() => navigate('/customer/orders')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700 flex items-center space-x-2" title="Orders"><ShoppingCart size={16} /></button>
          </>
        )}
      </div>
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate('/contact')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700 flex items-center space-x-2"><Phone size={16} /><span>Contact Us</span></button>
        <button onClick={toggle} className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-50" title="Toggle theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        {!isGuest ? (
          <>
            <button onClick={() => navigate('/customer/profile')} className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100">
                {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-500 text-xs">{user?.name?.[0] ?? 'U'}</div>}
              </div>
              <span className="hidden sm:inline text-sm text-indigo-700">{user?.name}</span>
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-50" title="Logout"><LogOut size={18} /></button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700">Login</button>
            <button onClick={() => navigate('/signup')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700">Signup</button>
          </>
        )}
      </div>
    </div>
  );

  const AdminNav = () => (
    <div className="h-16 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate('/admin/dashboard')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700 flex items-center space-x-2"><LayoutGrid size={16} /><span>Dashboard</span></button>
        <button onClick={() => navigate('/admin/rental')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700">Rental</button>
        <button onClick={() => navigate('/admin/orders')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700">Order</button>
        <button onClick={() => navigate('/admin/products')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700">Products</button>
        <button onClick={() => navigate('/admin/reports')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700">Reporting</button>
        <button onClick={() => navigate('/admin/settings')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 text-indigo-700">Settings</button>
      </div>
      <div className="flex items-center space-x-3">
        <button onClick={toggle} className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-50" title="Toggle theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button onClick={() => navigate('/customer/profile')} className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100">
            {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-500 text-xs">{user?.name?.[0] ?? 'U'}</div>}
          </div>
          <span className="hidden sm:inline text-sm text-indigo-700">{user?.name}</span>
        </button>
        <button onClick={handleLogout} className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-50" title="Logout"><LogOut size={18} /></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {user?.role === 'admin' ? <AdminNav /> : <CustomerNav />}
        </div>
      </nav>

      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Layout;