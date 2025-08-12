import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { Grid, List, Trash2 } from 'lucide-react';

interface RentalOrder {
  id: string;
  product: { id: string; name: string; image?: string };
  status: string; // Confirmed | Declined | Cancelled | Placed
  reviewStatus?: 'Pending' | 'Confirmed' | 'Declined';
  adminStage?: 'incoming' | 'rental';
  amount: number;
  startDate: string; endDate: string; startTime?: string; endTime?: string;
  customer?: { name?: string };
}

const AdminRental: React.FC = () => {
  const [view, setView] = useState<'list' | 'cards'>('list');
  const [orders, setOrders] = useState<RentalOrder[]>([]);

  const load = () => {
    try {
      const list: RentalOrder[] = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      setOrders(list.filter((o) => (o.adminStage ?? 'incoming') === 'rental'));
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => { load(); }, []);

  const removeIfDeclined = (id: string) => {
    try {
      const list: RentalOrder[] = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      const o = list.find((x) => x.id === id);
      if (o && (o.status === 'Declined' || o.status === 'Cancelled')) {
        const next = list.filter((x) => x.id !== id);
        localStorage.setItem('rental_orders', JSON.stringify(next));
      }
    } catch {}
    load();
  };

  const items = useMemo(() => orders, [orders]);

  return (
    <Layout title="Rental Orders" showTabs={true} activeTab="rental">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Orders moved to Rental</h2>
          <div className="flex space-x-2">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded border ${view==='list'?'border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-gray-800 dark:text-indigo-300':'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300'}`}><List size={16} /></button>
            <button onClick={() => setView('cards')} className={`px-3 py-1.5 rounded border ${view==='cards'?'border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg_gray-800 dark:text-indigo-300':'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300'}`}><Grid size={16} /></button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Order</th>
                  <th className="text-left text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Customer</th>
                  <th className="text-left text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Status</th>
                  <th className="text-right text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Amount</th>
                  <th className="text-center text-gray-600 dark:text-gray-300 font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">
                      <div className="font-medium">{o.product?.name}</div>
                      <div className="text-xs text-gray-500">#{o.id}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{o.customer?.name ?? '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.status==='Confirmed'?'bg-green-100 text-green-800':o.status==='Declined'?'bg-red-100 text-red-800':o.status==='Cancelled'?'bg-gray-100 text-gray-800':'bg-yellow-100 text-yellow-800'}`}>{o.status}</span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900 dark:text-white font-semibold">₹{Number(o.amount).toLocaleString()}</td>
                    <td className="py-4 px-4">
                      {(o.status === 'Declined' || o.status === 'Cancelled') && (
                        <div className="flex justify-center">
                          <button onClick={() => removeIfDeclined(o.id)} className="px-3 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-gray-700 flex items-center space-x-1"><Trash2 size={14} /><span>Delete</span></button>
                        </div>
                      )}
                    </td>
                  </tr>) )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((o) => (
              <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-400 transition-colors dark:bg-gray-800 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold">{o.product?.name}</h3>
                    <p className="text-gray-500 text-sm">#{o.id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.status==='Confirmed'?'bg-green-100 text-green-800':o.status==='Declined'?'bg-red-100 text-red-800':o.status==='Cancelled'?'bg-gray-100 text-gray-800':'bg-yellow-100 text-yellow-800'}`}>{o.status}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{o.customer?.name ?? '-'} • ₹{Number(o.amount).toLocaleString()}</p>
                {(o.status === 'Declined' || o.status === 'Cancelled') && (
                  <div className="flex justify-end">
                    <button onClick={() => removeIfDeclined(o.id)} className="px-3 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-gray-700 flex items-center space-x-1"><Trash2 size={14} /><span>Delete</span></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminRental;


