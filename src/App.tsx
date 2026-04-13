import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import { ShoppingBag, Sparkles, Zap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { firebaseService } from './services/firebaseService';
import { Category } from './types';

function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const banners = [
    {
      url: "https://cdn.igp.com/f_auto,q_auto,t_pnue_hero_d/assets/images/banner/Occasions_Banner_Desktop_20240320.jpg",
      title: "Celebrate Every Moment",
      subtitle: "Handpicked flowers and unique gifts delivered to your loved ones."
    },
    {
      url: "https://cdn.igp.com/f_auto,q_auto,t_pnue_hero_d/assets/images/banner/Birthday_Banner_Desktop_20240320.jpg",
      title: "Make Birthdays Special",
      subtitle: "Delicious cakes and personalized surprises for their big day."
    },
    {
      url: "https://cdn.igp.com/f_auto,q_auto,t_pnue_hero_d/assets/images/banner/Anniversary_Banner_Desktop_20240320.jpg",
      title: "Anniversary Essentials",
      subtitle: "Romantic blooms and thoughtful gifts to celebrate your love."
    }
  ];

  useEffect(() => {
    const initialCategories: Category[] = [
      { 
        id: 'cat-1',
        name: 'Same day delivery', 
        img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/category-icons/same-day-delivery.png',
        note: 'Same day delivery possible only my selected location'
      },
      { id: 'cat-2', name: 'Cakes', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/category-icons/cakes.png' },
      { id: 'cat-3', name: 'Blooms', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/category-icons/flowers.png' },
      { id: 'cat-4', name: 'Plants', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/category-icons/plants.png' },
      { id: 'cat-5', name: 'Just added', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/category-icons/new-arrivals.png' },
      { id: 'cat-6', name: 'Worldwide gifts', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/category-icons/international.png' },
      { id: 'cat-7', name: 'Corporate gifts', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/category-icons/corporate.png' },
    ];

    const fetchCategories = async () => {
      const cats = await firebaseService.getCategories();
      if (cats.length === 0) {
        // Seed categories if empty
        for (const cat of initialCategories) {
          await firebaseService.saveCategory(cat);
        }
        setCategories(initialCategories);
      } else {
        setCategories(cats);
      }
    };

    fetchCategories();

    // Real-time subscription
    const unsubscribe = firebaseService.subscribeToCategories((updatedCats) => {
      if (updatedCats.length > 0) {
        setCategories(updatedCats);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Category Bar - IGP Style */}
      <div className="bg-white py-8 shadow-sm border-b border-gray-50 overflow-x-auto">
        <div className="max-w-[1248px] mx-auto px-4 flex justify-between items-start min-w-[900px] gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-4 cursor-pointer group max-w-[130px] text-center">
              <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center p-4 group-hover:bg-brand-purple/5 transition-all duration-500 border border-gray-100 group-hover:border-brand-purple/20 group-hover:shadow-xl group-hover:shadow-brand-purple/10 group-hover:-translate-y-1">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[12px] font-black text-gray-800 group-hover:text-brand-purple uppercase tracking-widest leading-tight block transition-colors">{cat.name}</span>
                {cat.note && (
                  <span className="text-[10px] text-brand-green leading-tight block font-black uppercase tracking-tighter">{cat.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Banner Slider - Immersive Style */}
      <section className="max-w-[1248px] mx-auto px-4">
        <div className="relative h-[480px] rounded-[40px] overflow-hidden shadow-2xl group premium-shadow">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img 
                src={banners[currentBanner].url} 
                alt={banners[currentBanner].title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center px-20">
                <div className="max-w-xl space-y-8">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 bg-brand-orange/20 backdrop-blur-md border border-brand-orange/30 px-4 py-1.5 rounded-full text-brand-orange text-xs font-black uppercase tracking-widest"
                    >
                      <Sparkles size={14} />
                      Limited Time Offer
                    </motion.div>
                    <motion.h1 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-6xl font-black text-white leading-[1.1] tracking-tighter"
                    >
                      {banners[currentBanner].title}
                    </motion.h1>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/80 text-xl font-medium leading-relaxed"
                    >
                      {banners[currentBanner].subtitle}
                    </motion.p>
                  </div>
                  <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-brand-purple text-white px-12 py-5 rounded-[24px] font-black hover:bg-brand-purple-dark transition-all shadow-2xl shadow-brand-purple/40 text-lg flex items-center gap-3 group/btn"
                  >
                    Shop Collection
                    <ArrowRight size={22} className="group-hover/btn:translate-x-2 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls */}
          <button 
            onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={28} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-10 left-20 flex gap-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${currentBanner === i ? 'bg-brand-purple w-12' : 'bg-white/30 w-4'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1248px] mx-auto px-4 py-12 space-y-20">
        {/* Shop by Occasion */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Shop by Occasion</h2>
              <p className="text-gray-500 font-medium">Find the perfect gift for every milestone.</p>
            </div>
            <button className="text-brand-purple font-black text-sm hover:text-brand-purple-dark transition-colors flex items-center gap-2 group">
              View All Occasions
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'Birthday', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/assets/images/cms/birthday_d_igp_20230912.jpg' },
              { name: 'Anniversary', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/assets/images/cms/anniversary_d_igp_20230912.jpg' },
              { name: 'Wedding', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/assets/images/cms/wedding_d_igp_20230912.jpg' },
              { name: 'Housewarming', img: 'https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/assets/images/cms/housewarming_d_igp_20230912.jpg' }
            ].map((occ, i) => (
              <div key={i} className="relative h-64 rounded-[32px] overflow-hidden group cursor-pointer shadow-xl premium-shadow">
                <img src={occ.img} alt={occ.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <div className="space-y-1">
                    <span className="text-white font-black text-2xl tracking-tight">{occ.name}</span>
                    <div className="w-8 h-1 bg-brand-purple rounded-full group-hover:w-16 transition-all duration-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Gifts Banner */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-80 rounded-[40px] overflow-hidden shadow-2xl group cursor-pointer premium-shadow">
            <img src="https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/assets/images/cms/personalized_d_igp_20230912.jpg" alt="Personalized" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex flex-col justify-center px-12">
              <div className="max-w-xs space-y-4">
                <h3 className="text-4xl font-black text-white leading-tight">Personalized Gifts</h3>
                <p className="text-white/80 font-medium">Add a personal touch to your surprises with custom names and photos.</p>
                <span className="inline-flex items-center gap-3 bg-white text-brand-purple px-8 py-3.5 rounded-2xl font-black group-hover:bg-brand-purple group-hover:text-white transition-all shadow-xl">
                  Explore Now 
                  <ArrowRight size={20} />
                </span>
              </div>
            </div>
          </div>
          <div className="relative h-80 rounded-[40px] overflow-hidden shadow-2xl group cursor-pointer premium-shadow">
            <img src="https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/assets/images/cms/cakes_d_igp_20230912.jpg" alt="Cakes" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex flex-col justify-center px-12">
              <div className="max-w-xs space-y-4">
                <h3 className="text-4xl font-black text-white leading-tight">Delicious Cakes</h3>
                <p className="text-white/80 font-medium">Freshly baked treats delivered to their doorstep in 2 hours.</p>
                <span className="inline-flex items-center gap-3 bg-white text-brand-purple px-8 py-3.5 rounded-2xl font-black group-hover:bg-brand-purple group-hover:text-white transition-all shadow-xl">
                  Order Now 
                  <ArrowRight size={20} />
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#fcf9fc] font-sans selection:bg-brand-purple/10 selection:text-brand-purple flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/cart" element={<div className="text-center py-20 text-gray-400 font-bold">Cart functionality coming soon!</div>} />
          </Routes>
        </main>
        
        <footer className="bg-[#1a0b1d] text-white pt-24 pb-12 mt-20">
          <div className="max-w-[1248px] mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 pb-16 border-b border-white/5">
              <div className="space-y-6">
                <h4 className="text-brand-purple text-xs font-black uppercase tracking-[0.2em]">Occasions</h4>
                <ul className="text-gray-400 text-sm space-y-3 font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">Birthday Gifts</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Anniversary Gifts</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Wedding Gifts</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Housewarming</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-brand-purple text-xs font-black uppercase tracking-[0.2em]">Flowers</h4>
                <ul className="text-gray-400 text-sm space-y-3 font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">Roses</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Lilies</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Mixed Flowers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Flower Bunches</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-brand-purple text-xs font-black uppercase tracking-[0.2em]">Cakes</h4>
                <ul className="text-gray-400 text-sm space-y-3 font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">Chocolate Cakes</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Photo Cakes</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Eggless Cakes</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Designer Cakes</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-brand-purple text-xs font-black uppercase tracking-[0.2em]">Company</h4>
                <ul className="text-gray-400 text-sm space-y-3 font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                </ul>
              </div>
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-purple flex items-center justify-center p-2.5 shadow-xl shadow-brand-purple/20">
                    <img 
                      src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/phool-basket-logo.png" 
                      alt="Phool Basket" 
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter">Phool Basket</span>
                    <span className="text-[10px] text-brand-green font-black uppercase tracking-widest">Gifts & Flowers</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  Phool Basket is India's premier gifting destination, offering a wide range of flowers, cakes, and personalized gifts for every occasion. We deliver emotions, not just gifts.
                </p>
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-purple transition-all cursor-pointer group">
                      <Sparkles size={18} className="text-gray-400 group-hover:text-white" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center pt-12 gap-8">
              <p className="text-xs text-gray-500 font-bold">© 2026 PhoolBasket.com. All rights reserved.</p>
              <div className="flex items-center gap-8 bg-white/5 px-8 py-4 rounded-2xl border border-white/5">
                <img src="https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/payment-icons/visa.png" alt="Visa" className="h-4 opacity-50 hover:opacity-100 transition-opacity" />
                <img src="https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/payment-icons/mastercard.png" alt="Mastercard" className="h-4 opacity-50 hover:opacity-100 transition-opacity" />
                <img src="https://cdn.igp.com/f_auto,q_auto,t_pnue_72/assets/images/payment-icons/upi.png" alt="UPI" className="h-4 opacity-50 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
