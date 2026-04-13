import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User, Product, Order, Review, Category } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // Users
  getUser: async (uid: string): Promise<User | null> => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as User) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  saveUser: async (user: User): Promise<void> => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
      return [];
    }
  },

  saveProduct: async (product: Partial<Product>): Promise<Product> => {
    try {
      const id = product.id || doc(collection(db, 'products')).id;
      const newProduct = {
        ...product,
        id,
        createdAt: product.createdAt || new Date().toISOString()
      } as Product;
      await setDoc(doc(db, 'products', id), newProduct, { merge: true });
      return newProduct;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'categories');
      return [];
    }
  },

  saveCategory: async (category: Partial<Category>): Promise<Category> => {
    try {
      const id = category.id || doc(collection(db, 'categories')).id;
      const newCategory = {
        ...category,
        id
      } as Category;
      await setDoc(doc(db, 'categories', id), newCategory, { merge: true });
      return newCategory;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${category.id}`);
      throw error;
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  },

  // Orders
  getOrders: async (userId?: string): Promise<Order[]> => {
    try {
      let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      if (userId) {
        q = query(q, where('userId', '==', userId));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      return [];
    }
  },

  saveOrder: async (order: Partial<Order>): Promise<Order> => {
    try {
      const id = order.id || doc(collection(db, 'orders')).id;
      const newOrder = {
        ...order,
        id,
        createdAt: order.createdAt || new Date().toISOString()
      } as Order;
      await setDoc(doc(db, 'orders', id), newOrder, { merge: true });
      return newOrder;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
      throw error;
    }
  },

  deleteOrder: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  },

  // Reviews
  getReviews: async (productId?: string): Promise<Review[]> => {
    try {
      let q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      if (productId) {
        q = query(q, where('productId', '==', productId));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
      return [];
    }
  },

  saveReview: async (review: Partial<Review>): Promise<Review> => {
    try {
      const id = doc(collection(db, 'reviews')).id;
      const newReview = {
        ...review,
        id,
        createdAt: new Date().toISOString()
      } as Review;
      await setDoc(doc(db, 'reviews', id), newReview);
      return newReview;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reviews');
      throw error;
    }
  },

  // Real-time listeners
  subscribeToUsers: (callback: (users: User[]) => void) => {
    return onSnapshot(collection(db, 'users'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
  },

  subscribeToProducts: (callback: (products: Product[]) => void) => {
    return onSnapshot(collection(db, 'products'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));
  },

  subscribeToCategories: (callback: (categories: Category[]) => void) => {
    return onSnapshot(collection(db, 'categories'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'categories'));
  },

  subscribeToOrders: (userId: string | undefined, callback: (orders: Order[]) => void) => {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));
  },

  testConnection: async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      }
    }
  }
};
