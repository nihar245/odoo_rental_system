import React, { useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { Search, Filter, List, Grid3X3, Star, Heart } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const PRODUCTS = [
  { id: 'p1', name: 'MacBook Pro 16"', category: 'electronics', price: 500, priceUnit: 'day', image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400', rating: 4.8, reviews: 24, availability: 'Available', createdAt: Date.now() - 2*86400000 },
  { id: 'p2', name: 'Canon EOS R5', category: 'electronics', price: 800, priceUnit: 'day', image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.9, reviews: 32, availability: 'Available', createdAt: Date.now() - 10*86400000 },
  { id: 'p3', name: 'Gaming Chair Pro', category: 'furniture', price: 200, priceUnit: 'day', image: 'https://images.pexels.com/photos/4050320/pexels-photo-4050320.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.6, reviews: 18, availability: 'Rented', createdAt: Date.now() - 20*86400000 },
  { id: 'p4', name: 'Mountain Bike', category: 'sports', price: 300, priceUnit: 'day', image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400', rating: 4.7, reviews: 15, availability: 'Available', createdAt: Date.now() - 35*86400000 },
];

type ViewMode = 'grid' | 'list';

const RentalShop: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [dateFilter, setDateFilter] = useState<'all' | 'lastWeek' | 'lastMonth'>('all');
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'vehicles', name: 'Vehicles' },
    { id: 'tools', name: 'Tools' },
    { id: 'sports', name: 'Sports Equipment' }
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesPrice = priceRange === 'all' || (priceRange === 'low' && p.price <= 200) || (priceRange === 'medium' && p.price > 200 && p.price <= 500) || (priceRange === 'high' && p.price > 500);
      const now = Date.now();
      const withinDate = dateFilter === 'all' || (dateFilter === 'lastWeek' && p.createdAt >= now - 7*86400000) || (dateFilter === 'lastMonth' && p.createdAt >= now - 30*86400000);
      return matchesSearch && matchesCategory && matchesPrice && withinDate;
    });
  }, [searchTerm, selectedCategory, priceRange]);

  const wishlist = user?.wishlist ?? [];
  const isInWishlist = (id: string) => wishlist.includes(id);
  const toggleWishlist = (id: string) => {
    const next = isInWishlist(id) ? wishlist.filter(pid => pid !== id) : [...wishlist, id];
    updateUser({ wishlist: next });
  };

  const isGuest = !user;

  const onRentClick = (id: string) => {
    if (isGuest) {
      alert('Please log in to rent this item.');
      navigate('/login');
      return;
    }
    navigate(`/customer/product/${id}`);
  };

  const ProductCard = ({ p }: { p: typeof PRODUCTS[number] }) => (
    <div className={`bg-white dark:bg-black rounded-xl border border-indigo-100 dark:border-gray-800 overflow-hidden transition-all duration-200 ${p.availability==='Available' ? 'hover:shadow-md' : 'opacity-60 grayscale'}`}>
      <div className="relative">
        <img src={p.image} alt={p.name} className="w-full h-48 object-cover" />
        <button onClick={() => toggleWishlist(p.id)} className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/70">
          {isInWishlist(p.id) ? <Heart className="text-rose-500" size={18} fill="#ef4444" /> : <Heart className="text-gray-700 dark:text-gray-200" size={18} />}
        </button>
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${p.availability==='Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{p.availability==='Available' ? 'Available' : 'Not Available'}</div>
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/70 rounded-full px-2 py-1 text-sm font-medium text-indigo-900 dark:text-white">₹{p.price}/{p.priceUnit}</div>
      </div>
      <div className="p-4">
        <h3 className="text-indigo-900 dark:text-white font-semibold mb-1">{p.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm"><Star className="text-yellow-400" size={16} fill="currentColor" /><span className="text-indigo-900 dark:text-gray-200">{p.rating}</span></div>
          <button onClick={() => onRentClick(p.id)} disabled={p.availability!=='Available'} className={`px-3 py-1.5 rounded-lg text-sm ${p.availability==='Available' ? 'bg-indigo-600 text-white' : 'btn-disabled'}`}>Rent</button>
        </div>
      </div>
    </div>
  );

  const ProductRow = ({ p }: { p: typeof PRODUCTS[number] }) => (
    <div className={`flex items-center gap-4 bg-white dark:bg-black border border-indigo-100 dark:border-gray-800 rounded-xl p-3 ${p.availability!=='Available' ? 'opacity-60 grayscale' : ''}`}>
      <img src={p.image} alt={p.name} className="w-20 h-20 rounded-lg object-cover" />
      <div className="flex-1">
        <h3 className="text-indigo-900 dark:text-white font-semibold">{p.name}</h3>
        <div className="text-sm text-indigo-700/80 dark:text-gray-300">₹{p.price}/{p.priceUnit}</div>
      </div>
      <button onClick={() => toggleWishlist(p.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
        {isInWishlist(p.id) ? <Heart className="text-rose-500" size={18} fill="#ef4444" /> : <Heart className="text-gray-700 dark:text-gray-200" size={18} />}
      </button>
      <button onClick={() => onRentClick(p.id)} disabled={p.availability!=='Available'} className={`btn-primary ${p.availability!=='Available' ? 'btn-disabled' : ''}`}>Rent</button>
    </div>
  );

  return (
    <Layout title="Rental Shop">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={20} />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="px-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <option value="all">All Prices</option>
              <option value="low">Under ₹200</option>
              <option value="medium">₹200 - ₹500</option>
              <option value="high">Over ₹500</option>
            </select>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)} className="px-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <option value="all">All Time</option>
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
            </select>
            <div className="flex items-center gap-2">
              <button onClick={() => setView('list')} className={`px-3 py-2 rounded-lg border ${view==='list' ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-indigo-200 dark:border-gray-600'}`} title="List View"><List size={18} /></button>
              <button onClick={() => setView('grid')} className={`px-3 py-2 rounded-lg border ${view==='grid' ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-indigo-200 dark:border-gray-600'}`} title="Icon View"><Grid3X3 size={18} /></button>
            </div>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(p => (<ProductCard key={p.id} p={p} />))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map(p => (<ProductRow key={p.id} p={p} />))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RentalShop;


