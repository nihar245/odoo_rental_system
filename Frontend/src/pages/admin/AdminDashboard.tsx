import React from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, Users, DollarSign, Calendar, Clock, AlertTriangle, CheckCircle, FileText, Settings, BarChart3 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const kpis = [
    { label: 'Total Rentals', value: '52', change: '+12%', icon: Package, color: 'green' },
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
      case 'blue': return 'bg-emerald-600';
      case 'green': return 'bg-emerald-600';
      case 'purple': return 'bg-purple-600';
      case 'orange': return 'bg-orange-600';
      default: return 'bg-zinc-600';
    }
  };

  const navigate = useNavigate();
  return (
    <Layout title="Admin Dashboard" showTabs={true} activeTab="dashboard">
      <div className="space-y-6 relative">
        {/* Enhanced background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-zinc-500/5 pointer-events-none rounded-3xl"></div>
        
        {/* Quick Access */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/invoices')}
              className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <FileText className="h-8 w-8 text-emerald-600" />
              <div className="text-center">
                <div className="font-medium text-zinc-900 dark:text-white">Invoices</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Manage payments</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <Package className="h-8 w-8 text-emerald-600" />
              <div className="text-center">
                <div className="font-medium text-zinc-900 dark:text-white">Products</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Manage inventory</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-emerald-600" />
              <div className="text-center">
                <div className="font-medium text-zinc-900 dark:text-white">Reports</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">View analytics</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/settings')}
              className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <Settings className="h-8 w-8 text-emerald-600" />
              <div className="text-center">
                <div className="font-medium text-zinc-900 dark:text-white">Settings</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Configure system</div>
              </div>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div key={index} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getKpiColor(kpi.color)}`}>
                  <kpi.icon className="text-white" size={24} />
                </div>
                <span className={`text-sm font-medium ${
                  kpi.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{kpi.value}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Top Products</h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-700/50 p-2 rounded transition-colors">
                  <div>
                    <p className="text-zinc-900 dark:text-white font-medium">{product.name}</p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">{product.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Top Customers</h3>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-700/50 p-2 rounded transition-colors">
                  <div>
                    <p className="text-zinc-900 dark:text-white font-medium">{customer.name}</p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">{customer.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{customer.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Orders</h3>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-600">
                  <th className="text-left text-zinc-700 dark:text-zinc-300 font-medium py-3">Order ID</th>
                  <th className="text-left text-zinc-700 dark:text-zinc-300 font-medium py-3">Customer</th>
                  <th className="text-left text-zinc-700 dark:text-zinc-300 font-medium py-3">Product</th>
                  <th className="text-left text-zinc-700 dark:text-zinc-300 font-medium py-3">Status</th>
                  <th className="text-right text-zinc-700 dark:text-zinc-300 font-medium py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-zinc-100 dark:border-zinc-700 last:border-b-0 hover:bg-zinc-100 dark:hover:bg-zinc-700/50">
                    <td className="py-4 text-emerald-600 dark:text-emerald-400 font-medium">{order.id}</td>
                    <td className="py-4 text-zinc-900 dark:text-white">{order.customer}</td>
                    <td className="py-4 text-zinc-700 dark:text-zinc-300">{order.product}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rental Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-800 border border-emerald-500 rounded-lg p-4 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">All Orders</p>
                <p className="text-zinc-900 dark:text-white text-2xl font-bold">52</p>
              </div>
              <Package className="text-emerald-600 dark:text-emerald-400" size={32} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 border border-yellow-500 rounded-lg p-4 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pending</p>
                <p className="text-zinc-900 dark:text-white text-2xl font-bold">8</p>
              </div>
              <Clock className="text-yellow-600 dark:text-yellow-400" size={32} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 border border-emerald-500 rounded-lg p-4 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Active</p>
                <p className="text-zinc-900 dark:text-white text-2xl font-bold">32</p>
              </div>
              <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={32} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 border border-red-500 rounded-lg p-4 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">Overdue</p>
                <p className="text-zinc-900 dark:text-white text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;