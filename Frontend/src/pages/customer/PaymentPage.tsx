import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ArrowLeft, Printer, XCircle, CreditCard } from 'lucide-react';

interface StoredOrder {
  id: string;
  product: { id: string; name: string };
  period: 'auto' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  quantity: number;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  unitPrices: { hourly: number; daily: number; weekly: number; monthly: number };
  amount: number;
  address: string;
  status: string; // Placed | Confirmed | Declined | Cancelled
  reviewStatus?: 'Pending' | 'Confirmed' | 'Declined';
  adminStage?: 'incoming' | 'rental';
  customer: { name: string; email: string; avatarUrl?: string };
  createdAt: string;
  addressFields?: { line1?: string; zip?: string; city?: string; state?: string; country?: string };
}

const diffRuntime = (o: StoredOrder) => {
  const s = new Date(`${o.startDate}T${o.startTime || '09:00'}:00`);
  const e = new Date(`${o.endDate}T${o.endTime || '18:00'}:00`);
  const ms = e.getTime() - s.getTime();
  if (ms < 0) return { hours: 0, days: 0, sameDay: false };
  const hours = Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  return { hours, days, sameDay: s.toDateString() === e.toDateString() };
};

const calcAmount = (o: StoredOrder) => {
  const d = diffRuntime(o);
  let unit = o.unitPrices.daily; let units = d.days;
  if (d.sameDay) { unit = o.unitPrices.hourly; units = d.hours; }
  if (o.period === 'hourly') { unit = o.unitPrices.hourly; units = d.hours; }
  if (o.period === 'weekly') { unit = o.unitPrices.weekly; units = Math.ceil(d.days/7); }
  if (o.period === 'monthly') { unit = o.unitPrices.monthly; units = Math.ceil(d.days/30); }
  return unit * units * o.quantity;
};

// Load Razorpay script once
function loadRazorpayScript(src: string) {
  return new Promise<boolean>((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PaymentPage: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const navigate = useNavigate();
  // tabs removed per cleanup
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    try { const list: StoredOrder[] = JSON.parse(localStorage.getItem('rental_orders') || '[]'); const found = list.find((o) => o.id === rentalId) || null; setOrder(found); } catch { setOrder(null); }
  }, [rentalId]);

  const total = useMemo(() => (order ? calcAmount(order) : 0), [order]);

  const updateStatus = (newStatus: string) => {
    if (!order) return;
    try {
      const list: StoredOrder[] = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      const idx = list.findIndex((o) => o.id === order.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: newStatus };
        localStorage.setItem('rental_orders', JSON.stringify(list));
        setOrder(list[idx]);
      }
    } catch {}
  };

  const handlePrint = () => window.print();
  const handleCancel = () => setCancelConfirm(true);
  const confirmCancel = () => {
    if (!order) return;
    try {
      const list: StoredOrder[] = JSON.parse(localStorage.getItem('rental_orders') || '[]');
      const idx = list.findIndex((o) => o.id === order.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: 'Cancelled' };
        localStorage.setItem('rental_orders', JSON.stringify(list));
        setOrder(list[idx]);
      }
    } catch {}
    setCancelConfirm(false);
    navigate('/customer/orders');
  };

  const handlePayNow = useCallback(async () => {
    if (!order) return;
    setIsPaying(true);
    const ok = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!ok) {
      alert('Razorpay SDK failed to load. Check your internet connection.');
      setIsPaying(false);
      return;
    }

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag', // Test key for demo
      amount: Math.max(1, Math.round(total * 100)), // amount in paise
      currency: 'INR',
      name: 'Rental Management',
      description: `Payment for Order #${order.id}`,
      image: '',
      order_id: '', // No backend order for demo
      handler: (response: any) => {
        alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
        // For demo, mark as Confirmed locally (optional)
        updateStatus('Confirmed');
        setIsPaying(false);
      },
      prefill: {
        name: order.customer.name,
        email: order.customer.email,
        contact: '',
      },
      notes: {
        address: order.address,
      },
      theme: { color: '#6366f1' },
      modal: {
        ondismiss: () => {
          setIsPaying(false);
        },
      },
    } as any;

    // @ts-ignore
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }, [order, total]);

  if (!order) return (<Layout title="Order Not Found"><div className="text-center text-gray-600">We could not find this order.</div></Layout>);

  const isCancelled = order.status === 'Cancelled';
  const isConfirmed = order.status === 'Confirmed';
  const disabled = isCancelled;

  return (
    <Layout title={`Rental Order ${order.id}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/customer/orders')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"><ArrowLeft size={20} /><span>Back to Orders</span></button>
          <div className="text-sm text-gray-500">Created on {new Date(order.createdAt).toLocaleString()}</div>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <div className="text-sm text-gray-700">Order status</div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : order.status === 'Confirmed' ? 'bg-green-100 text-green-800' : order.status === 'Placed' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                {order.status}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-700">Admin decision</div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.reviewStatus === 'Declined' ? 'bg-red-100 text-red-800' : order.reviewStatus === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {order.reviewStatus ?? 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Print</button>
              <button onClick={handleCancel} className={`px-4 py-2 rounded-lg ${isCancelled ? 'btn-disabled' : 'bg-red-500 hover:bg-red-600 text-white'}`} disabled={isCancelled}>Cancel</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">{order.customer.avatarUrl ? <img src={order.customer.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">{order.customer.name[0]}</div>}</div>
              <div><div className="font-medium text-gray-900">{order.customer.name}</div><div className="text-sm text-gray-600">{order.customer.email}</div></div>
            </div>
            <div className="mt-4"><div className="text-sm text-gray-600 whitespace-pre-line">{order.address}</div></div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-gray-600">Product</div><div className="font-medium text-gray-900">{order.product.name}</div></div>
              <div><div className="text-gray-600">Period</div><div className="font-medium text-gray-900 capitalize">Auto</div></div>
              <div><div className="text-gray-600">Start</div><div className="font-medium text-gray-900">{order.startDate} {order.startTime}</div></div>
              <div><div className="text-gray-600">End</div><div className="font-medium text-gray-900">{order.endDate} {order.endTime}</div></div>
              <div><div className="text-gray-600">Quantity</div><div className="font-medium text-gray-900">{order.quantity}</div></div>
              <div><div className="text-gray-600">Computed Total</div><div className="font-medium text-gray-900">₹{total.toLocaleString()}</div></div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
              <p className="text-gray-700 mt-1">Amount to pay: <span className="font-bold text-blue-600">₹{total.toLocaleString()}</span></p>
            </div>
            <button
              onClick={handlePayNow}
              disabled={disabled || isPaying}
              className={`px-5 py-2 rounded-lg flex items-center space-x-2 text-white ${disabled || isPaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <CreditCard size={18} />
              <span>{isPaying ? 'Processing...' : 'Pay Now'}</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Educational demo using Razorpay test mode.</p>
        </div>

        {cancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
              <div className="flex items-center space-x-2 text-red-600 mb-3"><XCircle size={20} /><h3 className="font-semibold">Cancel this order?</h3></div>
              <p className="text-sm text-gray-600 mb-4">This will mark the order as Cancelled and disable actions.</p>
              <div className="flex items-center justify-end space-x-2"><button onClick={() => setCancelConfirm(false)} className="btn-secondary">No, keep it</button><button onClick={confirmCancel} className="btn-primary">Yes, cancel</button></div>
            </div>
          </div>
        )}

        {/* Create Invoice and Create Pickup buttons removed */}
        <div className="flex items-center justify-end text-sm text-gray-500">Order #{order.id}</div>
      </div>
    </Layout>
  );
};

export default PaymentPage;