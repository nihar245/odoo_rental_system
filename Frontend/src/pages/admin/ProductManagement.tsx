import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';

const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'electronics',
    dailyRate: 0,
    hourlyRate: 0,
    image: '',
    description: '',
    count: 0,
  });
  const [newProductImage, setNewProductImage] = useState<File | null>(null);

  type UIProduct = {
    id: string;
    name: string;
    category: string;
    status: 'available' | 'rented' | 'maintenance' | 'unavailable';
    stock: number;
    dailyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    hourlyRate: number;
    totalRentals: number;
    revenue: string;
    image: string;
  };

  const [products, setProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'vehicles', name: 'Vehicles' },
    { id: 'tools', name: 'Tools' },
    { id: 'sports', name: 'Sports Equipment' }
  ];

  const fetchProducts = async (category: string) => {
    try {
      setLoading(true);
      const qs = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetch(`http://localhost:8000/api/v1/products${qs}`);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || 'Failed to fetch products');
      const list: UIProduct[] = (payload?.data?.products || []).map((p: any) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        status: (p.quantity || 0) > 0 ? 'available' : 'unavailable',
        stock: p.quantity || 0,
        dailyRate: p.dailyRate || 0,
        weeklyRate: p.weeklyRate || 0,
        monthlyRate: p.monthlyRate || 0,
        hourlyRate: p.hourlyRate || 0,
        totalRentals: 0,
        revenue: '₹0',
        image: p.image_url || '',
      }));
      setProducts(list);
    } catch (e: any) {
      alert(e?.message || 'Unable to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-600 text-white';
      case 'rented': return 'bg-blue-600 text-white';
      case 'maintenance': return 'bg-yellow-600 text-white';
      case 'unavailable': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const applyStockChanges = async () => {
    try {
      await Promise.all(
        Object.entries(stockEdits).map(([pid, qty]) =>
          fetch(`http://localhost:8000/api/v1/products/${pid}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: Math.max(0, qty) }),
          })
        )
      );
      setStockEdits({});
      await fetchProducts(selectedCategory);
    } catch (e: any) {
      alert(e?.message || 'Failed to update stock');
    } finally {
      setShowStockModal(false);
    }
  };

  const getEffectiveStock = (_pid: string, defaultStock: number) => {
    return defaultStock;
  };

  const persistCatalogAdd = async () => {
    try {
      const fd = new FormData();
      fd.append('name', newProduct.name);
      fd.append('description', newProduct.description);
      fd.append('category', newProduct.category);
      fd.append('quantity', String(Math.max(0, newProduct.count)));
      if (newProduct.hourlyRate) fd.append('hourlyRate', String(newProduct.hourlyRate));
      if (newProduct.dailyRate) fd.append('dailyRate', String(newProduct.dailyRate));
      if (newProductImage) fd.append('image', newProductImage);

      const res = await fetch('http://localhost:8000/api/v1/products', {
        method: 'POST',
        body: fd,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || 'Failed to add product');
      setShowAddModal(false);
      setNewProduct({ name: '', category: 'electronics', dailyRate: 0, hourlyRate: 0, image: '', description: '', count: 0 });
      setNewProductImage(null);
      await fetchProducts(selectedCategory);
    } catch (e: any) {
      alert(e?.message || 'Unable to add product');
    }
  };

  return (
    <Layout title="Product Management" showTabs={true} activeTab="products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Product Management</h2>
            <p className="text-gray-400">Manage your rental inventory and pricing</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <div className="flex space-x-2">
            <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-700 transition-colors">Add Product</button>
            <button onClick={() => { setStockEdits({}); setShowStockModal(true); }} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">Update Stock</button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-400 transition-colors dark:bg-gray-800 dark:border-gray-700">
              <div className="flex">
                {/* Product Image */}
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-400 text-sm">{product.category} • ID: {product.id}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Stock</p>
                  <p className="text-gray-900 dark:text-white font-medium">{getEffectiveStock(product.id, product.stock)} units</p>
                    </div>
                    <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Total Rentals</p>
                  <p className="text-gray-900 dark:text-white font-medium">{product.totalRentals}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-400">Daily: </span>
                      <span className="text-blue-400 font-medium">₹{product.dailyRate}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Daily</p>
                    <p className="text-gray-900 dark:text-white font-medium">₹{product.dailyRate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Weekly</p>
                    <p className="text-gray-900 dark:text-white font-medium">₹{product.weeklyRate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Monthly</p>
                    <p className="text-gray-900 dark:text-white font-medium">₹{product.monthlyRate}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300 text-sm">Total Revenue</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">{product.revenue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl text-gray-300 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Stock</h3>
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="p-3 rounded border border-gray-200 dark:border-gray-800">
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">{p.name}</div>
                    <input
                      type="number"
                      defaultValue={getEffectiveStock(p.id, p.stock)}
                      onChange={(e) => setStockEdits((prev) => ({ ...prev, [p.id]: Math.max(0, parseInt(e.target.value || '0')) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end space-x-2">
              <button onClick={() => setShowStockModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={applyStockChanges} className="btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Product</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct,name:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProduct.category} onChange={(e)=>setNewProduct({...newProduct,category:e.target.value})}>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="tools">Tools</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Daily Rate</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProduct.dailyRate} onChange={(e)=>setNewProduct({...newProduct,dailyRate:parseInt(e.target.value||'0')})} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Hourly Rate</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProduct.hourlyRate} onChange={(e)=>setNewProduct({...newProduct,hourlyRate:parseInt(e.target.value||'0')})} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
                <input type="file" accept="image/*" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" onChange={(e)=>setNewProductImage(e.target.files?.[0] || null)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProduct.description} onChange={(e)=>setNewProduct({...newProduct,description:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Count</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProduct.count} onChange={(e)=>setNewProduct({...newProduct,count:parseInt(e.target.value||'0')})} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end space-x-2">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={persistCatalogAdd} className="btn-primary">Add Product</button>
            </div>
            <p className="text-xs text-gray-500 mt-2">If Count is 0, availability should be Unavailable. (Handled in backend in production.)</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductManagement;