import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { ShoppingCart, Trash2, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type WishlistProduct = {
  _id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  quantity: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  yearlyRate: number;
  hourlyRate: number;
  average_rating: number;
  addedAt: string;
};

const WishlistPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/v1/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
      });
      
      if (res.ok) {
        const payload = await res.json();
        setWishlist(payload?.data?.wishlist || []);
      } else {
        console.error('Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const removeItem = async (productId: string) => {
    try {
      setRemovingItems(prev => new Set(prev).add(productId));
      
      const res = await fetch(`http://localhost:8000/api/v1/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
      });
      
      if (res.ok) {
        setWishlist(prev => prev.filter(item => item._id !== productId));
      } else {
        console.error('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const goToProduct = (id: string) => {
    navigate(`/customer/product/${id}`);
  };

  if (!user) {
    return (
      <Layout title="Wishlist">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view your wishlist.</p>
          <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Login
          </button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="Wishlist">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Wishlist">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-900 dark:text-white">My Wishlist</h1>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your wishlist is empty.</p>
            <button 
              onClick={() => navigate('/customer/rental-shop')} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => {
              const isAvailable = product.quantity > 0;
              const isRemoving = removingItems.has(product._id);
              
              return (
                <div key={product._id} className="bg-white dark:bg-black rounded-xl border border-indigo-100 dark:border-gray-800 overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="relative">
                    <img 
                      src={product.image_url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                      alt={product.name} 
                      className="w-full h-48 object-cover" 
                    />
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                      isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isAvailable ? 'Available' : 'Not Available'}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/70 rounded-full px-2 py-1 text-sm font-medium text-indigo-900 dark:text-white">
                      ₹{product.dailyRate}/day
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-indigo-900 dark:text-white font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="text-yellow-400" size={16} fill="currentColor" />
                        <span className="text-indigo-900 dark:text-gray-200">{product.average_rating || 0}</span>
                      </div>
                      <span className="text-xs text-gray-500">Stock: {product.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => goToProduct(product._id)} 
                        disabled={!isAvailable}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center space-x-1 ${
                          isAvailable 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart size={16} />
                        <span>{isAvailable ? 'Rent' : 'Unavailable'}</span>
                      </button>
                      <button 
                        onClick={() => removeItem(product._id)} 
                        disabled={isRemoving}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50" 
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;


