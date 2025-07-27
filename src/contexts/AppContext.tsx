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
  supplier: string; // Supplier name
  supplierId: string; // ✅ Supplier UID
  stock: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  vendor: string; // ✅ Vendor UID
  items: { name: string; qty: number; price: number; supplierId?: string }[];
  total: number;
  status: "ordered" | "shipped" | "delivered";
  date: any; // Firestore timestamp or string
  supplier?: string; // ✅ Supplier UID or "multiple"
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  status: "good" | "low" | "critical";
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
  addOrder: (
    order: Omit<Order, "id" | "date" | "vendor"> & { vendorId: string }
  ) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: Order["status"]
  ) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  reorder: (order: Order) => void;

  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, "id">) => Promise<void>;
  updateInventoryItem: (
    id: string,
    updates: Partial<InventoryItem>
  ) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
}

// ========================= Context =========================
const AppContext = createContext<AppContextType | undefined>(undefined);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// ========================= Provider =========================
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
      const raw = snapshot.docs.map((doc) => {
        const data = doc.data() as { name?: string };
        return data.name?.trim() || doc.id;
      });
      const uniqueCategories = Array.from(new Set(raw));
      setCategories(["all", ...uniqueCategories]);
    });
    return () => unsub();
  }, []);

  // ========================= PRODUCTS (Realtime) =========================
  useEffect(() => {
    const unsub = onSnapshot(productsRef, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Product)
      );
      setProducts(data);
      setFilteredProducts(data);
    });
    return () => unsub();
  }, []);

  // ========================= PRODUCT FUNCTIONS =========================
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
    setFilteredProducts(
      category === "all"
        ? products
        : products.filter((p) => p.category === category)
    );
  };

  const addProduct = async (product: Omit<Product, "id">) => {
    await addDoc(productsRef, product);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await updateDoc(doc(db, "Products", id), updates);
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "Products", id));
  };

  // ========================= CART HELPERS (Firestore Only) =========================
  const getCart = async (vendorId?: string) => {
    if (!vendorId) return [];
    const q = query(cartsRef, where("vendorId", "==", vendorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as CartItem);
  };

  const saveCart = async (vendorId: string, cartItems: CartItem[]) => {
    if (!vendorId) return;
    const q = query(cartsRef, where("vendorId", "==", vendorId));
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, "Carts", d.id));
    }
    for (const item of cartItems) {
      await setDoc(doc(db, "Carts", `${vendorId}_${item.id}`), {
        vendorId,
        ...item,
      });
    }
  };

  const clearCartDB = async (vendorId?: string) => {
    if (!vendorId) return;
    const q = query(cartsRef, where("vendorId", "==", vendorId));
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, "Carts", d.id));
    }
  };


  // ========================= LOAD CART FROM FIRESTORE =========================
  useEffect(() => {
    const loadCart = async () => {
      if (!vendorUid) return;
      const savedCart = await getCart(vendorUid);
      setCart(savedCart);
    };
    loadCart();
  }, [vendorUid]);

  // ========================= CART FUNCTIONS =========================
  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      const updated = exists
        ? prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...prev, { ...product, quantity }];
      if (vendorUid) saveCart(vendorUid, updated).catch(console.error);
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      if (vendorUid) saveCart(vendorUid, updated).catch(console.error);
      return updated;
    });
  };

  const updateCartQuantity = (id: string, q: number) => {
    setCart((prev) => {
      const updated =
        q <= 0
          ? prev.filter((i) => i.id !== id)
          : prev.map((i) => (i.id === id ? { ...i, quantity: q } : i));
      if (vendorUid) saveCart(vendorUid, updated).catch(console.error);
      return updated;
    });
  };

  const clearCart = async () => {
    setCart([]);
    await clearCartDB(vendorUid);
  };

  // ========================= ORDERS (Realtime) =========================
  useEffect(() => {
    const unsub = onSnapshot(ordersRef, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Order)
      );
      setOrders(data);
    });
    return () => unsub();
  }, []);

  // ✅ Reorder: load previous items back into cart
  const reorder = async (order: Order) => {
    // 1️⃣ Map previous order items into new cart items
    const mappedItems: CartItem[] = order.items.map((item) => {
      const originalProduct = products.find(
        (p) => p.name === item.name && p.supplierId === item.supplierId
      );

      return {
        id: originalProduct?.id || Math.random().toString(36).slice(2),
        name: item.name,
        price: item.price,
        unit: originalProduct?.unit || "unit",
        category: originalProduct?.category || "Reordered",
        supplier: originalProduct?.supplier || "Previous Supplier",
        supplierId: item.supplierId || "",
        stock: originalProduct?.stock || 100,
        quantity: item.qty,
        image: originalProduct?.image,
      };
    });

    // 2️⃣ Update cart with reordered items
    setCart(mappedItems);

    // 3️⃣ Determine supplier field (single or multiple)
    const supplierIds = [
      ...new Set(mappedItems.map((i) => i.supplierId || "")),
    ];
    const supplierField =
      supplierIds.length === 1 ? supplierIds[0] : "multiple";

    // 4️⃣ Create a new order object
    const newOrder = {
      vendor: auth.currentUser?.uid || order.vendor, // ✅ Current vendor UID or fallback
      items: mappedItems.map((i) => ({
        name: i.name,
        qty: i.quantity,
        price: i.price,
        supplierId: i.supplierId || "",
      })),
      total: mappedItems.reduce((t, i) => t + i.price * i.quantity, 0),
      status: "ordered" as const,
      supplier: supplierField,
      date: serverTimestamp(),
    };

    // 5️⃣ Save new order in Firestore
    await addDoc(collection(db, "Order"), newOrder);
  };

  // ✅ Add Order: stores supplier UID & vendor UID
  const addOrder = async (
    order: Omit<Order, "id" | "date" | "vendor"> & { vendorId: string }
  ) => {
    const supplierIds = [
      ...new Set(order.items.map((item) => item.supplierId || "")),
    ];
    const supplierField =
      supplierIds.length === 1 ? supplierIds[0] : "multiple";

    const cleanItems = order.items.map((item) => ({
      name: String(item.name || ""),
      qty: Number(item.qty) || 0,
      price: Number(item.price) || 0,
      supplierId: item.supplierId || "",
    }));

    const newOrder = {
      vendor: auth.currentUser?.uid, // ✅ Vendor UID from caller
      items: cleanItems,
      total: Number(order.total) || 0,
      status: order.status || "ordered",
      supplier: supplierField, // ✅ Single supplier UID or "multiple"
      date: serverTimestamp(),
    };

    await addDoc(ordersRef, newOrder);
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    await updateDoc(doc(db, "Order", orderId), { status });
  };

  const deleteOrder = async (orderId: string) => {
    await deleteDoc(doc(db, "Order", orderId));
  };

  // ========================= INVENTORY (Placeholder) =========================
  useEffect(() => {
    const unsub = onSnapshot(inventoryRef, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as InventoryItem)
      );
      setInventory(data);
    });
    return () => unsub();
  }, []);

  const addInventoryItem = async (item: Omit<InventoryItem, "id">) => {
    await addDoc(inventoryRef, item);
  };

  const updateInventoryItem = async (
    id: string,
    updates: Partial<InventoryItem>
  ) => {
    await updateDoc(doc(db, "Inventory", id), updates);
  };

  const deleteInventoryItem = async (id: string) => {
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
