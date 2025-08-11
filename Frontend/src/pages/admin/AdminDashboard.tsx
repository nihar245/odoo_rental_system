import React from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, Users, DollarSign, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const kpis = [
    { label: 'Total Rentals', value: '52', change: '+12%', icon: Package, color: 'blue' },
    { label: 'Revenue', value: '₹1,05,000', change: '+8%', icon: DollarSign, color: 'green' },
    { label: 'Active Customers', value: '32', change: '+5%', icon: Users, color: 'purple' },
    { label: 'Available Products', value: '28', change: '-2%', icon: TrendingUp, color: 'orange' }
  ];

  const topProducts = [
    { name: 'MacBook Pro', orders: 15, revenue: '₹45,000' },
    { name: 'Camera Set', orders: 12, revenue: '₹36,000' },
    { name: 'Gaming Setup', orders: 8, revenue: '₹24,000' }
  ];

  const topCustomers = [
    { name: 'Customer 1', orders: 8, revenue: '₹24,000' },
    { name: 'Customer 2', orders: 6, revenue: '₹18,000' },
    { name: 'Customer 3', orders: 5, revenue: '₹15,000' }
  ];

  const recentOrders = [
    { id: 'R0001', customer: 'John Doe', product: 'MacBook Pro', status: 'active', amount: '₹5,000' },
    { id: 'R0002', customer: 'Jane Smith', product: 'Camera Set', status: 'pending', amount: '₹3,000' },
    { id: 'R0003', customer: 'Mike Johnson', product: 'Gaming Chair', status: 'completed', amount: '₹1,500' },
    { id: 'R0004', customer: 'Sarah Wilson', product: 'Power Tools', status: 'overdue', amount: '₹2,200' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-600 text-white';
      case 'pending': return 'bg-yellow-600 text-white';
      case 'completed': return 'bg-green-600 text-white';
      case 'overdue': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getKpiColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'purple': return 'bg-purple-600';
      case 'orange': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const navigate = useNavigate();
  return (
    <Layout title="Admin Dashboard" showTabs={true} activeTab="dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getKpiColor(kpi.color)}`}>
                  <kpi.icon className="text-white" size={24} />
                </div>
                <span className={`text-sm font-medium ${
                  kpi.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{kpi.value}</h3>
              <p className="text-gray-400 text-sm">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-gray-400 text-sm">{product.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-semibold">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Customers</h3>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{customer.name}</p>
                    <p className="text-gray-400 text-sm">{customer.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-semibold">{customer.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="btn-primary"
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-gray-900 font-medium py-3">Order ID</th>
                  <th className="text-left text-gray-900 font-medium py-3">Customer</th>
                  <th className="text-left text-gray-900 font-medium py-3">Product</th>
                  <th className="text-left text-gray-900 font-medium py-3">Status</th>
                  <th className="text-right text-gray-900 font-medium py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-4 text-blue-600 font-medium">{order.id}</td>
                    <td className="py-4 text-gray-900">{order.customer}</td>
                    <td className="py-4 text-gray-700">{order.product}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 text-right text-gray-900 font-semibold">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rental Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">All Orders</p>
                <p className="text-white text-2xl font-bold">52</p>
              </div>
              <Package className="text-blue-400" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 border border-yellow-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium">Pending</p>
                <p className="text-white text-2xl font-bold">8</p>
              </div>
              <Clock className="text-yellow-400" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 border border-green-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Active</p>
                <p className="text-white text-2xl font-bold">32</p>
              </div>
              <CheckCircle className="text-green-400" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 border border-red-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium">Overdue</p>
                <p className="text-white text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="text-red-400" size={32} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;