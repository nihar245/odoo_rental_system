import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { LogOut, Package, Home as HomeIcon, ShoppingCart, Heart, Phone, Sun, Moon, LayoutGrid, FileText, Menu, X, ChevronDown } from 'lucide-react';
import Footer from './Footer';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

interface LayoutProps { children: ReactNode; title: string; showTabs?: boolean; activeTab?: string; }

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const isGuest = !user;
  const homePath = user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
  const rentalPath = '/customer/rental-shop';

  const handleLogout = () => { setUser(null); navigate('/login'); };

  const CustomerNav = () => (
    <>
      {/* Desktop Navigation */}
      <div className="hidden sm:flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          {isGuest && (
            <span className="mr-2 px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-zinc-800 dark:text-emerald-300 text-xs sm:text-sm font-medium whitespace-nowrap">Guest Mode – Dashboard</span>
          )}
          <button onClick={() => navigate(homePath)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><HomeIcon size={16} /><span>Dashboard</span></button>
          <button onClick={() => navigate(rentalPath)} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><Package size={16} /><span>RentalShop</span></button>
          {!isGuest && (
            <>
              <button onClick={() => navigate('/customer/wishlist')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><Heart size={16} /><span>Wishlist</span></button>
              <button onClick={() => navigate('/customer/orders')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2" title="Orders"><ShoppingCart size={16} /></button>
            </>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/contact')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><Phone size={16} /><span>Contact Us</span></button>
          {!isGuest && <NotificationBell />}
          <button onClick={toggle} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50" title="Toggle theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          {!isGuest ? (
            <>
              <button onClick={() => navigate('/customer/profile')} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100">
                  {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-emerald-500 text-xs">{user?.name?.[0] ?? 'U'}</div>}
                </div>
                <span className="hidden sm:inline text-sm text-emerald-700">{user?.name}</span>
              </button>
              <button onClick={handleLogout} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50" title="Logout"><LogOut size={18} /></button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Login</button>
              <button onClick={() => navigate('/signup')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Signup</button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden h-16 flex items-center justify-between px-4">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center space-x-2">
          {!isGuest && <NotificationBell />}
          <button onClick={toggle} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-zinc-800 shadow-lg">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-600">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100">
                  {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-emerald-500 text-sm">{user?.name?.[0] ?? 'U'}</div>}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{user?.name || 'Guest'}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{user?.role || 'Guest'}</p>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              <button onClick={() => { navigate(homePath); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><HomeIcon size={16} /><span>Dashboard</span></button>
              <button onClick={() => { navigate(rentalPath); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><Package size={16} /><span>RentalShop</span></button>
              {!isGuest && (
                <>
                  <button onClick={() => { navigate('/customer/wishlist'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><Heart size={16} /><span>Wishlist</span></button>
                  <button onClick={() => { navigate('/customer/orders'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><ShoppingCart size={16} /><span>Orders</span></button>
                </>
              )}
              <button onClick={() => { navigate('/contact'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><Phone size={16} /><span>Contact Us</span></button>
              {!isGuest ? (
                <>
                  <button onClick={() => { navigate('/customer/profile'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Profile</button>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><LogOut size={16} /><span>Logout</span></button>
                </>
              ) : (
                <>
                  <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Login</button>
                  <button onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Signup</button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );

  const AdminNav = () => (
    <>
      {/* Desktop Navigation */}
      <div className="hidden sm:flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate('/admin/dashboard')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><LayoutGrid size={16} /><span>Dashboard</span></button>
          <button onClick={() => navigate('/admin/rental')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Rental</button>
          <button onClick={() => navigate('/admin/orders')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Order</button>
          <button onClick={() => navigate('/admin/products')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Products</button>
          <button onClick={() => navigate('/admin/reports')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Reporting</button>
          <button onClick={() => navigate('/admin/settings')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Settings</button>
        </div>
        <div className="flex items-center space-x-3">
          <NotificationBell />
          <button onClick={toggle} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50" title="Toggle theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button onClick={() => navigate('/customer/profile')} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100">
              {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-emerald-500 text-xs">{user?.name?.[0] ?? 'U'}</div>}
            </div>
            <span className="hidden sm:inline text-sm text-emerald-700">{user?.name}</span>
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50" title="Logout"><LogOut size={18} /></button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden h-16 flex items-center justify-between px-4">
        <button onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50">
          {isAdminMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center space-x-2">
          <NotificationBell />
          <button onClick={toggle} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Admin Menu Overlay */}
      {isAdminMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsAdminMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-zinc-800 shadow-lg">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-600">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100">
                  {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-emerald-500 text-sm">{user?.name?.[0] ?? 'U'}</div>}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Admin</p>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              <button onClick={() => { navigate('/admin/dashboard'); setIsAdminMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><LayoutGrid size={16} /><span>Dashboard</span></button>
              <button onClick={() => { navigate('/admin/rental'); setIsAdminMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Rental</button>
              <button onClick={() => { navigate('/admin/orders'); setIsAdminMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Order</button>
              <button onClick={() => { navigate('/admin/products'); setIsAdminMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Products</button>
              <button onClick={() => { navigate('/admin/reports'); setIsAdminMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Reporting</button>
              <button onClick={() => { navigate('/admin/settings'); setIsAdminMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Settings</button>
              <button onClick={() => { navigate('/customer/profile'); setIsAdminMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700">Profile</button>
              <button onClick={() => { handleLogout(); setIsAdminMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2"><LogOut size={16} /><span>Logout</span></button>
            </nav>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-zinc-200 dark:border-zinc-600 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {user?.role === 'admin' ? <AdminNav /> : <CustomerNav />}
        </div>
      </nav>

      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 sm:mb-6">{title}</h1>
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Layout;