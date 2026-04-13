import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  ShieldAlert,
  ShieldCheck,
  Search,
  Database,
  Loader2,
  TrendingUp,
  IndianRupee,
  PieChart,
  BarChart3,
  Award,
  Download,
  FileText,
  Table as TableIcon,
  Calendar,
  Trash2,
  Plus,
  Image as ImageIcon,
  Tag,
  X,
  Upload
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { User, Product, Order, UserRole, Category } from '../types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Category Form State
  const [showCatForm, setShowCatForm] = useState(false);
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name || (!newCat.img && !catImagePreview)) return;
    await firebaseService.saveCategory({
      ...newCat,
      img: catImagePreview || newCat.img
    });
    setNewCat({ name: '', img: '', note: '' });
    setCatImagePreview(null);
    setShowCatForm(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [u, p, o, c] = await Promise.all([
        firebaseService.getAllUsers(),
        firebaseService.getProducts(),
        firebaseService.getOrders(),
        firebaseService.getCategories()
      ]);
      setUsers(u);
      setProducts(p);
      setOrders(o);
      setCategories(c);
      setLoading(false);
    };
    fetchData();
    
    // Real-time subscriptions
    const unsubUsers = firebaseService.subscribeToUsers(setUsers);
    const unsubProducts = firebaseService.subscribeToProducts(setProducts);
    const unsubCategories = firebaseService.subscribeToCategories(setCategories);
    const unsubOrders = firebaseService.subscribeToOrders(undefined, setOrders);

    return () => {
      unsubUsers();
      unsubProducts();
      unsubCategories();
      unsubOrders();
    };
  }, []);

  const deleteCategory = async (id: string) => {
    await firebaseService.deleteCategory(id);
  };

  const totalSales = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  const platformMargin = totalSales * 0.1; // Assuming a 10% platform fee/margin

  // Calculate top selling products
  const productSalesMap: { [key: string]: { id: string, name: string, amount: number, count: number } } = {};
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { id: item.productId, name: item.name, amount: 0, count: 0 };
      }
      productSalesMap[item.productId].amount += item.price;
      productSalesMap[item.productId].count += 1;
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const filterOrdersByRange = () => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const filteredOrders = filterOrdersByRange();
    const total = filteredOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const margin = total * 0.1;

    doc.setFontSize(20);
    doc.text(`Phool Basket - SALES REPORT`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    doc.text(`Total Sales: ₹${total.toFixed(2)}`, 14, 46);
    doc.text(`Platform Margin (10%): ₹${margin.toFixed(2)}`, 14, 54);
    doc.text(`Total Transactions: ${filteredOrders.length}`, 14, 62);

    const tableData = filteredOrders.map(o => [
      new Date(o.createdAt).toLocaleDateString(),
      o.userEmail,
      o.items.map((i: any) => i.name).join(', '),
      o.shippingAddress ? `${o.shippingAddress.fullName}, ${o.shippingAddress.city}` : 'N/A',
      `₹${o.totalAmount.toFixed(2)}`,
      o.status
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Date', 'User', 'Items', 'Shipping', 'Amount', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: 'F97316' } as any
    });

    doc.save(`phoolbasket-report-${startDate}-to-${endDate}.pdf`);
  };

  const downloadExcel = () => {
    const filteredOrders = filterOrdersByRange();
    const data = filteredOrders.map(o => ({
      Date: new Date(o.createdAt).toLocaleString(),
      User: o.userEmail,
      Items: o.items.map((i: any) => i.name).join(', '),
      Shipping: o.shippingAddress ? `${o.shippingAddress.fullName}, ${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.state} - ${o.shippingAddress.zipCode}` : 'N/A',
      Amount: o.totalAmount,
      Status: o.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `phoolbasket-report-${startDate}-to-${endDate}.xlsx`);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const userData = users.find(u => u.uid === userId);
    if (userData) {
      await firebaseService.saveUser({ ...userData, role: newRole as UserRole });
      setUsers(await firebaseService.getAllUsers());
    }
  };

  const seedDemoData = async () => {
    if (!user) return;
    setIsSeeding(true);
    
    try {
      // 1. Seed Demo Sellers
      const demoSellers: User[] = [
        {
          uid: 'demo-seller-1',
          email: 'tech.store@demo.com',
          displayName: 'Quantum Tech Solutions',
          role: 'seller',
          photoURL: 'https://ui-avatars.com/api/?name=Quantum+Tech&background=orange&color=fff',
          createdAt: new Date().toISOString()
        },
        {
          uid: 'demo-seller-2',
          email: 'fashion.hub@demo.com',
          displayName: 'Elite Fashion Hub',
          role: 'seller',
          photoURL: 'https://ui-avatars.com/api/?name=Fashion+Hub&background=black&color=fff',
          createdAt: new Date().toISOString()
        }
      ];

      for (const seller of demoSellers) {
        await firebaseService.saveUser(seller);
      }

      // 2. Seed Demo Products
      const demoProducts: Partial<Product>[] = [
        {
          name: "Quantum Pro Headphones",
          description: "Next-gen noise cancellation with 40-hour battery life.",
          price: 24999,
          originalPrice: 29999,
          discount: 16,
          category: "Electronics",
          vendorId: 'demo-seller-1',
          vendorName: "Quantum Tech Solutions",
          images: ["https://picsum.photos/seed/headphones/800/600"],
          stock: 50,
          rating: 4.8,
          reviewCount: 124,
          createdAt: new Date().toISOString()
        },
        {
          name: "Minimalist Leather Watch",
          description: "Italian leather strap with sapphire crystal glass.",
          price: 14999,
          originalPrice: 17999,
          discount: 16,
          category: "Fashion",
          vendorId: 'demo-seller-2',
          vendorName: "Elite Fashion Hub",
          images: ["https://picsum.photos/seed/watch/800/600"],
          stock: 25,
          rating: 4.5,
          reviewCount: 89,
          createdAt: new Date().toISOString()
        },
        {
          name: "ErgoDesk Pro",
          description: "Electric standing desk with memory presets.",
          price: 45999,
          originalPrice: 49999,
          discount: 8,
          category: "Home & Office",
          vendorId: 'demo-seller-1',
          vendorName: "Quantum Tech Solutions",
          images: ["https://picsum.photos/seed/desk/800/600"],
          stock: 10,
          rating: 4.9,
          reviewCount: 45,
          createdAt: new Date().toISOString()
        },
        {
          name: "Smart Garden Kit",
          description: "Automated indoor herb garden with LED grow lights.",
          price: 9999,
          category: "Home & Living",
          vendorId: 'demo-seller-2',
          vendorName: "Elite Fashion Hub",
          images: ["https://picsum.photos/seed/garden/800/600"],
          stock: 100,
          rating: 4.2,
          reviewCount: 210,
          createdAt: new Date().toISOString()
        }
      ];

      for (const prod of demoProducts) {
        await firebaseService.saveProduct(prod);
      }

      // 3. Seed Demo Orders
      const allProducts = await firebaseService.getProducts();
      const demoOrders: Partial<Order>[] = [
        {
          userId: user.uid,
          userEmail: user.email,
          items: [
            {
              productId: allProducts[0].id,
              name: allProducts[0].name,
              price: allProducts[0].price,
              vendorId: allProducts[0].vendorId
            }
          ],
          totalAmount: allProducts[0].price,
          status: 'delivered',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
        },
        {
          userId: user.uid,
          userEmail: user.email,
          items: [
            {
              productId: allProducts[1].id,
              name: allProducts[1].name,
              price: allProducts[1].price,
              vendorId: allProducts[1].vendorId
            }
          ],
          totalAmount: allProducts[1].price,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      for (const order of demoOrders) {
        await firebaseService.saveOrder(order);
      }

      alert("Full demo database seeded successfully! Users, Products, and Orders are now live.");
    } catch (error) {
      console.error("Error seeding data", error);
      alert("Failed to seed demo data. Check console for details.");
    } finally {
      setIsSeeding(false);
    }
  };

  const clearAllData = async () => {
    setIsClearing(true);
    try {
      const [p, o, c] = await Promise.all([
        firebaseService.getProducts(),
        firebaseService.getOrders(),
        firebaseService.getCategories()
      ]);
      
      const deletePromises = [
        ...p.map(prod => firebaseService.deleteProduct(prod.id)),
        ...o.map(order => firebaseService.deleteOrder(order.id)),
        ...c.map(cat => firebaseService.deleteCategory(cat.id))
      ];
      
      await Promise.all(deletePromises);
      
      alert("Database cleared successfully (Products, Orders, Categories).");
    } catch (error) {
      console.error("Error clearing data", error);
      alert("Failed to clear data. Check console.");
    } finally {
      setIsClearing(false);
    }
  };

  const removeProduct = async (id: string) => {
    await firebaseService.deleteProduct(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Admin Panel</h1>
          <p className="text-gray-500">Platform-wide management and oversight.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearAllData}
            disabled={isClearing}
            className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100 transition-all disabled:opacity-50"
          >
            {isClearing ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
            Clear All
          </button>
          <button 
            onClick={seedDemoData}
            disabled={isSeeding}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-gray-900/10 disabled:opacity-50"
          >
            {isSeeding ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
            Seed Demo
          </button>
        </div>
      </div>

      {/* Report Generation Section */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Download className="text-brand-orange" />
              Sales Reports
            </h2>
            <p className="text-gray-500 text-sm">Generate and download platform performance reports.</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-1">From</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-orange" size={14} />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-orange transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-1">To</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-orange" size={14} />
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-orange transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={downloadPDF}
                className="bg-brand-orange text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-orange-dark transition-all shadow-lg shadow-brand-orange/20"
              >
                <FileText size={18} />
                PDF
              </button>
              <button 
                onClick={downloadExcel}
                className="bg-brand-green text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-green-dark transition-all shadow-lg shadow-brand-green/20"
              >
                <TableIcon size={18} />
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <p className="text-2xl font-black text-gray-900">₹{totalSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-green h-full w-[75%]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Platform Margin</p>
              <p className="text-2xl font-black text-brand-orange">₹{platformMargin.toLocaleString()}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-orange h-full w-[45%]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center">
              <PieChart size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Transactions</p>
              <p className="text-2xl font-black text-gray-900">{orders.length}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-purple h-full w-[60%]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-black text-gray-900">{users.length}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[85%]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Management */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Category Management</h3>
            <button 
              onClick={() => setShowCatForm(!showCatForm)}
              className="w-8 h-8 bg-purple-50 text-[#7d2e8e] rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={handleAddCategory} className="mb-6 space-y-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-purple-600 px-1">Category Name</label>
                <input 
                  type="text" 
                  value={newCat.name}
                  onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                  placeholder="e.g. Birthday Gifts"
                  className="w-full px-3 py-2 bg-white border border-purple-100 rounded-xl text-xs focus:ring-2 focus:ring-[#7d2e8e] outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-purple-600 px-1">Category Image</label>
                <div className="flex items-center gap-3">
                  {catImagePreview ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-purple-100">
                      <img src={catImagePreview} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setCatImagePreview(null)}
                        className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl-lg"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-12 h-12 bg-white border border-purple-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-purple-50 transition-all">
                      <Plus size={16} className="text-purple-400" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleCatImageChange} />
                    </label>
                  )}
                  <div className="flex-1">
                    <input 
                      type="url" 
                      value={newCat.img}
                      onChange={(e) => setNewCat({...newCat, img: e.target.value})}
                      placeholder="Or paste image URL"
                      className="w-full px-3 py-2 bg-white border border-purple-100 rounded-xl text-[10px] focus:ring-2 focus:ring-[#7d2e8e] outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-purple-600 px-1">Note (Optional)</label>
                <input 
                  type="text" 
                  value={newCat.note}
                  onChange={(e) => setNewCat({...newCat, note: e.target.value})}
                  placeholder="e.g. Only for selected locations"
                  className="w-full px-3 py-2 bg-white border border-purple-100 rounded-xl text-xs focus:ring-2 focus:ring-[#7d2e8e] outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#7d2e8e] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#6a2679] transition-all"
              >
                Add Category
              </button>
            </form>
          )}

          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
            {categories.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No categories added yet.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 border border-gray-100 shadow-sm">
                      <img src={cat.img} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{cat.name}</p>
                      {cat.note && <p className="text-[9px] text-gray-400 line-clamp-1">{cat.note}</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className="w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Top Selling Products</h3>
            <Award className="text-orange-600" size={20} />
          </div>
          <div className="space-y-4">
            {topSellingProducts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No sales data yet.</p>
            ) : (
              topSellingProducts.map((prod, i) => (
                <div key={prod.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-xs font-black text-gray-900 border border-gray-100 shadow-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-gray-500">{prod.count} sales</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-gray-900">₹{prod.amount.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">User Management</h3>
            <Users className="text-orange-600" size={20} />
          </div>
          <div className="space-y-4">
            {users.map((user, index) => (
              <div key={user.uid || `user-${index}`} className="flex flex-col p-4 bg-gray-50 rounded-2xl gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.displayName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.createdAt && (
                        <p className="text-[10px] text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <select 
                    value={user.role}
                    onChange={(e) => updateUserRole(user.uid, e.target.value)}
                    className="text-xs font-bold bg-white border-none rounded-lg focus:ring-1 focus:ring-orange-500 py-1 px-2"
                  >
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-mono">ID: {user.uid}</p>
                  <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Product Oversight</h3>
            <ShoppingBag className="text-orange-600" size={20} />
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <tr>
                  <th className="pb-4">Product</th>
                  <th className="pb-4">Seller</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {products.map((product, index) => (
                  <tr key={product.id || `product-${index}`} className="border-t border-gray-50">
                    <td className="py-4 font-medium text-gray-900 line-clamp-1">{product.name}</td>
                    <td className="py-4 text-gray-500 text-xs">{product.vendorName}</td>
                    <td className="py-4">
                      <button 
                        onClick={() => removeProduct(product.id)}
                        className="text-red-500 hover:underline text-xs font-bold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
