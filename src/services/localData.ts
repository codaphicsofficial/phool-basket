
// Local Data Service using localStorage

import { User, Product, Order, Review } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'phoolbasket_products',
  USERS: 'phoolbasket_users',
  ORDERS: 'phoolbasket_orders',
  CURRENT_USER: 'phoolbasket_current_user',
  REVIEWS: 'phoolbasket_reviews',
  CATEGORIES: 'phoolbasket_categories',
};

export interface Category {
  id: string;
  name: string;
  img: string;
  note?: string;
}

// Helper to get data from localStorage
const getLocalData = <T>(key: string): T | null => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Helper to save data to localStorage
const setLocalData = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const localData = {
  // Auth
  getCurrentUser: (): User | null => getLocalData<User>(STORAGE_KEYS.CURRENT_USER),
  setCurrentUser: (user: User) => setLocalData<User>(STORAGE_KEYS.CURRENT_USER, user),
  logout: () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER),

  // Categories
  getCategories: (): Category[] => getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES) || [],
  saveCategory: (category: Partial<Category>) => {
    const categories = localData.getCategories();
    let savedCategory: Category;
    if (category.id) {
      const index = categories.findIndex((c) => c.id === category.id);
      if (index > -1) {
        savedCategory = { ...categories[index], ...category } as Category;
        categories[index] = savedCategory;
      } else {
        savedCategory = category as Category;
        categories.push(savedCategory);
      }
    } else {
      savedCategory = { 
        ...category, 
        id: Math.random().toString(36).substr(2, 9),
      } as Category;
      categories.push(savedCategory);
    }
    setLocalData(STORAGE_KEYS.CATEGORIES, categories);
    return savedCategory;
  },
  deleteCategory: (id: string) => {
    const categories = localData.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    setLocalData(STORAGE_KEYS.CATEGORIES, filtered);
  },
  seedCategories: (initialCategories: Category[]) => {
    const existing = localData.getCategories();
    if (existing.length === 0) {
      setLocalData(STORAGE_KEYS.CATEGORIES, initialCategories);
    }
  },

  // Users
  getUsers: (): User[] => getLocalData<User[]>(STORAGE_KEYS.USERS) || [],
  saveUser: (user: Partial<User> & { uid: string }) => {
    const users = localData.getUsers();
    const index = users.findIndex((u) => u.uid === user.uid);
    if (index > -1) {
      users[index] = { ...users[index], ...user } as User;
    } else {
      users.push(user as User);
    }
    setLocalData(STORAGE_KEYS.USERS, users);
    // Update current user if it's the same user
    const currentUser = localData.getCurrentUser();
    if (currentUser && currentUser.uid === user.uid) {
      localData.setCurrentUser({ ...currentUser, ...user } as User);
    }
  },
  getUser: (uid: string): User | undefined => {
    const users = localData.getUsers();
    return users.find((u) => u.uid === uid);
  },

  // Products
  getProducts: (): Product[] => getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS) || [],
  saveProduct: (product: Partial<Product>) => {
    const products = localData.getProducts();
    let savedProduct: Product;
    if (product.id) {
      const index = products.findIndex((p) => p.id === product.id);
      if (index > -1) {
        savedProduct = { ...products[index], ...product } as Product;
        products[index] = savedProduct;
      } else {
        savedProduct = product as Product;
        products.push(savedProduct);
      }
    } else {
      savedProduct = { 
        ...product, 
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      } as Product;
      products.push(savedProduct);
    }
    setLocalData(STORAGE_KEYS.PRODUCTS, products);
    return savedProduct;
  },
  deleteProduct: (id: string) => {
    const products = localData.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    setLocalData(STORAGE_KEYS.PRODUCTS, filtered);
  },

  // Orders
  getOrders: (): Order[] => getLocalData<Order[]>(STORAGE_KEYS.ORDERS) || [],
  saveOrder: (order: Partial<Order>) => {
    const orders = localData.getOrders();
    let savedOrder: Order;
    if (order.id) {
      const index = orders.findIndex((o) => o.id === order.id);
      if (index > -1) {
        savedOrder = { ...orders[index], ...order } as Order;
        orders[index] = savedOrder;
      } else {
        savedOrder = order as Order;
        orders.push(savedOrder);
      }
    } else {
      savedOrder = { 
        ...order, 
        id: Math.random().toString(36).substr(2, 9), 
        createdAt: new Date().toISOString() 
      } as Order;
      orders.push(savedOrder);
    }
    setLocalData(STORAGE_KEYS.ORDERS, orders);
    return savedOrder;
  },

  // Reviews
  getReviews: (productId?: string): Review[] => {
    const reviews = getLocalData<Review[]>(STORAGE_KEYS.REVIEWS) || [];
    if (productId) {
      return reviews.filter((r) => r.productId === productId);
    }
    return reviews;
  },
  saveReview: (review: Partial<Review>) => {
    const reviews = localData.getReviews();
    const newReview = { 
      ...review, 
      id: Math.random().toString(36).substr(2, 9), 
      createdAt: new Date().toISOString() 
    } as Review;
    reviews.push(newReview);
    setLocalData(STORAGE_KEYS.REVIEWS, reviews);
    return newReview;
  },
};
