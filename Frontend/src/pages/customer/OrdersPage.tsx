import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { XCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  product: { id: string; name: string; image: string };
  status: string;
  amount: number | string;
  createdAt: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  // cancel from Orders is restricted now; only deletion for Cancelled orders
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      setOrders(list);
    } catch {
      setOrders([]);
    }
  }, []);

  const refresh = () => {
    try { setOrders(JSON.parse(localStorage.getItem('rental_orders') || '[]')); } catch {}
  };

  // old cancel flow retained but no UI entry point
  const cancelOrder = (id: string) => {
    try {
      const list: Order[] = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      const idx = list.findIndex((o) => o.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: 'Cancelled' } as Order;
        localStorage.setItem('rental_orders', JSON.stringify(list));
      }
    } catch {}
    setConfirmingId(null);
    refresh();
  };

  const deleteOrder = (id: string) => {
    try {
      const list: Order[] = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      const next = list.filter((o) => o.id !== id);
      localStorage.setItem('rental_orders', JSON.stringify(next));
      setOrders(next);
    } catch {}
    setDeletingId(null);
  };

  return (
    <Layout title="My Orders">
      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-300">No orders placed yet.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/customer/payment/${o.id}`)}
            >
              <img src={o.product.image} alt={o.product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{o.product.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Order #{o.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-indigo-600 dark:text-indigo-300 font-semibold">₹{Number(o.amount).toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.status==='Cancelled' ? 'bg-gray-100 text-gray-800' : o.status==='Confirmed' ? 'bg-green-100 text-green-800' : o.status==='Declined' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.status}</span>
                <div className="flex items-center space-x-2">
                  {/* Cancellation only allowed from Payment page; remove button here */}
                  {o.status === 'Cancelled' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingId(o.id); }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
                      title="Delete order"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>


        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-sm shadow-lg">
              <div className="flex items-center space-x-2 text-red-600 mb-3"><Trash2 size={20} /><h3 className="font-semibold dark:text-white">Delete this cancelled order?</h3></div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">This will permanently remove the order from your list.</p>
              <div className="flex items-center justify-end space-x-2">
                <button onClick={() => setDeletingId(null)} className="btn-secondary">No, keep it</button>
                <button onClick={() => deleteOrder(deletingId)} className="btn-primary">Yes, delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;


