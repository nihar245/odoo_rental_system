import React, { useState } from 'react';
import { Calendar, Clock, Package, MapPin, MessageSquare, DollarSign } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface RentalRequestFormProps {
  product: {
    _id: string;
    name: string;
    dailyRate: number;
    hourlyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    yearlyRate: number;
    quantity: number;
  };
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

const RentalRequestForm: React.FC<RentalRequestFormProps> = ({ product, onClose, onSubmit }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    duration_type: 'day',
    duration_value: 1,
    quantity: 1,
    pickup_address: user?.address || '',
    delivery_address: user?.address || '',
    customer_notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (formData.quantity > product.quantity) {
      newErrors.quantity = `Quantity cannot exceed available stock (${product.quantity})`;
    }
    if (!formData.pickup_address.trim()) {
      newErrors.pickup_address = 'Pickup address is required';
    }
    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = 'Delivery address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let rate = 0;
    switch (formData.duration_type) {
      case 'hour':
        rate = product.hourlyRate;
        break;
      case 'day':
        rate = product.dailyRate;
        break;
      case 'week':
        rate = product.weeklyRate;
        break;
      case 'month':
        rate = product.monthlyRate;
        break;
      case 'year':
        rate = product.yearlyRate;
        break;
      default:
        rate = product.dailyRate;
    }

    return rate * formData.duration_value * formData.quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      const requestData = {
        product_id: product._id,
        quantity: formData.quantity,
        rental_period: {
          start_date: startDate,
          end_date: endDate,
          duration_type: formData.duration_type,
          duration_value: formData.duration_value
        },
        pickup_address: formData.pickup_address,
        delivery_address: formData.delivery_address,
        customer_notes: formData.customer_notes
      };

      await onSubmit(requestData);
      onClose();
    } catch (error) {
      console.error('Failed to submit rental request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const totalAmount = calculateTotalAmount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Request Rental: {product.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rental Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.end_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                )}
              </div>
            </div>

            {/* Duration Type and Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Duration Type
                </label>
                <select
                  value={formData.duration_type}
                  onChange={(e) => handleInputChange('duration_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Package className="inline w-4 h-4 mr-2" />
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Available: {product.quantity}
                </p>
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Pickup Address
                </label>
                <textarea
                  value={formData.pickup_address}
                  onChange={(e) => handleInputChange('pickup_address', e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.pickup_address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter pickup address"
                />
                {errors.pickup_address && (
                  <p className="text-red-500 text-sm mt-1">{errors.pickup_address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Delivery Address
                </label>
                <textarea
                  value={formData.delivery_address}
                  onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.delivery_address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter delivery address"
                />
                {errors.delivery_address && (
                  <p className="text-red-500 text-sm mt-1">{errors.delivery_address}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MessageSquare className="inline w-4 h-4 mr-2" />
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.customer_notes}
                onChange={(e) => handleInputChange('customer_notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Any special requirements or notes..."
              />
            </div>

            {/* Total Amount */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  <DollarSign className="inline w-5 h-5 mr-2" />
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Based on {formData.duration_value} {formData.duration_type}(s) × {formData.quantity} item(s)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RentalRequestForm;
