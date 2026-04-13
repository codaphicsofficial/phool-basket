import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Package, 
  TrendingUp, 
  IndianRupee, 
  Users,
  Trash2,
  Edit3,
  Upload,
  X,
  MapPin,
  Clock,
  CheckCircle,
  Tag
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Category } from '../types';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories'>('products');
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });

  // Category Form State
  const [newCat, setNewCat] = useState({ name: '', img: '', note: '' });
  const [catImagePreview, setCatImagePreview] = useState<string | null>(null);

  const handleCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCatImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      const [p, o, c] = await Promise.all([
        firebaseService.getProducts(),
        firebaseService.getOrders(),
        firebaseService.getCategories()
      ]);
      
      setProducts(p.filter(prod => prod.vendorId === user.uid));
      setOrders(o.filter(order => order.items.some(item => item.vendorId === user.uid)));
      setCategories(c);
      
      if (c.length > 0 && !newProduct.category) {
        setNewProduct(prev => ({ ...prev, category: c[0].name }));
      }
    };
    
    fetchData();

    // Real-time subscriptions
    const unsubProducts = firebaseService.subscribeToProducts((allProds) => {
      setProducts(allProds.filter(p => p.vendorId === user.uid));
    });
    
    const unsubOrders = firebaseService.subscribeToOrders(undefined, (allOrders) => {
      setOrders(allOrders.filter(o => o.items.some(item => item.vendorId === user.uid)));
    });

    const unsubCategories = firebaseService.subscribeToCategories(setCategories);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCategories();
    };
  }, [user]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name || (!newCat.img && !catImagePreview)) return;
    await firebaseService.saveCategory({
      ...newCat,
      img: catImagePreview || newCat.img
    });
    setNewCat({ name: '', img: '', note: '' });
    setCatImagePreview(null);
  };

  const deleteCategory = async (id: string) => {
    await firebaseService.deleteCategory(id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);
    try {
      let finalImageUrl = imagePreview || `https://picsum.photos/seed/${newProduct.name}/800/600`;

      await firebaseService.saveProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        vendorId: user.uid,
        vendorName: user.displayName || 'Unknown Seller',
        images: [finalImageUrl],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString()
      });

      setIsAdding(false);
      setImageFile(null);
      setImagePreview(null);
      setNewProduct({ name: '', description: '', price: '', category: categories[0]?.name || '', stock: '' });
    } catch (error) {
      console.error("Error adding product", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await firebaseService.deleteProduct(id);
  };

  const sellerTotalSales = orders.reduce((acc, order) => {
    const sellerItems = order.items.filter((item: any) => item.vendorId === user?.uid);
    const sellerAmount = sellerItems.reduce((sum: number, item: any) => sum + item.price, 0);
    return acc + sellerAmount;
  }, 0);

  const uniqueCustomers = new Set(orders.map(o => o.userId)).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500">Manage your inventory and track sales.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-orange text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-orange-dark transition-all shadow-lg shadow-brand-orange/20"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales', value: `₹${sellerTotalSales.toLocaleString()}`, icon: IndianRupee, color: 'bg-brand-green/10 text-brand-green' },
          { label: 'Active Products', value: products.length, icon: Package, color: 'bg-brand-purple/10 text-brand-purple' },
          { label: 'Total Orders', value: orders.length, icon: TrendingUp, color: 'bg-brand-orange/10 text-brand-orange' },
          { label: 'Customers', value: uniqueCustomers, icon: Users, color: 'bg-brand-purple/10 text-brand-purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('products')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'products' ? 'text-brand-purple' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Products
          {activeTab === 'products' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-purple rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'orders' ? 'text-brand-purple' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Orders
          {activeTab === 'orders' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-purple rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'categories' ? 'text-brand-purple' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Categories
          {activeTab === 'categories' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-purple rounded-full" />}
        </button>
      </div>

      {activeTab === 'products' ? (
        /* Product List */
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Your Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-bold text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{product.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-orange-600"><Edit3 size={18} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        /* Orders List */
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-[40px] p-12 border-2 border-dashed border-gray-100 text-center space-y-4">
              <p className="text-lg font-bold text-gray-900">No orders received yet</p>
              <p className="text-gray-500 text-sm">When customers buy your products, they will appear here.</p>
            </div>
          ) : (
            orders.map((order) => {
              const sellerItems = order.items.filter((i: any) => i.vendorId === user?.uid);
              const sellerTotal = sellerItems.reduce((sum: number, i: any) => sum + i.price, 0);
              
              return (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                        <Package size={28} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">
                          Order #{order.id?.slice(-6).toUpperCase() || 'N/A'}
                        </p>
                        <h4 className="font-bold text-gray-900">
                          {sellerItems.map((i: any) => i.name).join(', ')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Customer: {order.userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center gap-2">
                      <p className="text-xl font-black text-gray-900">₹{sellerTotal.toLocaleString()}</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                        order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {order.status === 'delivered' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                      <div className="flex items-center gap-2 text-orange-600">
                        <MapPin size={16} />
                        <h5 className="text-xs font-black uppercase tracking-widest">Shipping Address</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                          <p className="text-gray-600">{order.shippingAddress.street}</p>
                          <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                        </div>
                        <div className="md:text-right">
                          <p className="text-gray-500">Contact Number</p>
                          <p className="font-bold text-gray-900">{order.shippingAddress.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* Category Management */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">Add New Category</h3>
              <p className="text-sm text-gray-500">Create a new category for the platform.</p>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 px-1">Category Name</label>
                <input 
                  type="text" 
                  value={newCat.name}
                  onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                  placeholder="e.g. Birthday Gifts"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 px-1">Category Image</label>
                <div className="flex items-center gap-4">
                  {catImagePreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100">
                      <img src={catImagePreview} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setCatImagePreview(null)}
                        className="absolute top-0 right-0 bg-black/50 text-white p-1 rounded-bl-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
                      <Upload size={20} className="text-gray-400" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleCatImageChange} />
                    </label>
                  )}
                  <div className="flex-1">
                    <input 
                      type="url" 
                      value={newCat.img}
                      onChange={(e) => setNewCat({...newCat, img: e.target.value})}
                      placeholder="Or paste image URL"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 px-1">Note (Optional)</label>
                <input 
                  type="text" 
                  value={newCat.note}
                  onChange={(e) => setNewCat({...newCat, note: e.target.value})}
                  placeholder="e.g. Only for selected locations"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
              >
                Add Category
              </button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">Existing Categories</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 border border-gray-100 shadow-sm">
                      <img src={cat.img} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{cat.name}</p>
                      {cat.note && <p className="text-[10px] text-gray-400 line-clamp-1">{cat.note}</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className="w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900">Add Product</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-900">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Product Name</label>
                <input 
                  required
                  type="text" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Product Image</label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Description</label>
                <textarea 
                  required
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 h-24"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Category</label>
                <select 
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Price (₹)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Stock</label>
                  <input 
                    required
                    type="number" 
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : 'Publish Product'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
