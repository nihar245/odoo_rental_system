import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Eye,
  Edit,
  User,
  MapPin,
  Phone,
  Mail
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

interface Delivery {
  _id: string;
  operation_type: 'pickup' | 'delivery' | 'return';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  actual_date?: string;
  team_member_name?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_urgent: boolean;
}

const ReservationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'reservations' | 'deliveries'>('reservations');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchReservations();
    fetchDeliveries();
  }, [filterStatus]);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`/api/v1/reservations?status=${filterStatus !== 'all' ? filterStatus : ''}`, {
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

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/v1/deliveries', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.data.deliveries || []);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const updateReservationStatus = async (reservationId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/v1/reservations/${reservationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, notes })
      });

      if (response.ok) {
        fetchReservations();
        setShowReservationModal(false);
        setSelectedReservation(null);
      }
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/v1/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, notes })
      });

      if (response.ok) {
        fetchDeliveries();
        setShowDeliveryModal(false);
        setSelectedDelivery(null);
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const generatePickupDocument = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/v1/reservations/${reservationId}/pickup-document`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        downloadDocument(data.data, 'pickup-document');
      }
    } catch (error) {
      console.error('Error generating pickup document:', error);
    }
  };

  const generateReturnDocument = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/v1/reservations/${reservationId}/return-document`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        downloadDocument(data.data, 'return-document');
      }
    } catch (error) {
      console.error('Error generating return document:', error);
    }
  };

  const generateDeliveryDocument = async (deliveryId: string) => {
    try {
      const response = await fetch(`/api/v1/deliveries/${deliveryId}/document`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        downloadDocument(data.data, 'delivery-document');
      }
    } catch (error) {
      console.error('Error generating delivery document:', error);
    }
  };

  const downloadDocument = (documentData: any, type: string) => {
    const content = `
${documentData.document_type}
Generated: ${new Date(documentData.generated_at).toLocaleString()}

Customer Details:
- Name: ${documentData.customer_details.name}
- Email: ${documentData.customer_details.email}
- Phone: ${documentData.customer_details.phone}

Product Details:
- Product: ${documentData.product_details.name}
- Quantity: ${documentData.product_details.quantity}

${type === 'pickup' ? 'Pickup' : 'Return'} Details:
- Address: ${type === 'pickup' ? documentData.pickup_details.address : documentData.return_details.address}
- Scheduled Date: ${new Date(type === 'pickup' ? documentData.pickup_details.scheduled_date : documentData.return_details.scheduled_date).toLocaleDateString()}
- Team Member: ${type === 'pickup' ? documentData.pickup_details.team_member : documentData.return_details.team_member}

Rental Period:
- Start: ${new Date(documentData.rental_period.start_date).toLocaleDateString()}
- End: ${new Date(documentData.rental_period.end_date).toLocaleDateString()}
- Duration: ${documentData.rental_period.duration_value} ${documentData.rental_period.duration_type}(s)

Total Amount: $${documentData.total_amount}

Instructions:
${documentData.instructions.map((instruction: string, index: number) => `${index + 1}. ${instruction}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${documentData.reservation_id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Reservation & Delivery Management
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage product reservations, pickup, delivery, and return operations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white dark:bg-zinc-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setSelectedTab('reservations')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              selectedTab === 'reservations'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Package className="inline w-4 h-4 mr-2" />
            Reservations
          </button>
          <button
            onClick={() => setSelectedTab('deliveries')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              selectedTab === 'deliveries'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Truck className="inline w-4 h-4 mr-2" />
            Deliveries
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="reserved">Reserved</option>
            <option value="picked_up">Picked Up</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Reservations Tab */}
        {selectedTab === 'reservations' && (
          <div className="grid gap-6">
            {reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {reservation.product_name}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Quantity: {reservation.quantity}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                    {reservation.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                      <User className="w-4 h-4 mr-2" />
                      {reservation.customer_name}
                    </div>
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                      <Mail className="w-4 h-4 mr-2" />
                      {reservation.customer_email}
                    </div>
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                      <Phone className="w-4 h-4 mr-2" />
                      {reservation.customer_phone}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(reservation.rental_period.start_date).toLocaleDateString()} - {new Date(reservation.rental_period.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {reservation.delivery_address}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ${reservation.total_amount}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setShowReservationModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button
                    onClick={() => generatePickupDocument(reservation._id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Pickup Doc
                  </button>
                  <button
                    onClick={() => generateReturnDocument(reservation._id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Return Doc
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Deliveries Tab */}
        {selectedTab === 'deliveries' && (
          <div className="grid gap-6">
            {deliveries.map((delivery) => (
              <div
                key={delivery._id}
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {delivery.operation_type.charAt(0).toUpperCase() + delivery.operation_type.slice(1)} Operation
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Scheduled: {new Date(delivery.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                      {delivery.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(delivery.priority)}`}>
                      {delivery.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDelivery(delivery);
                      setShowDeliveryModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button
                    onClick={() => generateDeliveryDocument(delivery._id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate Doc
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Details Modal */}
        {showReservationModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Reservation Details
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">Customer Information</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{selectedReservation.customer_name}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">{selectedReservation.customer_email}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">{selectedReservation.customer_phone}</p>
                </div>
                
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
                </div>

                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">Addresses</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">Pickup: {selectedReservation.pickup_address}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Delivery: {selectedReservation.delivery_address}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowReservationModal(false)}
                  className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                {selectedReservation.status === 'reserved' && (
                  <button
                    onClick={() => updateReservationStatus(selectedReservation._id, 'picked_up')}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    Mark as Picked Up
                  </button>
                )}
                {selectedReservation.status === 'picked_up' && (
                  <button
                    onClick={() => updateReservationStatus(selectedReservation._id, 'delivered')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
                {selectedReservation.status === 'delivered' && (
                  <button
                    onClick={() => updateReservationStatus(selectedReservation._id, 'returned')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Mark as Returned
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Details Modal */}
        {showDeliveryModal && selectedDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Delivery Details
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">Operation Type</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 capitalize">{selectedDelivery.operation_type}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">Status</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{selectedDelivery.status.replace('_', ' ')}</p>
                </div>

                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">Priority</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 capitalize">{selectedDelivery.priority}</p>
                </div>

                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">Scheduled Date</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {new Date(selectedDelivery.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                {selectedDelivery.status === 'scheduled' && (
                  <button
                    onClick={() => updateDeliveryStatus(selectedDelivery._id, 'in_progress')}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    Start Operation
                  </button>
                )}
                {selectedDelivery.status === 'in_progress' && (
                  <button
                    onClick={() => updateDeliveryStatus(selectedDelivery._id, 'completed')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Complete Operation
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManagement;
