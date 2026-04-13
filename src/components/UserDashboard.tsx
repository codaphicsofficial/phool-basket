import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  User as UserIcon,
  Mail,
  Calendar,
  ChevronRight,
  IndianRupee,
  Heart,
  XCircle,
  Phone,
  MapPin,
  Edit2,
  Plus,
  LogOut,
  Gift,
  Award,
  ShieldCheck,
  Edit3,
  X,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import AddressForm from './AddressForm';
import { Address, Order, User } from '../types';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim()) return;
    try {
      await firebaseService.saveUser({ ...user, displayName: newName });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const u = await firebaseService.getUser(user.uid);
      if (u) {
        setUserData(u);
      }

      const userOrders = await firebaseService.getOrders(user.uid);
      setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    };

    fetchData();
    
    // Real-time subscription for orders
    const unsubscribe = firebaseService.subscribeToOrders(user.uid, (updatedOrders) => {
      setOrders(updatedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  const handleSaveAddress = async (address: Address) => {
    setAddressLoading(true);
    try {
      await firebaseService.saveUser({
        ...user,
        address
      });
      setUserData((prev: any) => ({ ...prev, address }));
      setIsEditingAddress(false);
    } catch (error) {
      console.error("Error saving address", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      await firebaseService.saveOrder({
        ...order,
        status: 'cancelled'
      });
    }
  };

  const canCancel = (createdAt: string) => {
    if (!createdAt) return false;
    const orderDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  const totalSpent = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=7d2e8e&color=fff`} 
                alt="" 
                className="w-24 h-24 rounded-full border-4 border-brand-purple/10 p-1 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-brand-green border-2 border-white rounded-full" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{user.displayName || 'Shopper'}</h2>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Orders</p>
                <p className="text-lg font-black text-brand-purple">{orders.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Spent</p>
                <p className="text-lg font-black text-brand-green">₹{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <nav className="bg-white rounded-[32px] p-4 border border-gray-100 shadow-sm space-y-2">
            {[
              { id: 'orders', label: 'My Orders', icon: Package },
              { id: 'profile', label: 'My Profile', icon: UserIcon },
              { id: 'addresses', label: 'My Addresses', icon: MapPin },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              Logout
            </button>
          </nav>

          {/* Promo Widget */}
          <div className="bg-gradient-to-br from-brand-orange to-orange-600 rounded-[32px] p-8 text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Gift className="text-white" size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black">Special Offer!</h4>
                <p className="text-sm text-white/80">Get 20% off on your next purchase.</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Use Code</p>
                <p className="text-xl font-black tracking-widest">PHOOL20</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-3/4 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">Order History</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                    <Clock size={14} />
                    <span>Last 6 months</span>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-[32px]" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-[40px] p-16 border-2 border-dashed border-gray-100 text-center space-y-6">
                    <div className="w-24 h-24 bg-brand-purple/5 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag size={48} className="text-brand-purple/20" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-gray-900">No orders yet</h3>
                      <p className="text-gray-500 max-w-xs mx-auto">Looks like you haven't placed any orders. Start shopping to see them here!</p>
                    </div>
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="bg-brand-purple text-white px-10 py-4 rounded-2xl font-black hover:bg-brand-purple-dark transition-all shadow-xl shadow-brand-purple/20"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {orders.map((order) => (
                      <motion.div 
                        key={order.id}
                        layout
                        className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-500"
                      >
                        <div className="p-6 md:p-8 space-y-6">
                          <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex gap-6">
                              <div className="w-20 h-20 bg-brand-purple/5 rounded-2xl flex items-center justify-center text-brand-purple group-hover:scale-110 transition-transform duration-500">
                                <Package size={32} />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                                  Order #{order.id?.slice(-8).toUpperCase() || 'N/A'}
                                </p>
                                <h4 className="text-lg font-black text-gray-900 line-clamp-1">
                                  {order.items?.map((i: any) => i.name).join(', ')}
                                </h4>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                  <Calendar size={14} />
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end justify-center gap-2">
                              <p className="text-2xl font-black text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                order.status === 'delivered' ? 'bg-brand-green/10 text-brand-green' :
                                order.status === 'pending' ? 'bg-brand-orange/10 text-brand-orange' :
                                order.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                                'bg-blue-50 text-blue-600'
                              }`}>
                                {order.status === 'delivered' ? <CheckCircle size={12} /> : 
                                 order.status === 'pending' ? <Clock size={12} /> :
                                 order.status === 'cancelled' ? <XCircle size={12} /> :
                                 <Truck size={12} />}
                                {order.status}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-brand-purple">
                                <MapPin size={16} />
                                <h5 className="text-[10px] font-black uppercase tracking-widest">Delivery Address</h5>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
                                <p>{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}</p>
                              </div>
                            </div>
                            <div className="flex flex-col md:items-end justify-end gap-3">
                              {order.status === 'pending' && canCancel(order.createdAt) && (
                                <button 
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="text-xs font-black text-red-500 hover:bg-red-50 px-6 py-3 rounded-xl transition-all border border-red-100"
                                >
                                  Cancel Order
                                </button>
                              )}
                              <button className="text-xs font-black text-brand-purple hover:bg-brand-purple/5 px-6 py-3 rounded-xl transition-all border border-brand-purple/10">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900">Profile Settings</h2>
                    {!isEditingProfile && (
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-2 text-sm font-bold text-brand-purple hover:bg-brand-purple/5 px-6 py-3 rounded-2xl transition-all"
                      >
                        <Edit3 size={18} />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Display Name</label>
                        <input 
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-purple/50 transition-all font-bold"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button 
                          type="submit"
                          className="flex-1 bg-brand-purple text-white py-4 rounded-2xl font-black hover:bg-brand-purple-dark transition-all"
                        >
                          Save Changes
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</p>
                          <p className="text-lg font-bold text-gray-900">{user.displayName || 'Not provided'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</p>
                          <p className="text-lg font-bold text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Account Status</p>
                          <div className="flex items-center gap-2 text-brand-green font-bold">
                            <ShieldCheck size={18} />
                            <span>Verified Account</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Member Since</p>
                          <p className="text-lg font-bold text-gray-900">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-brand-purple/5 rounded-[40px] p-8 border border-brand-purple/10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-purple shadow-sm">
                      <Award size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900">Premium Member</h4>
                      <p className="text-sm text-gray-500">You're enjoying exclusive benefits and early access.</p>
                    </div>
                  </div>
                  <button className="bg-white text-brand-purple px-8 py-3 rounded-2xl font-black text-sm hover:bg-brand-purple hover:text-white transition-all shadow-sm">
                    View Benefits
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">Saved Addresses</h2>
                  {!isEditingAddress && (
                    <button 
                      onClick={() => setIsEditingAddress(true)}
                      className="flex items-center gap-2 text-sm font-bold text-brand-purple hover:bg-brand-purple/5 px-6 py-3 rounded-2xl transition-all"
                    >
                      <Plus size={18} />
                      Add New
                    </button>
                  )}
                </div>

                {isEditingAddress || !userData?.address ? (
                  <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-gray-900">Delivery Details</h3>
                      {userData?.address && (
                        <button 
                          onClick={() => setIsEditingAddress(false)}
                          className="text-gray-400 hover:text-gray-900"
                        >
                          <X size={24} />
                        </button>
                      )}
                    </div>
                    <AddressForm 
                      initialAddress={userData?.address} 
                      onSave={handleSaveAddress} 
                      isLoading={addressLoading}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-900/5 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 bg-brand-purple/5 rounded-2xl flex items-center justify-center text-brand-purple">
                            <Home size={24} />
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle size={12} />
                            Default
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-gray-900">{userData.address.fullName}</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {userData.address.street}<br />
                            {userData.address.city}, {userData.address.state} - {userData.address.zipCode}<br />
                            {userData.address.country}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                          <button 
                            onClick={() => setIsEditingAddress(true)}
                            className="text-xs font-black text-brand-purple hover:underline"
                          >
                            Edit Address
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
