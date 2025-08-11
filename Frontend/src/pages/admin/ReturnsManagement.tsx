import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Search, Calendar, AlertTriangle, CheckCircle, Clock, Package, MapPin, Phone } from 'lucide-react';

const ReturnsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const returns = [
    {
      id: 'RET/IN/0001',
      orderId: 'R0001',
      customer: 'John Doe',
      product: 'MacBook Pro 16"',
      phone: '+91 98765 43210',
      pickupAddress: '123 Tech Street, Mumbai',
      destinationAddress: '456 Return Center, Mumbai',
      scheduledDate: '2024-01-22',
      status: 'pending',
      daysOverdue: 0,
      penalty: 0,
      transferType: 'Return',
      image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'RET/IN/0002',
      orderId: 'R0004',
      customer: 'Sarah Wilson',
      product: 'Power Tools Set',
      phone: '+91 87654 32109',
      pickupAddress: '789 Workshop Lane, Pune',
      destinationAddress: '321 Storage Facility, Pune',
      scheduledDate: '2024-01-17',
      status: 'overdue',
      daysOverdue: 5,
      penalty: 1100,
      transferType: 'Return',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'RET/IN/0003',
      orderId: 'R0003',
      customer: 'Mike Johnson',
      product: 'Gaming Chair Pro',
      phone: '+91 76543 21098',
      pickupAddress: '456 Gaming Street, Bangalore',
      destinationAddress: '123 Warehouse, Bangalore',
      scheduledDate: '2024-01-12',
      status: 'completed',
      daysOverdue: 0,
      penalty: 0,
      transferType: 'Return',
      image: 'https://images.pexels.com/photos/4050320/pexels-photo-4050320.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'RET/IN/0004',
      orderId: 'R0005',
      customer: 'Emma Davis',
      product: 'Camera Equipment',
      phone: '+91 65432 10987',
      pickupAddress: '789 Photo Studio, Delhi',
      destinationAddress: '456 Equipment Center, Delhi',
      scheduledDate: '2024-01-25',
      status: 'scheduled',
      daysOverdue: 0,
      penalty: 0,
      transferType: 'Return',
      image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=200'
    }
  ];

  const tabs = [
    { id: 'pending', label: 'Pending Returns', count: returns.filter(r => r.status === 'pending').length },
    { id: 'overdue', label: 'Overdue', count: returns.filter(r => r.status === 'overdue').length },
    { id: 'scheduled', label: 'Scheduled', count: returns.filter(r => r.status === 'scheduled').length },
    { id: 'completed', label: 'Completed', count: returns.filter(r => r.status === 'completed').length }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600 text-white';
      case 'overdue': return 'bg-red-600 text-white';
      case 'scheduled': return 'bg-blue-600 text-white';
      case 'completed': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-400" size={20} />;
      case 'overdue': return <AlertTriangle className="text-red-400" size={20} />;
      case 'scheduled': return <Calendar className="text-blue-400" size={20} />;
      case 'completed': return <CheckCircle className="text-green-400" size={20} />;
      default: return <Package className="text-gray-400" size={20} />;
    }
  };

  const filteredReturns = returns.filter(returnItem => {
    const matchesTab = activeTab === 'all' || returnItem.status === activeTab;
    const matchesSearch = returnItem.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <Layout title="Returns & Delay Management" showTabs={true} activeTab="rental">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Returns & Delay Management</h2>
            <p className="text-gray-400">Track returns, manage delays, and handle penalties</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Send Reminders
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Schedule Pickup
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search returns..."
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Returns List */}
        <div className="space-y-4">
          {filteredReturns.map(returnItem => (
            <div key={returnItem.id} className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Return Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={returnItem.image}
                    alt={returnItem.product}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(returnItem.status)}
                      <h3 className="text-white font-semibold text-lg">{returnItem.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                        {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-1">{returnItem.product}</p>
                    <p className="text-gray-400 text-sm">Order ID: {returnItem.orderId}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="lg:w-64">
                  <h4 className="text-white font-medium mb-2">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{returnItem.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-300">{returnItem.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Address Info */}
                <div className="lg:w-80">
                  <h4 className="text-white font-medium mb-2">Transfer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-400">From: </span>
                        <span className="text-gray-300">{returnItem.pickupAddress}</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-400">To: </span>
                        <span className="text-gray-300">{returnItem.destinationAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="lg:w-48">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Scheduled Date:</span>
                      <p className="text-white font-medium">{new Date(returnItem.scheduledDate).toLocaleDateString()}</p>
                    </div>
                    
                    {returnItem.status === 'overdue' && (
                      <div className="bg-red-900 border border-red-600 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="text-red-400" size={16} />
                          <span className="text-red-400 font-medium text-sm">Overdue</span>
                        </div>
                        <p className="text-red-300 text-xs">{returnItem.daysOverdue} days late</p>
                        <p className="text-red-300 text-xs">Penalty: ₹{returnItem.penalty}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        Check Availability
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                        Confirm
                      </button>
                    </div>
                    
                    {returnItem.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors">
                          Draft
                        </button>
                        <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors">
                          Ready
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-4 border-t border-gray-600">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Pickup Scheduled</span>
                  <span>In Transit</span>
                  <span>Delivered</span>
                  <span>Returned</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      returnItem.status === 'completed' ? 'bg-green-500 w-full' :
                      returnItem.status === 'overdue' ? 'bg-red-500 w-3/4' :
                      returnItem.status === 'scheduled' ? 'bg-blue-500 w-1/4' :
                      'bg-yellow-500 w-1/2'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl text-gray-300 mb-2">No returns found</h3>
            <p className="text-gray-500">
              {activeTab === 'all' 
                ? "No returns to display at the moment."
                : `No ${activeTab} returns found.`
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReturnsManagement;