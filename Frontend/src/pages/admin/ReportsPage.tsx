import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Download, FileText, Calendar, Users, Loader2, FileDown } from 'lucide-react';

interface OrderSummary {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
  orderTime: string;
  orderDateTime: string;
  rentalPeriod: {
    startDate: string;
    endDate: string;
    duration: string;
  };
  pickupAddress: string;
  deliveryAddress: string;
}

interface DatewiseSummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  orders: OrderSummary[];
}

interface OrderReport {
  period: string;
  dateRange: { start: string; end: string };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    approvedOrders: number;
    completedOrders: number;
  };
  datewiseSummary: DatewiseSummary[];
  orderDetails: OrderSummary[];
  generatedAt: string;
}

interface DashboardData {
  summary: {
    totalProducts: number;
    totalCustomers: number;
    totalRentals: number;
    activeRentals: number;
  };
  recentOrders: Array<{
    customerName: string;
    customerEmail: string;
    productName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

const ReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [orderReport, setOrderReport] = useState<OrderReport | null>(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/reports/dashboard', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/v1/reports/order-summary?period=${selectedPeriod}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderReport(data.data);
      } else {
        console.error('Failed to generate order summary report');
        alert('Failed to generate order summary report');
      }
    } catch (error) {
      console.error('Error generating order summary report:', error);
      alert('Error generating order summary report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!orderReport) return;

    // Create a formatted document content
    const documentContent = generateDocumentContent(orderReport);
    
    // Create and download the document
    downloadDocument(documentContent, `Order_Summary_${selectedPeriod.replace('_', '_')}.txt`);
  };

  const generateDocumentContent = (report: OrderReport): string => {
    let content = '';
    
    // Header
    content += '='.repeat(80) + '\n';
    content += '                    ORDER SUMMARY REPORT\n';
    content += '='.repeat(80) + '\n\n';
    
    // Report Info
    content += `Report Period: ${report.period.replace('_', ' ').toUpperCase()}\n`;
    content += `Date Range: ${report.dateRange.start} to ${report.dateRange.end}\n`;
    content += `Generated On: ${report.generatedAt}\n\n`;
    
    // Summary
    content += 'SUMMARY:\n';
    content += '-'.repeat(40) + '\n';
    content += `Total Orders: ${report.summary.totalOrders}\n`;
    content += `Total Revenue: ₹${report.summary.totalRevenue.toFixed(2)}\n`;
    content += `Pending Orders: ${report.summary.pendingOrders}\n`;
    content += `Approved Orders: ${report.summary.approvedOrders}\n`;
    content += `Completed Orders: ${report.summary.completedOrders}\n\n`;
    
    // Datewise Summary
    content += 'DATEWISE SUMMARY:\n';
    content += '='.repeat(80) + '\n';
    
    report.datewiseSummary.forEach(dateGroup => {
      content += `\nDate: ${dateGroup.date}\n`;
      content += `Total Orders: ${dateGroup.totalOrders} | Total Revenue: ₹${dateGroup.totalRevenue.toFixed(2)}\n`;
      content += '-'.repeat(60) + '\n';
      
      dateGroup.orders.forEach((order, index) => {
        content += `${index + 1}. Order ID: ${order.orderId}\n`;
        content += `   Customer: ${order.customerName} (${order.customerEmail})\n`;
        content += `   Phone: ${order.customerPhone}\n`;
        content += `   Product: ${order.productName} x${order.quantity}\n`;
        content += `   Amount: ₹${order.totalAmount.toFixed(2)}\n`;
        content += `   Status: ${order.status.toUpperCase()}\n`;
        content += `   Payment: ${order.paymentStatus.toUpperCase()}\n`;
        content += `   Order Time: ${order.orderTime}\n`;
        content += `   Rental Period: ${order.rentalPeriod.duration}\n`;
        content += `   Pickup: ${order.pickupAddress}\n`;
        content += `   Delivery: ${order.deliveryAddress}\n`;
        content += '\n';
      });
    });
    
    // Detailed Order List
    content += 'DETAILED ORDER LIST:\n';
    content += '='.repeat(80) + '\n\n';
    
    report.orderDetails.forEach((order, index) => {
      content += `${index + 1}. Order ID: ${order.orderId}\n`;
      content += `   Customer: ${order.customerName} (${order.customerEmail})\n`;
      content += `   Phone: ${order.customerPhone}\n`;
      content += `   Product: ${order.productName} x${order.quantity}\n`;
      content += `   Amount: ₹${order.totalAmount.toFixed(2)}\n`;
      content += `   Status: ${order.status.toUpperCase()}\n`;
      content += `   Payment: ${order.paymentStatus.toUpperCase()}\n`;
      content += `   Order Date: ${order.orderDate}\n`;
      content += `   Order Time: ${order.orderTime}\n`;
      content += `   Rental Period: ${order.rentalPeriod.duration}\n`;
      content += `   Pickup: ${order.pickupAddress}\n`;
      content += `   Delivery: ${order.deliveryAddress}\n`;
      content += '\n' + '-'.repeat(60) + '\n\n';
    });
    
    return content;
  };

  const downloadDocument = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout title="Reports & Analytics" showTabs={true} activeTab="reporting">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-500">Order Summary Reports</h2>
            <p className="text-gray-400">Generate detailed order summaries with customer and rental information</p>
          </div>
        </div>

                       {/* Quick Stats from Dashboard */}
               {dashboardData && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-6">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-zinc-400 text-sm">Total Products</span>
                     </div>
                     <p className="text-2xl font-bold text-white">{dashboardData.summary.totalProducts}</p>
                   </div>
                   <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-6">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-zinc-400 text-sm">Total Customers</span>
                     </div>
                     <p className="text-2xl font-bold text-white">{dashboardData.summary.totalCustomers}</p>
                   </div>
                   <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-6">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-zinc-400 text-sm">Total Rentals</span>
                     </div>
                     <p className="text-2xl font-bold text-white">{dashboardData.summary.totalRentals}</p>
                   </div>
                   <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-6">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-zinc-400 text-sm">Active Rentals</span>
                     </div>
                     <p className="text-2xl font-bold text-white">{dashboardData.summary.activeRentals}</p>
                   </div>
                 </div>
               )}

