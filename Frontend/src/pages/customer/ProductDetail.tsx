import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ArrowLeft, Star, MapPin, CreditCard, AlertCircle, Heart } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const PRODUCT_MAP: Record<string, any> = {
  p1: { id: 'p1', name: 'MacBook Pro 16"', description: 'High-performance laptop perfect for professional work, video editing, and development. Includes charger and protective case.', images: ['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'], pricing: { hourly: 50, daily: 500, weekly: 3000, monthly: 12000 }, rating: 4.8, reviews: 24, location: 'Mumbai, Maharashtra' },
  p2: { id: 'p2', name: 'Canon EOS R5', description: 'Professional mirrorless camera with 45MP sensor.', images: ['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/51383/camera-lens-technology-reflection-51383.jpeg?auto=compress&cs=tinysrgb&w=800'], pricing: { hourly: 60, daily: 800, weekly: 4200, monthly: 15000 }, rating: 4.9, reviews: 32, location: 'Delhi, India' },
  p3: { id: 'p3', name: 'Gaming Chair Pro', description: 'Ergonomic gaming chair with lumbar support.', images: ['https://images.pexels.com/photos/4050320/pexels-photo-4050320.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/613832/pexels-photo-613832.jpeg?auto=compress&cs=tinysrgb&w=800'], pricing: { hourly: 10, daily: 200, weekly: 1000, monthly: 4000 }, rating: 4.6, reviews: 18, location: 'Bangalore, India' },
  p4: { id: 'p4', name: 'Mountain Bike', description: 'Professional mountain bike for outdoor adventures.', images: ['https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1797393/pexels-photo-1797393.jpeg?auto=compress&cs=tinysrgb&w=800'], pricing: { hourly: 20, daily: 300, weekly: 1500, monthly: 5000 }, rating: 4.7, reviews: 15, location: 'Pune, India' },
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCT_MAP[id || 'p1'] ?? PRODUCT_MAP['p1'];
  const navigate = useNavigate();
  const { user, updateUser } = useUser();

  // Period selection removed; pricing will be computed automatically
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [address, setAddress] = useState(user?.address?.line1 ?? '');
  const [error, setError] = useState<string | null>(null);
  const wishlist = user?.wishlist ?? [];
  const inWishlist = wishlist.includes(product.id);
  const toggleWishlist = () => {
    const next = inWishlist ? wishlist.filter((pid) => pid !== product.id) : [...wishlist, product.id];
    updateUser({ wishlist: next });
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
    if (!diff.valid) return 0;
    // Auto pricing: same day -> hourly, multi-day -> daily
    let unitPrice = product.pricing.daily;
    let units = diff.days;
    if (diff.sameDay) {
      unitPrice = product.pricing.hourly;
      units = diff.hours;
    }
    return unitPrice * units * quantity;
  };

  const handleBooking = () => {
    setError(null);
    if (!user) { navigate('/login'); return; }
    if (!startDate || !endDate) { setError('Please select both start and end dates.'); return; }
    if (!diff.valid) { setError('The start date cannot be after the end date.'); return; }
    if (!address.trim()) { setError('Please enter a delivery address before booking.'); return; }

    const orderNumber = `R${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-3)}`;
    const order = {
      id: orderNumber,
      product: { id: product.id, name: product.name, image: product.images[0] },
      period: 'auto',
      quantity,
      startDate,
      endDate,
      startTime,
      endTime,
      unitPrices: product.pricing,
      amount: computeTotal(),
      address,
      // order lifecycle for customer
      status: 'Placed',
      // admin review field, to be updated by backend/admin later
      reviewStatus: 'Pending', // 'Confirmed' | 'Declined'
      // admin stage to separate incoming vs rental lists
      adminStage: 'incoming', // 'incoming' | 'rental'
      customer: { name: user?.name ?? 'Customer', email: user?.email ?? 'customer@example.com', avatarUrl: user?.avatarUrl },
      // snapshot of profile address for reference
      addressFields: {
        line1: user?.address?.line1 ?? '',
        zip: user?.address?.zip ?? '',
        city: user?.address?.city ?? '',
        state: user?.address?.state ?? '',
        country: user?.address?.country ?? '',
      },
      createdAt: new Date().toISOString(),
    } as any;
    try { const existing = JSON.parse(localStorage.getItem('rental_orders') || '[]'); existing.unshift(order); localStorage.setItem('rental_orders', JSON.stringify(existing)); } catch {}
    alert(`Booking successful! Order #${orderNumber}`);
    navigate(`/customer/payment/${orderNumber}`);
  };

  return (
    <Layout title="Product Details">
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-indigo-700 hover:underline"><ArrowLeft size={20} /><span>Back to Products</span></button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-white dark:bg-black border border-indigo-100 dark:border-gray-800 shadow-sm">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((image: string, index: number) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-black border border-indigo-100 dark:border-gray-800 shadow-sm">
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-indigo-900 mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-4 mb-2"><div className="flex items-center space-x-1"><Star className="text-yellow-400" size={20} fill="currentColor" /><span className="text-indigo-900 font-medium">{product.rating}</span><span className="text-indigo-700/80">({product.reviews} reviews)</span></div><div className="flex items-center space-x-2"><MapPin className="text-indigo-500" size={16} /><span className="text-indigo-700/80">{product.location}</span></div></div>
                </div>
                <button onClick={toggleWishlist} className="p-2 rounded-full border border-indigo-200 hover:border-indigo-400 text-rose-500" title="Toggle wishlist">
                  {inWishlist ? <Heart size={20} fill="#ef4444" /> : <Heart size={20} />}
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
                    <div className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">₹{product.pricing.hourly}/hr</div>
                  </div>
                  <div className="p-3 rounded-lg border border-indigo-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Daily Rate</div>
                    <div className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">₹{product.pricing.daily}/day</div>
                  </div>
                </div>
                <div className="text-sm text-indigo-900/80 dark:text-gray-300">Pricing is calculated automatically: hourly for same-day rentals, daily for multi-day rentals.</div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-indigo-900/90 dark:text-gray-200 mb-2">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></div>
                  <div><label className="block text-indigo-900/90 dark:text-gray-200 mb-2">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></div>
                  {startDate && endDate && (<><div><label className="block text-indigo-900/90 dark:text-gray-200 mb-2">Start Time</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></div><div><label className="block text-indigo-900/90 dark:text-gray-200 mb-2">End Time</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></div></>)}
                </div>

                <div>
                  <label className="block text-indigo-900/90 dark:text-gray-200 mb-2">Delivery Address</label>
                  <textarea
                    className="w-full h-24 px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder={user?.address?.line1 ? `${user.address.line1}, ${user.address.city ?? ''} ${user.address.state ?? ''} ${user.address.zip ?? ''} ${user.address.country ?? ''}`.trim() : 'Enter delivery address'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div><label className="block text-indigo-900/90 dark:text-gray-200 mb-2">Quantity</label><input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 border border-indigo-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></div>

                {error && (<div className="flex items-start space-x-2 text-rose-700 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3"><AlertCircle size={18} className="mt-0.5" /><span className="text-sm dark:text-rose-300">{error}</span></div>)}

                <div className="border-t border-indigo-100 dark:border-gray-800 pt-4"><div className="flex justify-between items-center mb-4"><span className="text-indigo-900/90 dark:text-gray-200">Calculated Amount:</span><span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">₹{computeTotal().toLocaleString()}</span></div><button onClick={handleBooking} className="w-full px-4 py-3 rounded-lg bg-indigo-600 text-white text-base font-medium flex items-center justify-center space-x-2"><CreditCard size={20} /><span>Confirm Booking</span></button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
