import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye
} from 'lucide-react';

interface Invoice {
  _id: string;
  invoice_number: string;
  product_id: {
    _id: string;
    name: string;
    images: string[];
  };
  total_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  issued_date: string;
  late_fees: number;
  rental_period: {
    start_date: string;
    end_date: string;
    total_days: number;
  };
  payment_details: {
    upfront_payment: number;
    remaining_balance: number;
    payment_method: string;
    installments: Array<{
      amount: number;
      due_date: string;
      paid: boolean;
      paid_date?: string;
    }>;
  };
  pricing: {
    daily_rate: number;
    weekly_rate?: number;
    monthly_rate?: number;
    yearly_rate?: number;
  };
  subtotal: number;
  security_deposit: number;
  notes?: string;
}

const MyInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/v1/invoices/customer/invoices', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
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
      case 'paid': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus === 'all') return true;
    return invoice.payment_status === filterStatus;
  });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            My Invoices
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            View and manage your rental invoices
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-700'
              }`}
            >
              All ({invoices.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-700'
              }`}
            >
              Pending ({invoices.filter(inv => inv.payment_status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('partial')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'partial'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-700'
              }`}
            >
              Partial ({invoices.filter(inv => inv.payment_status === 'partial').length})
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-700'
              }`}
            >
              Paid ({invoices.filter(inv => inv.payment_status === 'paid').length})
            </button>
            <button
              onClick={() => setFilterStatus('overdue')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'overdue'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-700'
              }`}
            >
              Overdue ({invoices.filter(inv => inv.payment_status === 'overdue').length})
            </button>
          </div>
        </div>

        {/* Invoices Grid */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              No invoices found
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              {filterStatus === 'all' 
                ? "You don't have any invoices yet."
                : `You don't have any ${filterStatus} invoices.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Invoice Header */}
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {invoice.product_id.name}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Invoice #{invoice.invoice_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${invoice.total_amount.toFixed(2)}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(invoice.payment_status)}`}>
                      {invoice.payment_status}
                    </span>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">Rental Period:</span>
                      <span className="text-zinc-900 dark:text-white">
                        {new Date(invoice.rental_period.start_date).toLocaleDateString()} - {new Date(invoice.rental_period.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">Total Days:</span>
                      <span className="text-zinc-900 dark:text-white">{invoice.rental_period.total_days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">Daily Rate:</span>
                      <span className="text-zinc-900 dark:text-white">${invoice.pricing.daily_rate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">Subtotal:</span>
                      <span className="text-zinc-900 dark:text-white">${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    {invoice.security_deposit > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Security Deposit:</span>
                        <span className="text-zinc-900 dark:text-white">${invoice.security_deposit.toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.late_fees > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Late Fees:</span>
                        <span className="text-red-600 dark:text-red-400">${invoice.late_fees.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-zinc-50 dark:bg-zinc-700 rounded-md p-3 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-500 dark:text-zinc-400">Upfront Payment:</span>
                      <span className="text-zinc-900 dark:text-white">${invoice.payment_details.upfront_payment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-zinc-500 dark:text-zinc-400">Remaining Balance:</span>
                      <span className="text-zinc-900 dark:text-white">${invoice.payment_details.remaining_balance.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Installments */}
                  {invoice.payment_details.installments && invoice.payment_details.installments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Installments:</h4>
                      <div className="space-y-2">
                        {invoice.payment_details.installments.map((installment, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Installment {index + 1} (Due: {new Date(installment.due_date).toLocaleDateString()})
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-900 dark:text-white">${installment.amount.toFixed(2)}</span>
                              {installment.paid ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    <button
                      onClick={() => downloadInvoiceDocument(invoice._id)}
                      className="bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      title="Download PDF Invoice"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Issued Date</label>
                    <p className="text-sm text-zinc-900 dark:text-white">{new Date(selectedInvoice.issued_date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Rental Period</label>
                  <div className="bg-zinc-50 dark:bg-zinc-700 p-3 rounded-md">
                    <p className="text-sm text-zinc-900 dark:text-white">
                      Start: {new Date(selectedInvoice.rental_period.start_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-white">
                      End: {new Date(selectedInvoice.rental_period.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-white">
                      Total Days: {selectedInvoice.rental_period.total_days}
                    </p>
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

                {selectedInvoice.notes && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Notes</label>
                    <p className="text-sm text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-700 p-3 rounded-md">
                      {selectedInvoice.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInvoices;
