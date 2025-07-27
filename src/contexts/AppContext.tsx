import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../utils/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

// ========================= Interfaces =========================
export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  supplier: string; // stores supplierId
  stock: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  vendor: string;
  items: { name: string; qty: number; price: number; supplierId?: string }[];
  total: number;
  status: "ordered" | "shipped" | "delivered";
  date: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  status: "good" | "low" | "critical";
  vendorId: string; // stores vendorId
}

interface AppContextType {
  products: Product[];
  categories: string[];
  filteredProducts: Product[];
  searchProducts: (query: string) => void;
  filterByCategory: (category: string) => void;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  cart: CartItem[];
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => Promise<void>;

  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "date" | "vendor">) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  reorder: (order: Order) => Promise<void>;

  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, "id">) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;

  addCategory: (name: string) => Promise<void>; // ✅ Added
}

// ========================= Context =========================
const AppContext = createContext<AppContextType | undefined>(undefined);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// ========================= Provider =========================
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Firestore References
  const productsRef = collection(db, "Products");
  const ordersRef = collection(db, "Order");
  const categoryRef = collection(db, "Category");
  const inventoryRef = collection(db, "Inventory");
  const cartsRef = collection(db, "Cart");

  const vendorUid = auth.currentUser?.uid;

  // ========================= CATEGORIES (Realtime) =========================
  useEffect(() => {
    const unsub = onSnapshot(categoryRef, (snapshot) => {
      const raw = snapshot.docs.map((doc) => (doc.data() as any).name || doc.id);
      setCategories(["all", ...new Set(raw)]);
    });
    return () => unsub();
  }, []);

  // ✅ Add Category
  const addCategory = async (name: string): Promise<void> => {
    if (!name.trim()) return;
    await addDoc(categoryRef, { name: name.trim() });
  };

  // ========================= PRODUCTS (Realtime) =========================
  useEffect(() => {
    const unsub = onSnapshot(productsRef, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      setProducts(data);
      setFilteredProducts(data);
    });
    return () => unsub();
  }, []);

  const searchProducts = (query: string) => {
    setFilteredProducts(
      !query.trim()
        ? products
        : products.filter(
            (p) =>
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.category.toLowerCase().includes(query.toLowerCase()) ||
              p.supplier.toLowerCase().includes(query.toLowerCase())
          )
    );
  };

  const filterByCategory = (category: string) => {
    setFilteredProducts(category === "all" ? products : products.filter((p) => p.category === category));
  };

  const addProduct = async (product: Omit<Product, "id">): Promise<void> => {
    await addDoc(productsRef, product);
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    await updateDoc(doc(db, "Products", id), updates);
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "Products", id));
  };

  // ========================= CART =========================
  const getCart = async (vendorId?: string) => {
    if (!vendorId) return [];
    const q = query(cartsRef, where("vendorId", "==", vendorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as CartItem);
  };

  const saveCart = async (vendorId: string, cartItems: CartItem[]): Promise<void> => {
    const q = query(cartsRef, where("vendorId", "==", vendorId));
    const snap = await getDocs(q);
    for (const d of snap.docs) await deleteDoc(doc(db, "Cart", d.id));
    for (const item of cartItems) {
      await setDoc(doc(db, "Cart", `${vendorId}_${item.id}`), { vendorId, ...item });
    }
  };

  const clearCartDB = async (vendorId?: string): Promise<void> => {
    if (!vendorId) return;
    const q = query(cartsRef, where("vendorId", "==", vendorId));
    const snap = await getDocs(q);
    for (const d of snap.docs) await deleteDoc(doc(db, "Cart", d.id));
  };

  useEffect(() => {
    if (!vendorUid) return;
    getCart(vendorUid).then(setCart);
  }, [vendorUid]);

  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      const updated = exists
        ? prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i))
        : [...prev, { ...product, quantity, supplier: product.supplier }];
      if (vendorUid) saveCart(vendorUid, updated);
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      if (vendorUid) saveCart(vendorUid, updated);
      return updated;
    });
  };

  const updateCartQuantity = (id: string, q: number) => {
    setCart((prev) => {
      const updated = q <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, quantity: q } : i));
      if (vendorUid) saveCart(vendorUid, updated);
      return updated;
    });
  };

  const clearCart = async (): Promise<void> => {
    setCart([]);
    await clearCartDB(vendorUid);
  };

  // ========================= ORDERS =========================
  useEffect(() => {
    const unsub = onSnapshot(ordersRef, (snapshot) => {
      setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
    });
    return () => unsub();
  }, []);

  const addOrder = async (order: Omit<Order, "id" | "date" | "vendor">): Promise<void> => {
    const updatedItems = order.items.map((item) => {
      const prod = products.find((p) => p.name === item.name);
      return { ...item, supplierId: prod?.supplier || "" };
    });

    await addDoc(ordersRef, {
      vendor: vendorUid,
      items: updatedItems,
      total: order.total,
      status: order.status,
      date: serverTimestamp(),
    });
  };

  const reorder = async (order: Order): Promise<void> => {
    const updatedItems = order.items.map((item) => {
      const prod = products.find((p) => p.name === item.name);
      return { ...item, supplierId: prod?.supplier || "" };
    });

    setCart(
      updatedItems.map((i) => ({
        id: Math.random().toString(36).slice(2),
        name: i.name,
        price: i.price,
        unit: "unit",
        category: "Reordered",
        supplier: i.supplierId || "",
        stock: 100,
        quantity: i.qty,
      }))
    );

    await addDoc(ordersRef, {
      vendor: vendorUid || order.vendor,
      items: updatedItems,
      total: order.total,
      status: "ordered",
      date: serverTimestamp(),
    });
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]): Promise<void> => {
    await updateDoc(doc(db, "Order", orderId), { status });
  };

  const deleteOrder = async (orderId: string): Promise<void> => {
    await deleteDoc(doc(db, "Order", orderId));
  };

  // ========================= INVENTORY =========================
  useEffect(() => {
    if (!vendorUid) return;
    const q = query(inventoryRef, where("vendorId", "==", vendorUid));
    const unsub = onSnapshot(q, (snap) => {
      setInventory(snap.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryItem)));
    });
    return () => unsub();
  }, [vendorUid]);

  const addInventoryItem = async (item: Omit<InventoryItem, "id" | "vendorId">) => {
    if (!vendorUid) throw new Error("Vendor must be logged in to add inventory");
    await setDoc(doc(collection(db, "Inventory")), { ...item, vendorId: vendorUid });
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>): Promise<void> => {
    await updateDoc(doc(db, "Inventory", id), updates);
  };

  const deleteInventoryItem = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "Inventory", id));
  };

  return (
    <AppContext.Provider
      value={{
        products,
        filteredProducts,
        searchProducts,
        filterByCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        reorder,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        categories,
        addCategory, // ✅ Added here
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