        {/* Report Configuration */}
        <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Generate Order Summary Report</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="period" className="block text-zinc-300 mb-2">Time Period</label>
                                   <select
                       id="period"
                       value={selectedPeriod}
                       onChange={(e) => setSelectedPeriod(e.target.value)}
                       className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                     >
                       <option value="last_7_days">Last 7 Days</option>
                       <option value="last_30_days">Last 30 Days</option>
                       <option value="last_quarter">Last Quarter</option>
                       <option value="last_year">Last Year</option>
                     </select>
                   </div>
                   <button
                     onClick={handleGenerateReport}
                     disabled={loading}
                     className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                   >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <FileText size={20} />
              )}
              <span>{loading ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        {/* Generated Report Display */}
        {orderReport && (
                  <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Order Summary Report - {selectedPeriod.replace('_', ' ').toUpperCase()}
              </h3>
              <p className="text-zinc-400">
                {orderReport.dateRange.start} to {orderReport.dateRange.end}
              </p>
            </div>
                                 <button
                       onClick={handleDownloadReport}
                       className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                     >
                       <FileDown size={20} />
                       <span>Download Report</span>
                     </button>
          </div>

                      {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-zinc-700 p-4 rounded-lg text-center">
              <p className="text-zinc-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{orderReport.summary.totalOrders}</p>
            </div>
                                 <div className="bg-zinc-700 p-4 rounded-lg text-center">
                       <p className="text-zinc-400 text-sm">Total Revenue</p>
                       <p className="text-emerald-400 text-2xl font-bold">{formatCurrency(orderReport.summary.totalRevenue)}</p>
                     </div>
                     <div className="bg-zinc-700 p-4 rounded-lg text-center">
                       <p className="text-zinc-400 text-sm">Pending</p>
                       <p className="text-2xl font-bold text-yellow-400">{orderReport.summary.pendingOrders}</p>
                     </div>
                     <div className="bg-zinc-700 p-4 rounded-lg text-center">
                       <p className="text-zinc-400 text-sm">Approved</p>
                       <p className="text-2xl font-bold text-emerald-400">{orderReport.summary.approvedOrders}</p>
                     </div>
            <div className="bg-zinc-700 p-4 rounded-lg text-center">
              <p className="text-zinc-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{orderReport.summary.completedOrders}</p>
            </div>
          </div>

                               {/* Datewise Summary */}
                   <div className="space-y-4">
                     <h4 className="text-lg font-semibold text-white">Datewise Summary</h4>
                     {orderReport.datewiseSummary.map((dateGroup, index) => (
                       <div key={index} className="bg-zinc-700 rounded-lg p-4">
                         <div className="flex justify-between items-center mb-3">
                           <h5 className="text-white font-semibold">{dateGroup.date}</h5>
                           <div className="text-right">
                             <p className="text-zinc-300 text-sm">{dateGroup.totalOrders} orders</p>
                             <p className="text-emerald-400 font-semibold">{formatCurrency(dateGroup.totalRevenue)}</p>
                           </div>
                         </div>

                         <div className="space-y-2">
                           {dateGroup.orders.map((order, orderIndex) => (
                             <div key={orderIndex} className="bg-zinc-600 rounded p-3">
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                 <div>
                                   <p className="text-zinc-400 text-xs">Customer</p>
                                   <p className="text-white font-medium">{order.customerName}</p>
                                   <p className="text-zinc-300 text-sm">{order.customerEmail}</p>
                                 </div>
                                 <div>
                                   <p className="text-zinc-400 text-xs">Product</p>
                                   <p className="text-white font-medium">{order.productName}</p>
                                   <p className="text-zinc-300 text-sm">Qty: {order.quantity}</p>
                                 </div>
                                 <div>
                                   <p className="text-zinc-400 text-xs">Amount & Status</p>
                                   <p className="text-emerald-400 font-medium">{formatCurrency(order.totalAmount)}</p>
                                   <p className="text-zinc-300 text-sm capitalize">{order.status}</p>
                                 </div>
                                 <div>
                                   <p className="text-gray-400 text-xs">Time</p>
                                   <p className="text-white font-medium">{order.orderTime}</p>
                                   <p className="text-zinc-300 text-sm">{order.rentalPeriod.duration}</p>
                                 </div>
                                 <div>
                                   <p className="text-zinc-400 text-xs">Time</p>
                                   <p className="text-white font-medium">{order.orderTime}</p>
                                   <p className="text-zinc-300 text-sm">{order.rentalPeriod.duration}</p>
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>

            <div className="mt-6 pt-4 border-t border-gray-600">
              <p className="text-gray-400 text-sm">
                Generated on: {orderReport.generatedAt}
              </p>
            </div>
          </div>
        )}

                       {/* Recent Orders from Dashboard */}
               {dashboardData && (
                 <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-6">
                   <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
                   <div className="space-y-3">
                     {dashboardData.recentOrders.map((order, index) => (
                       <div key={index} className="flex justify-between items-center p-3 bg-zinc-700 rounded">
                         <div>
                           <p className="text-white font-medium">{order.customerName}</p>
                           <p className="text-zinc-400 text-sm">{order.customerEmail}</p>
                           <p className="text-zinc-300 text-sm">{order.productName}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-emerald-400">{formatCurrency(order.totalAmount)}</p>
                           <p className="text-zinc-400 text-sm capitalize">{order.status}</p>
                           <p className="text-zinc-400 text-xs">{formatDate(order.createdAt)}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
      </div>
    </Layout>
  );
};

export default ReportsPage;