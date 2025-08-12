import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Plus,
  Eye,
  Trash2
} from 'lucide-react';

interface Invoice {
  _id: string;
  invoice_number: string;
  customer_id: {
    _id: string;
    name: string;
    email: string;
  };
  product_id: {
    _id: string;
    name: string;
  };
  total_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  issued_date: string;
  late_fees: number;
  payment_details: {
    upfront_payment: number;
    remaining_balance: number;
    payment_method: string;
  };
}

interface RentalRequest {
  _id: string;
  product_id: {
    _id: string;
    name: string;
    dailyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    yearlyRate: number;
  };
  customer_id: {
    _id: string;
    name: string;
    email: string;
  };
  quantity: number;
  scheduled_pickup_date: string;
  scheduled_delivery_date: string;
  status: string;
  payment_status: string;
}

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    rental_request_id: '',
    payment_method: 'full_upfront',
    upfront_payment: 0,
    security_deposit: 0,
    notes: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchRentalRequests();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/v1/invoices/all', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchRentalRequests = async () => {
    try {
      const response = await fetch('/api/v1/rental-requests/all', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('All rental requests received:', data.data.rentalRequests);
        
        // Filter for confirmed rental requests (these are the ones we can create invoices for)
        const confirmedRequests = data.data.rentalRequests.filter((req: RentalRequest) => 
          req.status === 'confirmed'
        );
        
        console.log('Filtered confirmed requests:', confirmedRequests);
        setRentalRequests(confirmedRequests);
      } else {
        console.error('Failed to fetch rental requests:', response.status);
      }
    } catch (error) {
      console.error('Error fetching rental requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(createFormData),
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices([data.data.invoice, ...invoices]);
        setShowCreateForm(false);
        setCreateFormData({
          rental_request_id: '',
          payment_method: 'full_upfront',
          upfront_payment: 0,
          security_deposit: 0,
          notes: ''
        });
        alert('Invoice created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice');
    }
  };

  const handleProcessPayment = async (invoiceId: string, amount: number) => {
    try {
      const response = await fetch(`/api/v1/invoices/${invoiceId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        fetchInvoices();
        alert('Payment processed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`/api/v1/invoices/${invoiceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setInvoices(invoices.filter(inv => inv._id !== invoiceId));
        alert('Invoice deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice');
    }
  };

  const downloadInvoiceDocument = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/v1/invoices/${invoiceId}/document`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        // Get the filename from the response headers
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
          : `invoice-${invoiceId}.pdf`;
        
        // Create blob from PDF response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Error downloading invoice:', response.statusText);
        alert('Error downloading invoice document');
      }
    } catch (error) {
      console.error('Error downloading invoice document:', error);
      alert('Error downloading invoice document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Invoice Management
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage invoices, process payments, and handle late fees
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Create Invoice
          </button>
        </div>
        
        {/* Debug info for rental requests */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-800 dark:text-blue-200 font-medium">Rental Request Status</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Available confirmed rental requests: {rentalRequests.length}
              </p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchRentalRequests();
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Create Invoice Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
              Create New Invoice
            </h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Rental Request
                  </label>
                  <select
                    value={createFormData.rental_request_id}
                    onChange={(e) => setCreateFormData({
                      ...createFormData,
                      rental_request_id: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                    required
                  >
                    <option value="">Select a rental request</option>
                    {rentalRequests.length === 0 ? (
                      <option value="" disabled>
                        No confirmed rental requests available
                      </option>
                    ) : (
                      rentalRequests.map((req) => {
                        const startDate = new Date(req.scheduled_pickup_date).toLocaleDateString();
                        const endDate = new Date(req.scheduled_delivery_date).toLocaleDateString();
                        const totalDays = Math.ceil(
                          (new Date(req.scheduled_delivery_date) - new Date(req.scheduled_pickup_date)) / (1000 * 60 * 60 * 24)
                        );
                        
                        // Calculate estimated total based on daily rate
                        const estimatedTotal = req.product_id.dailyRate * totalDays;
                        
                        return (
                          <option key={req._id} value={req._id}>
                            {req.product_id.name} | {req.customer_id.name} | Qty: {req.quantity} | {startDate} to {endDate} ({totalDays} days) | Est: ${estimatedTotal.toFixed(2)}
                          </option>
                        );
                      })
                    )}
                  </select>
                  
                  {/* Show message when no rental requests */}
                  {rentalRequests.length === 0 && (
                    <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="text-yellow-600 dark:text-yellow-400">⚠️</div>
                        <div>
                          <p className="text-yellow-800 dark:text-yellow-200 font-medium">No rental requests available</p>
                          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                            To create an invoice, you need confirmed rental requests. 
                            Check that rental requests exist and have been confirmed by an admin.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Helper section showing selected rental request details */}
                  {createFormData.rental_request_id && (() => {
                    const selectedRequest = rentalRequests.find(req => req._id === createFormData.rental_request_id);
                    if (!selectedRequest) return null;
                    
                    const startDate = new Date(selectedRequest.scheduled_pickup_date).toLocaleDateString();
                    const endDate = new Date(selectedRequest.scheduled_delivery_date).toLocaleDateString();
                    const totalDays = Math.ceil(
                      (new Date(selectedRequest.scheduled_delivery_date) - new Date(selectedRequest.scheduled_pickup_date)) / (1000 * 60 * 60 * 24)
                    );
                    
                    const dailyTotal = selectedRequest.product_id.dailyRate * totalDays;
                    const weeklyTotal = (selectedRequest.product_id.weeklyRate || 0) > 0 ? 
                      Math.ceil(totalDays / 7) * (selectedRequest.product_id.weeklyRate || 0) : null;
                    const monthlyTotal = (selectedRequest.product_id.monthlyRate || 0) > 0 ? 
                      Math.ceil(totalDays / 30) * (selectedRequest.product_id.monthlyRate || 0) : null;
                    const yearlyTotal = (selectedRequest.product_id.yearlyRate || 0) > 0 ? 
                      Math.ceil(totalDays / 365) * (selectedRequest.product_id.yearlyRate || 0) : null;
                    
                    return (
                      <div className="mt-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-md">
                        <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">Rental Request Details:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">Product:</span>
                            <p className="font-medium text-emerald-900 dark:text-emerald-100">{selectedRequest.product_id.name}</p>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">Customer:</span>
                            <p className="font-medium text-emerald-900 dark:text-emerald-100">{selectedRequest.customer_id.name}</p>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">Quantity:</span>
                            <p className="font-medium text-emerald-900 dark:text-emerald-100">{selectedRequest.quantity}</p>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">Duration:</span>
                            <p className="font-medium text-emerald-900 dark:text-emerald-100">{totalDays} days</p>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">Start Date:</span>
                            <p className="font-medium text-emerald-900 dark:text-emerald-100">{startDate}</p>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">End Date:</span>
                            <p className="font-medium text-emerald-900 dark:text-emerald-100">{endDate}</p>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">Daily Rate:</span>
                            <p className="font-medium text-emerald-900 dark:text-emerald-100">${selectedRequest.product_id.dailyRate}</p>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">Est. Daily Total:</span>
                            <p className="font-medium text-emerald-900 dark:text-emerald-100">${dailyTotal.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                          <h5 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">Pricing Options:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-emerald-700 dark:text-emerald-300">Daily:</span>
                              <p className="font-medium text-emerald-900 dark:text-emerald-100">${dailyTotal.toFixed(2)}</p>
                            </div>
                            {weeklyTotal && (
                              <div>
                                <span className="text-emerald-700 dark:text-emerald-300">Weekly:</span>
                                <p className="font-medium text-emerald-900 dark:text-emerald-100">${weeklyTotal.toFixed(2)}</p>
                              </div>
                            )}
                            {monthlyTotal && (
                              <div>
                                <span className="text-emerald-700 dark:text-emerald-300">Monthly:</span>
                                <p className="font-medium text-emerald-900 dark:text-emerald-100">${monthlyTotal.toFixed(2)}</p>
                              </div>
                            )}
                            {yearlyTotal && (
                              <div>
                                <span className="text-emerald-700 dark:text-emerald-300">Yearly:</span>
                                <p className="font-medium text-emerald-900 dark:text-emerald-100">${yearlyTotal.toFixed(2)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={createFormData.payment_method}
                    onChange={(e) => setCreateFormData({
                      ...createFormData,
                      payment_method: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  >
                    <option value="full_upfront">Full Upfront Payment</option>
                    <option value="partial_deposit">Partial Deposit</option>
                    <option value="installment">Installment Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Upfront Payment ($)
                  </label>
                  <input
                    type="number"
                    value={createFormData.upfront_payment}
                    onChange={(e) => setCreateFormData({
                      ...createFormData,
                      upfront_payment: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Security Deposit ($)
                  </label>
                  <input
                    type="number"
                    value={createFormData.security_deposit}
                    onChange={(e) => setCreateFormData({
                      ...createFormData,
                      security_deposit: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={createFormData.notes}
                  onChange={(e) => setCreateFormData({
                    ...createFormData,
                    notes: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Create Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-zinc-500 hover:bg-zinc-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invoices List */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              All Invoices ({invoices.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">
                        {invoice.invoice_number}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(invoice.issued_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">
                        {invoice.customer_id.name}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {invoice.customer_id.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                      {invoice.product_id.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">
                        ${invoice.total_amount.toFixed(2)}
                      </div>
                      {invoice.late_fees > 0 && (
                        <div className="text-sm text-red-600">
                          +${invoice.late_fees.toFixed(2)} late fees
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(invoice.payment_status)}`}>
                        {invoice.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadInvoiceDocument(invoice._id)}
                          className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                          title="Download PDF Invoice"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {invoice.payment_status !== 'paid' && (
                          <button
                            onClick={() => {
                              const amount = prompt('Enter payment amount:');
                              if (amount) {
                                handleProcessPayment(invoice._id, parseFloat(amount));
                              }
                            }}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Process Payment"
                          >
                            <DollarSign size={16} />
                          </button>
                        )}
                        {invoice.payment_status === 'pending' && (
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Invoice"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Details Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Invoice Details
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Invoice Number</label>
                    <p className="text-sm text-zinc-900 dark:text-white">{selectedInvoice.invoice_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</label>
                    <p className="text-sm text-zinc-900 dark:text-white">{selectedInvoice.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Customer</label>
                    <p className="text-sm text-zinc-900 dark:text-white">{selectedInvoice.customer_id.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Product</label>
                    <p className="text-sm text-zinc-900 dark:text-white">{selectedInvoice.product_id.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Amount</label>
                    <p className="text-sm text-zinc-900 dark:text-white">${selectedInvoice.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Late Fees</label>
                    <p className="text-sm text-zinc-900 dark:text-white">${selectedInvoice.late_fees.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Payment Status</label>
                    <p className="text-sm text-zinc-900 dark:text-white">{selectedInvoice.payment_status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Due Date</label>
                    <p className="text-sm text-zinc-900 dark:text-white">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Payment Details</label>
                  <div className="bg-zinc-50 dark:bg-zinc-700 p-3 rounded-md">
                    <p className="text-sm text-zinc-900 dark:text-white">
                      Upfront Payment: ${selectedInvoice.payment_details.upfront_payment.toFixed(2)}
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-white">
                      Remaining Balance: ${selectedInvoice.payment_details.remaining_balance.toFixed(2)}
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-white">
                      Payment Method: {selectedInvoice.payment_details.payment_method}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;
