import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar,
  User,
  Phone,
  Mail,
  Download
} from 'lucide-react';

interface Reservation {
  _id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_name: string;
  quantity: number;
  status: 'reserved' | 'picked_up' | 'delivered' | 'returned' | 'cancelled';
  rental_period: {
    start_date: string;
    end_date: string;
    duration_value: number;
    duration_type: string;
  };
  total_amount: number;
  pickup_address: string;
  delivery_address: string;
  scheduled_pickup_date: string;
  scheduled_delivery_date: string;
  actual_pickup_date?: string;
  actual_delivery_date?: string;
  actual_return_date?: string;
  pickup_team_member?: string;
  return_team_member?: string;
  pickup_notes?: string;
  delivery_notes?: string;
  return_notes?: string;
  createdAt: string;
}

const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    try {
      const response = await fetch('/api/v1/reservations/user', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(data.data.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reserved': return <Package className="w-5 h-5" />;
      case 'picked_up': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'returned': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <Clock className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'reserved': return 'Your items are reserved and pickup is scheduled';
      case 'picked_up': return 'Your items have been picked up and are on their way';
      case 'delivered': return 'Your items have been delivered to your address';
      case 'returned': return 'Your rental has been completed and items returned';
      case 'cancelled': return 'This reservation has been cancelled';
      default: return 'Status unknown';
    }
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { name: 'Reserved', completed: ['reserved', 'picked_up', 'delivered', 'returned'].includes(status) },
      { name: 'Picked Up', completed: ['picked_up', 'delivered', 'returned'].includes(status) },
      { name: 'Delivered', completed: ['delivered', 'returned'].includes(status) },
      { name: 'Returned', completed: ['returned'].includes(status) }
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            My Reservations
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Track the status of your rental reservations and deliveries
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              No reservations found
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              You haven't made any reservations yet. Start by browsing our products!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                      {reservation.product_name}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Quantity: {reservation.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                      {reservation.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg mt-1">
                      ${reservation.total_amount}
                    </p>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-zinc-900 dark:text-white">Rental Progress</h4>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {getStatusDescription(reservation.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getProgressSteps(reservation.status).map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          step.completed 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <span className={`ml-2 text-sm ${
                          step.completed 
                            ? 'text-emerald-600 dark:text-emerald-400 font-medium' 
                            : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {step.name}
                        </span>
                        {index < getProgressSteps(reservation.status).length - 1 && (
                          <div className={`w-12 h-0.5 ml-2 ${
                            step.completed ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-zinc-900 dark:text-white flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Customer Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Name:</span> {reservation.customer_name}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Email:</span> {reservation.customer_email}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Phone:</span> {reservation.customer_phone}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-zinc-900 dark:text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Rental Period
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Start:</span> {new Date(reservation.rental_period.start_date).toLocaleDateString()}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">End:</span> {new Date(reservation.rental_period.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Duration:</span> {reservation.rental_period.duration_value} {reservation.rental_period.duration_type}(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-zinc-900 dark:text-white flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Pickup Address
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                      {reservation.pickup_address}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs">
                      Scheduled: {new Date(reservation.scheduled_pickup_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-zinc-900 dark:text-white flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Delivery Address
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                      {reservation.delivery_address}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs">
                      Scheduled: {new Date(reservation.scheduled_delivery_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  
                  {reservation.status === 'reserved' && (
                    <button
                      onClick={() => {
                        // Generate pickup document for customer reference
                        const content = `
Pickup Information for ${reservation.product_name}

Customer: ${reservation.customer_name}
Product: ${reservation.product_name}
Quantity: ${reservation.quantity}
Pickup Address: ${reservation.pickup_address}
Scheduled Date: ${new Date(reservation.scheduled_pickup_date).toLocaleDateString()}
Total Amount: $${reservation.total_amount}

Please have your ID ready for verification.
                        `;
                        
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `pickup-info-${reservation.product_name}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Pickup Info
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Details Modal */}
        {showModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Reservation Details
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">Product Information</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{selectedReservation.product_name}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Quantity: {selectedReservation.quantity}</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">${selectedReservation.total_amount}</p>
                </div>

                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">Rental Period</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {new Date(selectedReservation.rental_period.start_date).toLocaleDateString()} - {new Date(selectedReservation.rental_period.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Duration: {selectedReservation.rental_period.duration_value} {selectedReservation.rental_period.duration_type}(s)
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">Addresses</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">Pickup: {selectedReservation.pickup_address}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Delivery: {selectedReservation.delivery_address}</p>
                </div>

                {selectedReservation.pickup_notes && (
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">Pickup Notes</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">{selectedReservation.pickup_notes}</p>
                  </div>
                )}

                {selectedReservation.delivery_notes && (
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">Delivery Notes</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">{selectedReservation.delivery_notes}</p>
                  </div>
                )}

                {selectedReservation.return_notes && (
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">Return Notes</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">{selectedReservation.return_notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
