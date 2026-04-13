import React, { useState, useEffect } from 'react';
import { Star, X, ShoppingCart, Zap, Loader2, CheckCircle, MessageSquare, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Review, Address, User } from '../types';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import AddressForm from './AddressForm';

interface ProductPreviewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductPreview({ product, isOpen, onClose }: ProductPreviewProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchReviews = async () => {
        const r = await firebaseService.getReviews(product.id);
        setReviews(r);
      };
      fetchReviews();

      if (user) {
        const fetchUser = async () => {
          const u = await firebaseService.getUser(user.uid);
          setCurrentUserData(u);
        };
        fetchUser();
      }
    }
  }, [isOpen, product.id, user]);

  const handlePurchase = async () => {
    if (!user) {
      alert("Please sign in to buy products!");
      return;
    }

    const userData = await firebaseService.getUser(user.uid);
    if (!userData?.address) {
      setShowAddressForm(true);
      return;
    }

    setIsPurchasing(true);
    try {
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
        shippingAddress: userData.address
      });
      setPurchaseSuccess(true);
      setTimeout(() => setPurchaseSuccess(false), 3000);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSaveAddress = async (address: Address) => {
    if (!user) return;
    await firebaseService.saveUser({
      ...user,
      address
    });
    setCurrentUserData((prev: any) => ({ ...prev, address }));
    setShowAddressForm(false);
    // Automatically trigger purchase after saving address
    setTimeout(() => {
      handlePurchase();
    }, 500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to leave a review!");
      return;
    }
    if (!newReview.comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const review = await firebaseService.saveReview({
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || user.email,
        userPhoto: user.photoURL,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      const updatedReviews = [review, ...reviews];
      setReviews(updatedReviews);
      
      // Update product stats
      const totalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = totalRating / updatedReviews.length;
      
      await firebaseService.saveProduct({
        ...product,
        rating: avgRating,
        reviewCount: updatedReviews.length
      });

      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error("Review failed:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white md:text-gray-400 md:bg-gray-100 md:hover:bg-gray-200 transition-all"
            >
              <X size={24} />
            </button>

            {/* Left: Image Gallery */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gray-50 relative">
              <img 
                src={product.images[0] || 'https://picsum.photos/seed/product/800/1000'} 
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {product.discount && (
                <div className="absolute top-8 left-8 bg-orange-600 text-white font-black px-4 py-2 rounded-2xl shadow-xl">
                  -{product.discount}% OFF
                </div>
              )}
            </div>

            {/* Right: Details & Reviews */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-[0.2em]">
                  <Zap size={14} fill="currentColor" />
                  {product.category}
                </div>
                <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">{product.name}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-orange-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-400">{product.reviewCount} Reviews</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-300 line-through font-bold">₹{product.originalPrice}</span>
                  )}
                </div>
                <p className="text-gray-500 leading-relaxed text-lg">{product.description}</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handlePurchase}
                  disabled={isPurchasing || purchaseSuccess}
                  className={`flex-1 py-6 rounded-[24px] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-600/20 ${
                    purchaseSuccess 
                      ? 'bg-green-500 text-white' 
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  } disabled:opacity-70`}
                >
                  {isPurchasing ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : purchaseSuccess ? (
                    <>
                      <CheckCircle size={24} />
                      Order Placed!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={24} />
                      {currentUserData?.address ? 'Buy Now' : 'Add Address to Buy'}
                    </>
                  )}
                </button>
              </div>

              {/* Address Form Overlay for Purchase */}
              <AnimatePresence>
                {showAddressForm && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-orange-50 p-8 rounded-[32px] border border-orange-100 space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-orange-900">Delivery Address Required</h3>
                      <button 
                        onClick={() => setShowAddressForm(false)}
                        className="text-orange-400 hover:text-orange-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <p className="text-sm text-orange-700 font-medium">Please provide your delivery details to complete the purchase.</p>
                    <AddressForm onSave={handleSaveAddress} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-10 border-t border-gray-100 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <MessageSquare className="text-orange-600" />
                    Customer Reviews
                  </h3>
                  <span className="px-4 py-2 bg-gray-50 rounded-full text-sm font-bold text-gray-500">
                    {reviews.length} total
                  </span>
                </div>

                {/* Review Form */}
                {user && (
                  <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-[32px] space-y-4 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-700">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className={`transition-colors ${newReview.rating >= star ? 'text-orange-400' : 'text-gray-300'}`}
                          >
                            <Star size={24} fill={newReview.rating >= star ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Share your experience with this product..."
                      className="w-full p-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-orange-600/20 min-h-[100px] text-gray-700 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newReview.comment.trim()}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
                    >
                      {isSubmittingReview ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Post Review"}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                      <p className="text-gray-400 font-bold">No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="p-6 bg-white rounded-[32px] border border-gray-100 space-y-4 hover:shadow-xl hover:shadow-gray-100 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                              {review.userPhoto ? (
                                <img src={review.userPhoto} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <UserIcon className="text-orange-600" size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{review.userName}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-orange-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 font-medium leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
