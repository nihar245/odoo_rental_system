import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { Search, Eye, CheckCircle, XCircle, Trash2, User, Package, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'cards'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      // show all orders for admin, as requested
      setOrders(list);
    } catch {
      setOrders([]);
    }
  }, []);

  const refresh = () => {
    try {
      const list = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      setOrders(list);
    } catch {}
  };

  const getStatusPill = (s: string) => {
    const base = 'px-2 py-1 rounded-full text-xs font-medium ';
    if (s === 'Placed') return base + 'bg-yellow-100 text-yellow-800';
    if (s === 'Confirmed') return base + 'bg-green-100 text-green-800';
    if (s === 'Declined') return base + 'bg-red-100 text-red-800';
    if (s === 'Cancelled') return base + 'bg-gray-100 text-gray-800';
    return base + 'bg-gray-100 text-gray-800';
  };

  const getRentalStatusColor = (status: string) => {
    switch (status) {
      case 'quotation': return 'bg-purple-600';
      case 'reserved': return 'bg-blue-600';
      case 'pickedup': return 'bg-green-600';
      case 'returned': return 'bg-gray-600';
      case 'overdue': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matches = `${o.customer?.name ?? ''} ${o.product?.name ?? ''} ${o.id}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matches;
    });
  }, [orders, searchTerm]);

  const persist = (next: any[]) => {
    localStorage.setItem('rental_orders', JSON.stringify(next));
  };

  const acceptOrder = (id: string) => {
    try {
      const list = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      const idx = list.findIndex((o: any) => o.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: 'Confirmed', reviewStatus: 'Confirmed', adminStage: 'rental' };
        persist(list);
      }
      refresh();
    } catch {}
  };

  const declineOrder = (id: string) => {
    try {
      const list = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      const idx = list.findIndex((o: any) => o.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: 'Declined', reviewStatus: 'Declined', adminStage: 'rental' };
        persist(list);
      }
      refresh();
    } catch {}
  };

  return (
    <Layout title="Orders" showTabs={true} activeTab="order">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Incoming Orders</h2>
            <p className="text-gray-600 dark:text-gray-400">Review new orders and accept or decline</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView(activeView === 'list' ? 'cards' : 'list')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              {activeView === 'list' ? <LayoutGrid size={18} /> : <List size={18} />}
              <span>{activeView === 'list' ? 'Card View' : 'List View'}</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

        {activeView === 'list' ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Order</th>
                    <th className="text-left text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Customer</th>
                    <th className="text-left text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Dates</th>
                    <th className="text-left text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Status</th>
                    <th className="text-right text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Amount</th>
                    <th className="text-center text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        <div className="font-medium">{o.product?.name}</div>
                        <div className="text-xs text-gray-500">#{o.id}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                          <User size={16} className="text-gray-400" />
                          <span>{o.customer?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-sm">
                        <div>{o.startDate} {o.startTime}</div>
                        <div>{o.endDate} {o.endTime}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={getStatusPill(o.status)}>{o.status}</span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-white font-semibold">₹{Number(o.amount).toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => navigate(`/customer/payment/${o.id}`)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors dark:text-indigo-300 dark:hover:bg-gray-700">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => acceptOrder(o.id)} className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors dark:text-green-400 dark:hover:bg-gray-700" title="Accept">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => declineOrder(o.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors dark:text-red-400 dark:hover:bg-gray-700" title="Decline">
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((o) => (
              <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-400 transition-colors dark:bg-gray-800 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold">{o.product?.name}</h3>
                    <p className="text-gray-500 text-sm">#{o.id}</p>
                  </div>
                  <span className={getStatusPill(o.status)}>{o.status}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{o.customer?.name} • ₹{Number(o.amount).toLocaleString()}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <div>Start: {o.startDate} {o.startTime}</div>
                  <div>End: {o.endDate} {o.endTime}</div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => navigate(`/customer/payment/${o.id}`)} className="px-3 py-1.5 rounded border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-gray-700">View</button>
                  <button onClick={() => acceptOrder(o.id)} className="px-3 py-1.5 rounded border border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-gray-700">Accept</button>
                  <button onClick={() => declineOrder(o.id)} className="px-3 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-gray-700">Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl text-gray-700 dark:text-gray-300 mb-2">No incoming orders</h3>
            <p className="text-gray-500">New orders will appear here</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderManagement;