import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Search, Filter, List, Grid3X3, Star, Heart, Clock, Calendar } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

type Product = {
  _id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  quantity: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  yearlyRate: number;
  hourlyRate: number;
  average_rating: number;
  createdAt: string;
};

type ViewMode = 'grid' | 'list';
type SortBy = 'createdAt' | 'price' | 'category';
type SortOrder = 'asc' | 'desc';

const RentalShop: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showUnavailable, setShowUnavailable] = useState(true);
  const [view, setView] = useState<ViewMode>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<Set<string>>(new Set());
  const { user } = useUser();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'vehicles', name: 'Vehicles' },
    { id: 'tools', name: 'Tools' },
    { id: 'sports', name: 'Sports Equipment' }
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (!showUnavailable) params.append('available', 'true');

      const res = await fetch(`http://localhost:8000/api/v1/products?${params}`);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || 'Failed to fetch products');
      setProducts(payload?.data?.products || []);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      alert(error?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
      });
      
      if (res.ok) {
        const payload = await res.json();
        const wishlistIds = new Set(payload?.data?.wishlist?.map((item: any) => item._id) || []);
        setWishlistItems(wishlistIds);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, sortOrder, showUnavailable]);

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [products, searchTerm]);

  const isInWishlist = (productId: string) => wishlistItems.has(productId);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      alert('Please log in to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      setWishlistLoading(prev => new Set(prev).add(productId));
      
      if (isInWishlist(productId)) {
        // Remove from wishlist
        const res = await fetch(`http://localhost:8000/api/v1/wishlist/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          credentials: 'include',
        });
        
        if (res.ok) {
          setWishlistItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      } else {
        // Add to wishlist
        const res = await fetch(`http://localhost:8000/api/v1/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          credentials: 'include',
          body: JSON.stringify({ product_id: productId }),
        });
        
        if (res.ok) {
          setWishlistItems(prev => new Set(prev).add(productId));
        }
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    } finally {
      setWishlistLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-700';
      case 'Not Available': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ProductCard = ({ p }: { p: Product }) => {
    const availability = p.quantity > 0 ? 'Available' : 'Not Available';
    const isAvailable = p.quantity > 0;
    const isLoading = wishlistLoading.has(p._id);
    
    return (
      <div className={`bg-white dark:bg-black rounded-xl border border-indigo-100 dark:border-gray-800 overflow-hidden transition-all duration-200 ${isAvailable ? 'hover:shadow-md' : 'opacity-60 grayscale'}`}>
        <div className="relative">
          <img src={p.image_url || 'https://via.placeholder.com/400x300?text=No+Image'} alt={p.name} className="w-full h-48 object-cover" />
          <button 
            onClick={() => toggleWishlist(p._id)} 
            disabled={isLoading}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/70 disabled:opacity-50"
          >
            {isInWishlist(p._id) ? <Heart className="text-rose-500" size={18} fill="#ef4444" /> : <Heart className="text-gray-700 dark:text-gray-200" size={18} />}
          </button>
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(availability)}`}>
            {availability}
          </div>
          <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/70 rounded-full px-2 py-1 text-sm font-medium text-indigo-900 dark:text-white">
            ₹{p.dailyRate}/day
          </div>
          <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-900/70 rounded-full px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
            Stock: {p.quantity}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-indigo-900 dark:text-white font-semibold mb-1">{p.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{p.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm">
              <Star className="text-yellow-400" size={16} fill="currentColor" />
              <span className="text-indigo-900 dark:text-gray-200">{p.average_rating || 0}</span>
            </div>
            <button 
              onClick={() => onRentClick(p._id)} 
              disabled={!isAvailable} 
              className={`px-3 py-1.5 rounded-lg text-sm ${isAvailable ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {isAvailable ? 'Rent' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ProductRow = ({ p }: { p: Product }) => {
    const availability = p.quantity > 0 ? 'Available' : 'Not Available';
    const isAvailable = p.quantity > 0;
    const isLoading = wishlistLoading.has(p._id);
    
    return (
      <div className={`flex items-center gap-4 bg-white dark:bg-black border border-indigo-100 dark:border-gray-800 rounded-xl p-3 ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
        <img src={p.image_url || 'https://via.placeholder.com/80x80?text=No+Image'} alt={p.name} className="w-20 h-20 rounded-lg object-cover" />
        <div className="flex-1">
          <h3 className="text-indigo-900 dark:text-white font-semibold">{p.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{p.description}</p>
          <div className="flex items-center space-x-4 text-sm text-indigo-700/80 dark:text-gray-300">
            <span>₹{p.dailyRate}/day</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(availability)}`}>
              {availability}
            </span>
            <span>Stock: {p.quantity}</span>
          </div>
        </div>
        <button 
          onClick={() => toggleWishlist(p._id)} 
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          {isInWishlist(p._id) ? <Heart className="text-rose-500" size={18} fill="#ef4444" /> : <Heart className="text-gray-700 dark:text-gray-200" size={18} />}
        </button>
        <button 
          onClick={() => onRentClick(p._id)} 
          disabled={!isAvailable} 
          className={`px-4 py-2 rounded-lg text-sm ${isAvailable ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          {isAvailable ? 'Rent' : 'Unavailable'}
        </button>
      </div>
    );
  };

  return (
    <Layout title="Rental Shop">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={20} />
              <input 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)} 
              className="px-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortBy)} 
              className="px-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="createdAt">Date Added</option>
              <option value="price">Price</option>
              <option value="category">Category</option>
            </select>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as SortOrder)} 
              className="px-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            <label className="flex items-center space-x-2 px-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
              <input 
                type="checkbox" 
                checked={showUnavailable} 
                onChange={(e) => setShowUnavailable(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Unavailable</span>
            </label>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setView('list')} 
                className={`px-3 py-2 rounded-lg border ${view==='list' ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-indigo-200 dark:border-gray-600'}`} 
                title="List View"
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setView('grid')} 
                className={`px-3 py-2 rounded-lg border ${view==='grid' ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-indigo-200 dark:border-gray-600'}`} 
                title="Grid View"
              >
                <Grid3X3 size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No products found</p>
          </div>
        ) : (
          <>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(p => (<ProductCard key={p._id} p={p} />))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map(p => (<ProductRow key={p._id} p={p} />))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default RentalShop;


