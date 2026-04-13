
export interface LoginCredentials {
  email: string;
  password?: string;
}

export type UserRole = 'admin' | 'seller' | 'user';

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: string;
  password?: string; // Stored locally for demo purposes
  address?: Address;
  phoneNumber?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  vendorId: string;
  vendorName: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  img: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  vendorId: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: Address;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
}
