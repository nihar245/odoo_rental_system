import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Download, FileText, BarChart3, PieChart, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const reportTypes = [
    {
      id: 'rental-summary',
      title: 'Rental Summary Report',
      description: 'Overview of all rental activities, revenue, and key metrics',
      icon: BarChart3,
      color: 'bg-blue-600'
    },
    {
      id: 'product-performance',
      title: 'Product Performance Report',
      description: 'Most rented products, utilization rates, and revenue by product',
      icon: PieChart,
      color: 'bg-green-600'
    },
    {
      id: 'customer-analysis',
      title: 'Customer Analysis Report',
      description: 'Customer segments, top customers, and rental patterns',
      icon: Users,
      color: 'bg-purple-600'
    },
    {
      id: 'financial-report',
      title: 'Financial Report',
      description: 'Revenue breakdown, payment status, and financial analytics',
      icon: DollarSign,
      color: 'bg-orange-600'
    },
    {
      id: 'inventory-report',
      title: 'Inventory Report',
      description: 'Stock levels, availability, and inventory management',
      icon: FileText,
      color: 'bg-red-600'
    },
    {
      id: 'trends-analysis',
      title: 'Trends & Forecasting',
      description: 'Rental trends, seasonal patterns, and demand forecasting',
      icon: TrendingUp,
      color: 'bg-indigo-600'
    }
  ];

  const quickStats = [
    { label: 'Total Revenue', value: '₹2,45,000', change: '+12%', positive: true },
    { label: 'Active Rentals', value: '32', change: '+8%', positive: true },
    { label: 'Total Customers', value: '156', change: '+15%', positive: true },
    { label: 'Return Rate', value: '94%', change: '+2%', positive: true }
  ];

  const recentReports = [
    {
      name: 'Monthly Revenue Report - January 2024',
      type: 'Financial Report',
      generatedDate: '2024-01-31',
      format: 'PDF',
      size: '2.4 MB'
    },
    {
      name: 'Top Products Analysis - Q1 2024',
      type: 'Product Performance',
      generatedDate: '2024-01-30',
      format: 'XLSX',
      size: '1.8 MB'
    },
    {
      name: 'Customer Segmentation Report',
      type: 'Customer Analysis',
      generatedDate: '2024-01-29',
      format: 'CSV',
      size: '856 KB'
    }
  ];

  const handleGenerateReport = (reportId: string) => {
    alert(`Generating ${reportId} report in ${selectedFormat.toUpperCase()} format for ${selectedPeriod.replace('_', ' ')}`);
  };

  const handleDownloadReport = (reportName: string) => {
    alert(`Downloading: ${reportName}`);
  };

  return (
    <Layout title="Reports & Analytics" showTabs={true} activeTab="reporting">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
            <p className="text-gray-400">Generate detailed reports and analyze rental data</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{stat.label}</span>
                <span className={`text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Report Configuration */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Report Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="period" className="block text-gray-300 mb-2">Time Period</label>
              <select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_quarter">Last Quarter</option>
                <option value="last_year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label htmlFor="format" className="block text-gray-300 mb-2">Export Format</label>
              <select
                id="format"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        </div>

        {/* Available Reports */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Available Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map(report => (
              <div key={report.id} className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <report.icon className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">{report.title}</h4>
                    <p className="text-gray-400 text-sm">{report.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateReport(report.id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  <span>Generate Report</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Reports</h3>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-600 rounded">
                    <FileText className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{report.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{new Date(report.generatedDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{report.format}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadReport(report.name)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
            <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto text-gray-500 mb-2" size={48} />
                <p className="text-gray-500">Revenue chart will be displayed here</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Product Distribution</h3>
            <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="mx-auto text-gray-500 mb-2" size={48} />
                <p className="text-gray-500">Product distribution chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;