import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import Layout from '../../components/Layout';
import { Star, FileText, ShoppingCart, Heart } from 'lucide-react';

const PRODUCTS = [
  { id: 'p1', name: 'MacBook Pro 16"', category: 'electronics', price: 500, priceUnit: 'day', image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400', rating: 4.8, reviews: 24, availability: 'Available', location: 'Mumbai', createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString(), description: 'Latest MacBook Pro with M2 chip, perfect for professional work' },
  { id: 'p2', name: 'Canon EOS R5', category: 'electronics', price: 800, priceUnit: 'day', image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.9, reviews: 32, availability: 'Available', location: 'Delhi', createdAt: new Date(Date.now() - 10*24*60*60*1000).toISOString(), description: 'Professional mirrorless camera with 45MP sensor' },
  { id: 'p3', name: 'Gaming Chair Pro', category: 'furniture', price: 200, priceUnit: 'day', image: 'https://images.pexels.com/photos/4050320/pexels-photo-4050320.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.6, reviews: 18, availability: 'Rented', location: 'Bangalore', createdAt: new Date(Date.now() - 20*24*60*60*1000).toISOString(), description: 'Ergonomic gaming chair with lumbar support' },
  { id: 'p4', name: 'Mountain Bike', category: 'sports', price: 300, priceUnit: 'day', image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.7, reviews: 15, availability: 'Available', location: 'Pune', createdAt: new Date(Date.now() - 35*24*60*60*1000).toISOString(), description: 'Professional mountain bike for outdoor adventures' },
];

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isGuest = !user;

  const handleProductClick = (productId: string) => navigate(`/customer/product/${productId}`);
  const onBook = (productId: string, availability: string) => {
    if (availability !== 'Available') return;
    if (isGuest) {
      alert('Please log in to rent this item.');
      navigate('/login');
      return;
    }
    navigate(`/customer/product/${productId}`);
  };
  const topProducts = [...PRODUCTS].sort((a,b)=>b.rating - a.rating).slice(0,3);
  const recentProducts = [...PRODUCTS].sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,3);

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">

        {/* Quick Access */}
        {!isGuest && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/customer/orders')}
                className="flex items-center space-x-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
                <div className="text-left">
                  <div className="font-medium text-zinc-900 dark:text-white">My Orders</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">View rental orders</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/customer/invoices')}
                className="flex items-center space-x-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <FileText className="h-6 w-6 text-emerald-600" />
                <div className="text-left">
                  <div className="font-medium text-zinc-900 dark:text-white">My Invoices</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">View payment details</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/customer/wishlist')}
                className="flex items-center space-x-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <Heart className="h-6 w-6 text-emerald-600" />
                <div className="text-left">
                  <div className="font-medium text-zinc-900 dark:text-white">Wishlist</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">Saved items</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Top Products */}
        <div>
          <h2 className="text-xl font-semibold text-indigo-900 mb-3">Top Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProducts.map(product => (
              <div key={product.id} onClick={() => product.availability==='Available' && handleProductClick(product.id)} className={`bg-white dark:bg-black rounded-xl border border-indigo-100 dark:border-gray-800 overflow-hidden transition-all duration-200 ${product.availability==='Available' ? 'hover:shadow-md cursor-pointer' : 'opacity-60 grayscale cursor-not-allowed'}` }>
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${product.availability==='Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{product.availability==='Available' ? 'Available' : 'Not Available'}</div>
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/80 rounded-full px-2 py-1 text-sm font-medium text-indigo-900 dark:text-white">₹{product.price}/{product.priceUnit}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-white mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1"><Star className="text-yellow-400" size={16} fill="currentColor" /><span className="text-sm text-indigo-900 dark:text-gray-200">{product.rating}</span></div>
                    <button className={`px-3 py-2 rounded-lg ${product.availability==='Available' ? 'bg-indigo-600 text-white' : 'btn-disabled'}`} onClick={(e) => { e.stopPropagation(); onBook(product.id, product.availability); }}>Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Added */}
        <div>
          <h2 className="text-xl font-semibold text-indigo-900 mt-6 mb-3">Recently Added</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProducts.map(product => (
              <div key={product.id} onClick={() => product.availability==='Available' && handleProductClick(product.id)} className={`bg-white dark:bg-black rounded-xl border border-indigo-100 dark:border-gray-800 overflow-hidden transition-all duration-200 ${product.availability==='Available' ? 'hover:shadow-md cursor-pointer' : 'opacity-60 grayscale cursor-not-allowed'}` }>
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${product.availability==='Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{product.availability==='Available' ? 'Available' : 'Not Available'}</div>
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/80 rounded-full px-2 py-1 text-sm font-medium text-indigo-900 dark:text-white">₹{product.price}/{product.priceUnit}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-white mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1"><Star className="text-yellow-400" size={16} fill="currentColor" /><span className="text-sm text-indigo-900 dark:text-gray-200">{product.rating}</span></div>
                    <button className={`px-3 py-2 rounded-lg ${product.availability==='Available' ? 'bg-indigo-600 text-white' : 'btn-disabled'}`} onClick={(e) => { e.stopPropagation(); onBook(product.id, product.availability); }}>Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;