import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, DollarSign, Users, Calendar } from 'lucide-react';

const PricelistManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pricelists');

  const pricelists = [
    {
      id: 'PL001',
      name: 'Standard Pricing',
      customerSegment: 'Regular Customers',
      productsCount: 25,
      status: 'active',
      createdDate: '2024-01-01',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'PL002',
      name: 'Premium Pricing',
      customerSegment: 'Enterprise Customers',
      productsCount: 30,
      status: 'active',
      createdDate: '2024-01-05',
      lastUpdated: '2024-01-10'
    },
    {
      id: 'PL003',
      name: 'Student Discount',
      customerSegment: 'Students',
      productsCount: 15,
      status: 'draft',
      createdDate: '2024-01-12',
      lastUpdated: '2024-01-12'
    }
  ];

  const pricingRules = [
    {
      id: 'R001',
      category: 'Electronics',
      period: 'Daily',
      basePrice: '₹500',
      discount: '10%',
      minDuration: '1 day',
      maxDuration: '30 days'
    },
    {
      id: 'R002',
      category: 'Electronics',
      period: 'Weekly',
      basePrice: '₹3000',
      discount: '15%',
      minDuration: '1 week',
      maxDuration: '12 weeks'
    },
    {
      id: 'R003',
      category: 'Furniture',
      period: 'Monthly',
      basePrice: '₹2000',
      discount: '20%',
      minDuration: '1 month',
      maxDuration: '12 months'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'draft': return 'bg-yellow-600 text-white';
      case 'inactive': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <Layout title="Pricelist Management" showTabs={true} activeTab="setting">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Pricelist Management</h2>
            <p className="text-gray-400">Manage pricing strategies and customer segments</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            <span>Create Pricelist</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 border border-gray-600 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('pricelists')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pricelists'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Pricelists
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rules'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Pricing Rules
          </button>
        </div>

        {/* Pricelists Tab */}
        {activeTab === 'pricelists' && (
          <div className="space-y-4">
            {pricelists.map(pricelist => (
              <div key={pricelist.id} className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <DollarSign className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{pricelist.name}</h3>
                      <p className="text-gray-400">{pricelist.customerSegment}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pricelist.status)}`}>
                      {pricelist.status.charAt(0).toUpperCase() + pricelist.status.slice(1)}
                    </span>
                    <button className="p-2 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-colors">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="text-gray-400" size={16} />
                    <span className="text-gray-300 text-sm">Products: {pricelist.productsCount}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-gray-400" size={16} />
                    <span className="text-gray-300 text-sm">Created: {pricelist.createdDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-gray-400" size={16} />
                    <span className="text-gray-300 text-sm">Updated: {pricelist.lastUpdated}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm">
                    Clone Pricelist
                  </button>
                  {pricelist.status === 'active' && (
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pricing Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Global Pricing Rules</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus size={20} />
                <span>Add Rule</span>
              </button>
            </div>

            <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="text-left text-gray-300 font-medium py-3 px-4">Category</th>
                      <th className="text-left text-gray-300 font-medium py-3 px-4">Period</th>
                      <th className="text-left text-gray-300 font-medium py-3 px-4">Base Price</th>
                      <th className="text-left text-gray-300 font-medium py-3 px-4">Discount</th>
                      <th className="text-left text-gray-300 font-medium py-3 px-4">Min Duration</th>
                      <th className="text-left text-gray-300 font-medium py-3 px-4">Max Duration</th>
                      <th className="text-center text-gray-300 font-medium py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingRules.map((rule, index) => (
                      <tr key={rule.id} className="border-b border-gray-700 last:border-b-0">
                        <td className="py-4 px-4 text-white font-medium">{rule.category}</td>
                        <td className="py-4 px-4 text-gray-300">{rule.period}</td>
                        <td className="py-4 px-4 text-blue-400 font-medium">{rule.basePrice}</td>
                        <td className="py-4 px-4 text-green-400">{rule.discount}</td>
                        <td className="py-4 px-4 text-gray-300">{rule.minDuration}</td>
                        <td className="py-4 px-4 text-gray-300">{rule.maxDuration}</td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center space-x-2">
                            <button className="p-2 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-colors">
                              <Edit size={16} />
                            </button>
                            <button className="p-2 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Pricing Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Seasonal Pricing</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Peak Season (Dec-Jan)</span>
                    <span className="text-red-400 font-medium">+25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Low Season (Mar-May)</span>
                    <span className="text-green-400 font-medium">-15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Regular Season</span>
                    <span className="text-gray-400">Base Price</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Configure Seasonal Rates
                </button>
              </div>

              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Late Return Penalties</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">1-2 days late</span>
                    <span className="text-yellow-400 font-medium">10% per day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">3-7 days late</span>
                    <span className="text-orange-400 font-medium">15% per day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">7+ days late</span>
                    <span className="text-red-400 font-medium">25% per day</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  Update Penalty Rules
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PricelistManagement;