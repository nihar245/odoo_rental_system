import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  Star, 
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  MessageCircle
} from 'lucide-react';

interface RentalCardData {
  id: string;
  product: { name: string; image: string; category?: string };
  startDate: string;
  endDate: string;
  duration: string;
  amount: string;
  status: 'Active' | 'Upcoming' | 'Completed' | 'Late' | 'Cancelled';
  pickupLocation: string;
  returnLocation: string;
  rating?: number | null;
  review?: string | null;
}

const MyRentals: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('current');
  const [rentals, setRentals] = useState<RentalCardData[]>([]);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      if (Array.isArray(list) && list.length) {
        const mapped: RentalCardData[] = list.map((o: any) => ({
          id: o.id,
          product: { name: o.product?.name ?? 'Product', image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400' },
          startDate: o.startDate,
          endDate: o.endDate,
          duration: `${o.durationDays} days`,
          amount: `₹${(o.amount || 0).toLocaleString()}`,
          status: (o.status || 'Active') as any,
          pickupLocation: 'Pickup Location',
          returnLocation: 'Return Location',
          rating: null,
          review: null,
        }));
        setRentals(mapped);
        return;
      }
    } catch {}

    // Fallback demo data
    setRentals([
      {
        id: 'R0001',
        product: { name: 'MacBook Pro 16"', image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400', category: 'Electronics' },
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        duration: '5 days',
        amount: '₹2,500',
        status: 'Active',
        pickupLocation: 'Mumbai Central',
        returnLocation: 'Mumbai Central',
        rating: 4.8,
        review: 'Excellent condition, perfect for my work needs.',
      },
    ]);
  }, []);

  const tabs = [
    { id: 'current', label: 'Current Rentals', count: rentals.filter((r) => r.status === 'Active').length },
    { id: 'upcoming', label: 'Upcoming', count: rentals.filter((r) => r.status === 'Upcoming').length },
    { id: 'completed', label: 'Completed', count: rentals.filter((r) => r.status === 'Completed').length },
    { id: 'all', label: 'All Rentals', count: rentals.length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'status-available';
      case 'Upcoming':
        return 'status-rented';
      case 'Completed':
        return 'status-returned';
      case 'Late':
        return 'status-late';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'status-returned';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Clock className="w-4 h-4" />;
      case 'Upcoming':
        return <Calendar className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Late':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredRentals = rentals.filter((rental) => {
    if (rental.status === 'Cancelled') return false; // hide cancelled everywhere
    if (activeTab === 'all') return true;
    if (activeTab === 'current') return rental.status === 'Active';
    if (activeTab === 'upcoming') return rental.status === 'Upcoming';
    if (activeTab === 'completed') return rental.status === 'Completed';
    return true;
  });

  const handleViewDetails = (rentalId: string) => navigate(`/customer/payment/${rentalId}`);
  const handleDownloadInvoice = (rentalId: string) => alert(`Downloading invoice for rental ${rentalId}...`);
  const handleContactSupport = (rentalId: string) => alert(`Opening support chat for rental ${rentalId}...`);

  return (
    <Layout title="My Rentals">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Rentals</h1>
            <p className="text-gray-600">Manage your rental history and current bookings</p>
          </div>
          <button onClick={() => navigate('/customer/dashboard')} className="btn-primary">Browse More Products</button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{tab.count}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRentals.map((rental) => (
            <div key={rental.id} className="card overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`status-badge ${getStatusColor(rental.status)} flex items-center space-x-1`}>
                      {getStatusIcon(rental.status)}
                      <span>{rental.status}</span>
                    </div>
                    <span className="text-sm text-gray-500">#{rental.id}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{rental.amount}</p>
                    <p className="text-sm text-gray-500">{rental.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <img src={rental.product.image} alt={rental.product.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{rental.product.name}</h3>
                    {rental.product.category && <p className="text-sm text-gray-600">{rental.product.category}</p>}
                    {rental.rating && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        <span className="text-sm text-gray-600">{rental.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Start Date</p>
                    <p className="text-sm text-gray-600">{rental.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">End Date</p>
                    <p className="text-sm text-gray-600">{rental.endDate}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Pickup</p>
                      <p className="text-sm text-gray-600">{rental.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Return</p>
                      <p className="text-sm text-gray-600">{rental.returnLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <button onClick={() => handleViewDetails(rental.id)} className={`flex-1 btn-secondary flex items-center justify-center space-x-2 ${rental.status==='Cancelled' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                  <button onClick={() => handleDownloadInvoice(rental.id)} className={`btn-secondary flex items-center space-x-2 ${rental.status==='Cancelled' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`} title="Download Invoice">
                    <Download size={16} />
                  </button>
                  <button onClick={() => handleContactSupport(rental.id)} className={`btn-secondary flex items-center space-x-2 ${rental.status==='Cancelled' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`} title="Contact Support">
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRentals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rentals found</h3>
            <p className="text-gray-600 mb-6">No rentals in this category.</p>
            <button onClick={() => navigate('/customer/dashboard')} className="btn-primary">Browse Products</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyRentals;