import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import ProductCard from './ProductCard';
import { motion } from 'motion/react';
import { Database, Loader2, Sparkles } from 'lucide-react';
import { User, UserRole, Product } from '../types';

export default function ProductFeed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.email === 'codaphicsofficial@gmail.com');
    }
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      const prods = await firebaseService.getProducts();
      setProducts(prods);
      setLoading(false);
    };

    fetchProducts();

    // Real-time subscription
    const unsubscribe = firebaseService.subscribeToProducts((updatedProds) => {
      setProducts(updatedProds);
    });

    return () => unsubscribe();
  }, []);

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
          name: "Exquisite Red Roses Bouquet",
          description: "A stunning arrangement of 12 fresh red roses, hand-tied with a silk ribbon.",
          price: 1299,
          originalPrice: 1599,
          discount: 18,
          category: "Blooms",
          vendorId: 'demo-seller-1',
          vendorName: "Phool Basket Florals",
          images: ["https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/products/p-exquisite-12-red-roses-bouquet-135123-m.jpg"],
          stock: 50,
          rating: 4.8,
          reviewCount: 124,
          createdAt: new Date().toISOString()
        },
        {
          name: "Truffle Temptation Cake",
          description: "Rich chocolate truffle cake made with premium Belgian chocolate.",
          price: 899,
          originalPrice: 1099,
          discount: 18,
          category: "Cakes",
          vendorId: 'demo-seller-2',
          vendorName: "The Cake Studio",
          images: ["https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/products/p-truffle-temptation-cake-half-kg--108879-m.jpg"],
          stock: 25,
          rating: 4.9,
          reviewCount: 210,
          createdAt: new Date().toISOString()
        },
        {
          name: "Personalized Photo Frame",
          description: "Elegant wooden photo frame customized with your favorite memory.",
          price: 599,
          originalPrice: 799,
          discount: 25,
          category: "Personalized",
          vendorId: 'demo-seller-1',
          vendorName: "Memory Lane Gifts",
          images: ["https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/products/p-personalized-photo-frame-135124-m.jpg"],
          stock: 100,
          rating: 4.7,
          reviewCount: 89,
          createdAt: new Date().toISOString()
        },
        {
          name: "Jade Plant in Ceramic Pot",
          description: "Beautiful indoor jade plant in a designer white ceramic pot.",
          price: 499,
          originalPrice: 599,
          discount: 16,
          category: "Plants",
          vendorId: 'demo-seller-2',
          vendorName: "Green Earth",
          images: ["https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/products/p-jade-plant-in-ceramic-pot-135125-m.jpg"],
          stock: 40,
          rating: 4.5,
          reviewCount: 56,
          createdAt: new Date().toISOString()
        },
        {
          name: "Assorted Gourmet Hamper",
          description: "A collection of premium chocolates, cookies, and dry fruits.",
          price: 1899,
          originalPrice: 2199,
          discount: 13,
          category: "Combos",
          vendorId: 'demo-seller-1',
          vendorName: "Phool Basket Florals",
          images: ["https://cdn.igp.com/f_auto,q_auto,t_pnue_item_d/products/p-assorted-gourmet-hamper-135126-m.jpg"],
          stock: 15,
          rating: 4.9,
          reviewCount: 34,
          createdAt: new Date().toISOString()
        }
      ];

      for (const prod of demoProducts) {
        const savedProduct = await firebaseService.saveProduct(prod);
        
        // Seed some reviews for each product
        const demoReviews = [
          {
            productId: savedProduct.id,
            userId: 'demo-user-1',
            userName: 'Rahul Sharma',
            rating: 5,
            comment: 'Absolutely amazing quality! Worth every penny.',
            createdAt: new Date().toISOString()
          },
          {
            productId: savedProduct.id,
            userId: 'demo-user-2',
            userName: 'Priya Patel',
            rating: 4,
            comment: 'Great product, but delivery took a bit longer than expected.',
            createdAt: new Date().toISOString()
          }
        ];

        for (const review of demoReviews) {
          await firebaseService.saveReview(review);
        }
      }

      alert("Demo data seeded successfully!");
    } catch (error) {
      console.error("Error seeding data", error);
      alert("Failed to seed demo data.");
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-2xl aspect-[4/5]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {products.length === 0 ? (
          <div className="text-center py-24 bg-white flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-[#7d2e8e]">
              <Database size={48} />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">No Gifts Found</p>
              <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any products in our basket right now.</p>
            </div>
            {isAdmin && (
              <button 
                onClick={seedDemoData}
                disabled={isSeeding}
                className="bg-[#7d2e8e] text-white px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-[#6a2679] transition-all shadow-lg disabled:opacity-50"
              >
                {isSeeding ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                Seed Gifting Catalog
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-0">
            {products.map((product, index) => (
              <div key={product.id || `product-${index}`} className="border-r border-b border-gray-50 last:border-r-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
