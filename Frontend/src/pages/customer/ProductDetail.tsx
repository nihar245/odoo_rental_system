import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ArrowLeft, Star, MapPin, CreditCard, AlertCircle, Heart } from 'lucide-react';
import { useUser } from '../../context/UserContext';

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

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Period selection removed; pricing will be computed automatically
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/v1/products/${id}`);
        const payload = await res.json();
        
        if (!res.ok) {
          throw new Error(payload?.message || 'Failed to fetch product');
        }
        
        setProduct(payload?.data?.product);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !id) return;
      
      try {
        setWishlistLoading(true);
        const res = await fetch(`http://localhost:8000/api/v1/wishlist/check/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          credentials: 'include',
        });
        
        if (res.ok) {
          const payload = await res.json();
          setIsInWishlist(payload?.data?.isInWishlist || false);
        }
      } catch (err) {
        console.error('Failed to check wishlist status:', err);
      } finally {
        setWishlistLoading(false);
      }
    };

    checkWishlistStatus();
  }, [user, id]);

  // Auto-fill address when user data is available
  useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user?.address]);

  const toggleWishlist = async () => {
    if (!user || !product) return;
    
    try {
      setWishlistLoading(true);
      
      if (isInWishlist) {
        // Remove from wishlist
        const res = await fetch(`http://localhost:8000/api/v1/wishlist/remove/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          credentials: 'include',
        });
        
        if (res.ok) {
          setIsInWishlist(false);
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
          body: JSON.stringify({ product_id: product._id }),
        });
        
        if (res.ok) {
          setIsInWishlist(true);
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const parseDT = (date: string, time: string) => (date ? new Date(`${date}T${time}:00`) : null);

  const diff = useMemo(() => {
    const s = parseDT(startDate, startTime);
    const e = parseDT(endDate, endTime);
    if (!s || !e) return { valid: false, hours: 0, days: 0 } as any;
    const ms = e.getTime() - s.getTime();
    if (ms < 0) return { valid: false, hours: -1, days: -1 } as any;
    const hours = Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
    const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    return { valid: true, hours, days, sameDay: s.toDateString() === e.toDateString() } as any;
  }, [startDate, endDate, startTime, endTime]);

  const computeTotal = () => {
    if (!product || !diff.valid) return 0;
    // Auto pricing: same day -> hourly, multi-day -> daily
    let unitPrice = product.dailyRate || 0;
    let units = diff.days;
    if (diff.sameDay) {
      unitPrice = product.hourlyRate || 0;
      units = diff.hours;
    }
    return unitPrice * units * quantity;
  };

  const handleBooking = () => {
    setFormError(null);
    if (!user) { navigate('/login'); return; }
    if (!product) { setFormError('Product not available.'); return; }
    if (!startDate || !endDate) { setFormError('Please select both start and end dates.'); return; }
    if (!diff.valid) { setFormError('The start date cannot be after the end date.'); return; }
    if (!address.trim()) { setFormError('Please enter a delivery address before booking.'); return; }

    const orderNumber = `R${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-3)}`;
    const order = {
      id: orderNumber,
      product: { id: product._id, name: product.name, image: product.image_url },
      period: 'auto',
      quantity,
      startDate,
      endDate,
      startTime,
      endTime,
      unitPrices: {
        hourly: product.hourlyRate || 0,
        daily: product.dailyRate || 0,
        weekly: product.weeklyRate || 0,
        monthly: product.monthlyRate || 0,
      },
      amount: computeTotal(),
      address,
      // order lifecycle for customer
      status: 'Placed',
      // admin review field, to be updated by backend/admin later
      reviewStatus: 'Pending', // 'Confirmed' | 'Declined'
      // admin stage to separate incoming vs rental lists
      adminStage: 'incoming', // 'incoming' | 'rental'
      customer: { name: user?.name ?? 'Customer', email: user?.email ?? 'customer@example.com', avatarUrl: user?.avatarUrl },
      createdAt: new Date().toISOString(),
    } as any;
    try { const existing = JSON.parse(localStorage.getItem('rental_orders') || '[]'); existing.unshift(order); localStorage.setItem('rental_orders', JSON.stringify(existing)); } catch {}
    alert(`Booking successful! Order #${orderNumber}`);
    navigate(`/customer/payment/${orderNumber}`);
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout title="Product Not Found">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">{error || 'Product not found'}</p>
          <button onClick={() => navigate('/customer/rental-shop')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Back to Shop
          </button>
        </div>
      </Layout>
    );
  }

  const isAvailable = product.quantity > 0;

  return (
    <Layout title="Product Details">
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-indigo-700 hover:underline">
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-white dark:bg-black border border-indigo-100 dark:border-gray-800 shadow-sm">
              <img 
                src={product.image_url || 'https://via.placeholder.com/800x600?text=No+Image'} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-indigo-900 mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400" size={20} fill="currentColor" />
                      <span className="text-indigo-900 font-medium">{product.average_rating || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="text-indigo-500" size={16} />
                      <span className="text-indigo-700/80">{product.category}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={toggleWishlist} 
                  disabled={wishlistLoading}
                  className="p-2 rounded-full border border-indigo-200 hover:border-indigo-400 text-rose-500 disabled:opacity-50" 
                  title="Toggle wishlist"
                >
                  {isInWishlist ? <Heart size={20} fill="#ef4444" /> : <Heart size={20} />}
                </button>
              </div>
              <p className="text-indigo-800/80 mb-6">{product.description}</p>
            </div>

            <div className="bg-white dark:bg-black rounded-xl border border-indigo-100 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-white mb-4">Book This Item</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border border-indigo-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Hourly Rate</div>
                    <div className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">₹{product.hourlyRate || 0}/hr</div>
                  </div>
                  <div className="p-3 rounded-lg border border-indigo-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Daily Rate</div>
                    <div className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">₹{product.dailyRate || 0}/day</div>
                  </div>
                </div>
                <div className="text-sm text-indigo-900/80 dark:text-gray-300">
                  Pricing is calculated automatically: hourly for same-day rentals, daily for multi-day rentals.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-indigo-900/90 dark:text-gray-200 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                    />
                  </div>
                  <div>
                    <label className="block text-indigo-900/90 dark:text-gray-200 mb-2">End Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                    />
                  </div>
                  {startDate && endDate && (
                    <>
                      <div>
                        <label className="block text-indigo-900/90 dark:text-gray-200 mb-2">Start Time</label>
                        <input 
                          type="time" 
                          value={startTime} 
                          onChange={(e) => setStartTime(e.target.value)} 
                          className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                        />
                      </div>
                      <div>
                        <label className="block text-indigo-900/90 dark:text-gray-200 mb-2">End Time</label>
                        <input 
                          type="time" 
                          value={endTime} 
                          onChange={(e) => setEndTime(e.target.value)} 
                          className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-indigo-900/90 dark:text-gray-200 mb-2">Delivery Address</label>
                  <textarea
                    className="w-full h-24 px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  {user?.address && (
                    <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
                      Default address loaded from your profile. You can modify it above.
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-indigo-900/90 dark:text-gray-200 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={product.quantity}
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1)))} 
                    className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                  />
                  <div className="text-sm text-gray-500 mt-1">Available: {product.quantity} units</div>
                </div>

                {formError && (
                  <div className="flex items-start space-x-2 text-rose-700 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                    <AlertCircle size={18} className="mt-0.5" />
                    <span className="text-sm dark:text-rose-300">{formError}</span>
                  </div>
                )}

                <div className="border-t border-indigo-100 dark:border-gray-800 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-indigo-900/90 dark:text-gray-200">Calculated Amount:</span>
                    <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">₹{computeTotal().toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={handleBooking} 
                    disabled={!isAvailable}
                    className={`w-full px-4 py-3 rounded-lg text-base font-medium flex items-center justify-center space-x-2 ${
                      isAvailable 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CreditCard size={20} />
                    <span>{isAvailable ? 'Confirm Booking' : 'Not Available'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
