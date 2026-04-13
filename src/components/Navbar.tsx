import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  ShoppingCart,
  UserCircle,
  ChevronDown,
  Sparkles,
  Zap,
  MapPin
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchUserRole = async () => {
        const userData = await firebaseService.getUser(user.uid);
        if (userData) {
          setUserRole(userData.role);
        }
      };
      fetchUserRole();
    } else {
      setUserRole(null);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white sticky top-0 z-50">
      {/* Top Bar - FNP Style */}
      <div className="bg-brand-purple text-white py-1.5 text-[11px] font-bold tracking-widest uppercase text-center overflow-hidden">
        <motion.div 
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap inline-block"
        >
          ✨ FREE SHIPPING ON ALL ORDERS ABOVE ₹999 • 🌸 FRESH BLOOMS DELIVERED DAILY • 🎁 PERSONALIZED GIFTS FOR EVERY OCCASION ✨
        </motion.div>
      </div>

      <div className="max-w-[1248px] mx-auto px-4">
        <div className="flex items-center gap-4 md:gap-12 h-20">
          {/* Logo - IGP Style */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-2xl bg-brand-purple p-2 shadow-lg group-hover:scale-105 transition-transform">
                <img 
                  src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/phool-basket-logo.png" 
                  alt="Phool Basket" 
                  className="w-full h-full object-contain brightness-0 invert"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://ui-avatars.com/api/?name=PB&background=7d2e8e&color=fff';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-brand-purple text-2xl font-black tracking-tighter leading-none">Phool Basket</span>
                <span className="text-[10px] text-brand-green font-black tracking-widest uppercase mt-0.5">Gifts & Flowers</span>
              </div>
            </Link>
          </div>

          {/* Location Selector */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-100 group">
            <MapPin size={18} className="text-brand-purple group-hover:scale-110 transition-transform" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Deliver to</span>
              <span className="text-xs font-bold text-gray-800">Select City</span>
            </div>
          </div>

          {/* Search Bar - IGP Style */}
          <div className="flex-1 max-w-[600px]">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search for flowers, cakes, personalized gifts..." 
                className="w-full pl-6 pr-14 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-medium focus:outline-none focus:border-brand-purple focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-purple p-2.5 rounded-xl text-white cursor-pointer hover:bg-brand-purple-dark transition-all shadow-md group-hover:scale-105">
                <Search size={18} />
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <div className="relative group/user">
                <button className="text-gray-800 font-bold text-sm flex items-center gap-2 py-2 hover:text-brand-purple transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                    <UserCircle size={20} />
                  </div>
                  <span className="max-w-[100px] truncate">{user.displayName || 'Account'}</span>
                  <ChevronDown size={14} className="group-hover/user:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full right-0 w-56 bg-white shadow-2xl rounded-2xl border border-gray-100 hidden group-hover/user:block py-3 z-50 premium-shadow">
                  <div className="px-4 py-2 border-b border-gray-50 mb-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Welcome</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-brand-purple transition-colors">
                    <UserCircle size={18} />
                    My Profile
                  </Link>
                  {(userRole === 'seller' || userRole === 'admin') && (
                    <Link to="/seller" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-brand-purple transition-colors">
                      <LayoutDashboard size={18} />
                      Seller Hub
                    </Link>
                  )}
                  {userRole === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-brand-purple transition-colors">
                      <ShieldCheck size={18} />
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 border-t border-gray-50 mt-2 transition-colors">
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/auth"
                className="text-brand-purple font-black text-sm hover:text-brand-purple-dark transition-all flex items-center gap-2 bg-brand-purple/5 px-5 py-2.5 rounded-2xl border border-brand-purple/10"
              >
                <UserCircle size={20} />
                Login
              </Link>
            )}

            <Link to="/cart" className="flex items-center gap-3 text-gray-800 font-bold text-sm group hover:text-brand-purple transition-all">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-brand-purple/10 transition-colors">
                  <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-brand-orange text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">0</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">My Basket</span>
                <span className="text-xs font-bold">₹0.00</span>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="text-gray-800 relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-50 md:hidden flex"
          >
            <div className="w-4/5 bg-white h-full shadow-2xl flex flex-col">
              <div className="bg-[#7d2e8e] p-6 text-white">
                {user ? (
                  <div className="flex items-center gap-4">
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}`} alt="" className="w-12 h-12 rounded-full border-2 border-white/20 shadow-lg" />
                    <div>
                      <p className="font-bold text-lg">Hello, {user.displayName || 'User'}</p>
                      <p className="text-xs text-white/70">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <UserCircle size={32} />
                    </div>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="font-bold text-xl">Login / Signup</Link>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto py-6">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-8 py-4 text-gray-700 hover:bg-purple-50 hover:text-[#7d2e8e] transition-colors">
                  <ShoppingBag size={20} />
                  <span className="font-medium">All Categories</span>
                </Link>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-8 py-4 text-gray-700 hover:bg-purple-50 hover:text-[#7d2e8e] transition-colors">
                  <UserCircle size={20} />
                  <span className="font-medium">My Account</span>
                </Link>
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-8 py-4 text-gray-700 hover:bg-purple-50 hover:text-[#7d2e8e] transition-colors">
                  <ShoppingCart size={20} />
                  <span className="font-medium">My Cart</span>
                </Link>
                {(userRole === 'seller' || userRole === 'admin') && (
                  <Link to="/seller" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-8 py-4 text-gray-700 hover:bg-purple-50 hover:text-[#7d2e8e] transition-colors">
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Seller Dashboard</span>
                  </Link>
                )}
                {userRole === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-8 py-4 text-gray-700 hover:bg-purple-50 hover:text-[#7d2e8e] transition-colors">
                    <ShieldCheck size={20} />
                    <span className="font-medium">Admin Panel</span>
                  </Link>
                )}
                {user && (
                  <button onClick={handleLogout} className="w-full flex items-center gap-4 px-8 py-4 text-red-600 hover:bg-red-50 mt-4 border-t border-gray-100 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
