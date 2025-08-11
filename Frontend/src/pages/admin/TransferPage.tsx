import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ArrowLeft, Package, CheckCircle, AlertCircle } from 'lucide-react';

const TransferPage: React.FC = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const navigate = useNavigate();
  const [transferStatus, setTransferStatus] = useState('draft');

  const transfer = {
    id: 'PICKUP/OUT/0001',
    customer: 'John Doe',
    sourceLocation: 'Warehouse A',
    destinationLocation: 'Customer Location',
    scheduleDate: '2024-01-20',
    responsible: 'Delivery Team',
    products: [{ name: 'MacBook Pro 16"', quantity: 1, price: 500 }],
    total: 500
  };

  const statusWorkflow = [
    { id: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { id: 'waiting', label: 'Waiting', color: 'bg-yellow-500' },
    { id: 'ready', label: 'Ready', color: 'bg-blue-500' },
    { id: 'done', label: 'Done', color: 'bg-green-500' }
  ];

  return (
    <Layout title={`Transfer ${transfer.id}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/admin/transfers')} className="flex items-center space-x-2 text-gray-600">
            <ArrowLeft size={20} />
            <span>Back to Transfers</span>
          </button>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button className="btn-primary flex items-center space-x-2">
                <Package size={16} />
                <span>Create</span>
              </button>
              <span className="font-medium">Transfer</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                Check Availability
              </button>
              <button 
                onClick={() => setTransferStatus('ready')}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                Confirm
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-6">
            {statusWorkflow.map((status, index) => (
              <div key={status.id} className="flex items-center">
                <div className={`px-3 py-1 rounded-lg text-white text-sm font-medium ${status.color} ${
                  transferStatus === status.id ? 'ring-2 ring-offset-2 ring-yellow-400' : ''
                }`}>
                  {status.label}
                </div>
                {index < statusWorkflow.length - 1 && <div className="w-4 h-0.5 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input type="text" value={transfer.customer} className="input-field" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Location</label>
                <input type="text" value={transfer.sourceLocation} className="input-field" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Location</label>
                <input type="text" value={transfer.destinationLocation} className="input-field" readOnly />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule & Responsibility</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date</label>
                <input type="date" value={transfer.scheduleDate} className="input-field" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsible</label>
                <input type="text" value={transfer.responsible} className="input-field" readOnly />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Lines</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Price</th>
                </tr>
              </thead>
              <tbody>
                {transfer.products.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">{product.quantity}</td>
                    <td className="py-3 px-4 text-right">₹{product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <div className="text-lg font-bold">Total: ₹{transfer.total}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransferPage;
