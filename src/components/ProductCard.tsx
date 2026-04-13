import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Zap, Loader2, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { Product } from '../types';
import ProductPreview from './ProductPreview';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Please sign in to buy products!");
      return;
    }
    setIsModalOpen(true);
  };

  const confirmPurchase = async () => {
    if (!user) return;

    setIsPurchasing(true);
    try {
      // Create a real order in Firebase
      await firebaseService.saveOrder({
        userId: user.uid,
        userEmail: user.email,
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          vendorId: product.vendorId
        }],
        totalAmount: product.price,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setPurchaseSuccess(true);
      setIsModalOpen(false);
      setTimeout(() => setPurchaseSuccess(false), 3000);
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={() => setIsPreviewOpen(true)}
        className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full border border-gray-100 hover:border-brand-purple/20 premium-shadow"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
          <img 
            src={product.images[0] || 'https://picsum.photos/seed/product/400/500'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 shadow-lg transition-all hover:scale-110">
              <Heart size={18} />
            </button>
          </div>
          {product.discount && (
            <div className="absolute top-3 left-3 bg-brand-orange text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider">
              {product.discount}% OFF
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex items-center gap-1 bg-brand-green text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
              <span>{product.rating}</span>
              <Star size={10} fill="currentColor" />
            </div>
            <span className="text-[11px] text-gray-400 font-bold tracking-tight">{product.reviewCount} Reviews</span>
          </div>

          <h3 className="text-[15px] font-bold text-gray-800 line-clamp-2 mb-3 group-hover:text-brand-purple transition-colors leading-snug h-10">
            {product.name}
          </h3>
          
          <div className="mt-auto space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-gray-900 tracking-tight">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-[11px] text-brand-orange font-black uppercase tracking-wider bg-brand-orange/5 px-3 py-1.5 rounded-xl border border-brand-orange/10">
              <Zap size={12} className="fill-brand-orange" />
              <span>Earliest Delivery: Today</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Confirm Purchase</h3>
                    <p className="text-gray-500 text-sm">Review your order details below.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <img 
                    src={product.images[0]} 
                    alt="" 
                    className="w-20 h-20 rounded-xl object-cover border border-white shadow-sm"
                  />
                  <div className="flex flex-col justify-center">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">{product.vendorName}</p>
                    <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                    <p className="text-lg font-black text-gray-900">₹{product.price}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-900">₹{product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-black text-orange-600">₹{product.price}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmPurchase}
                    disabled={isPurchasing}
                    className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2"
                  >
                    {isPurchasing ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Confirm Order
                        <Zap size={18} className="text-orange-500" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ProductPreview 
        product={product} 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
    </>
  );
}
