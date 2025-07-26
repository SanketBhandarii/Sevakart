import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  category: string;
  supplier: string;
  stock: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  vendor: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: 'ordered' | 'shipped' | 'delivered';
  date: string;
  supplier?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  status: 'good' | 'low' | 'critical';
}

interface AppContextType {
  // Products
  products: Product[];
  filteredProducts: Product[];
  searchProducts: (query: string) => void;
  filterByCategory: (category: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const sampleProducts: Product[] = [
  { id: 1, name: "Tomatoes", price: 40, unit: "kg", category: "Vegetables", supplier: "Ramesh Suppliers", stock: 100 },
  { id: 2, name: "Onions", price: 30, unit: "kg", category: "Vegetables", supplier: "Ramesh Suppliers", stock: 150 },
  { id: 3, name: "Cooking Oil", price: 120, unit: "L", category: "Oil & Ghee", supplier: "Oil Depot", stock: 50 },
  { id: 4, name: "Rice", price: 60, unit: "kg", category: "Flour & Rice", supplier: "Grain House", stock: 200 },
  { id: 5, name: "Milk", price: 55, unit: "L", category: "Dairy", supplier: "Dairy Fresh", stock: 80 },
  { id: 6, name: "Garam Masala", price: 300, unit: "kg", category: "Spices", supplier: "Spice King", stock: 25 },
  { id: 7, name: "Wheat Flour", price: 45, unit: "kg", category: "Flour & Rice", supplier: "Grain House", stock: 120 },
  { id: 8, name: "Green Chili", price: 80, unit: "kg", category: "Vegetables", supplier: "Ramesh Suppliers", stock: 60 }
];

const sampleOrders: Order[] = [
  { id: "ORD001", vendor: "Ram Chaat Stall", items: [{ name: "Tomatoes", qty: 10, price: 40 }], total: 400, status: "delivered", date: "2024-12-19", supplier: "Ramesh Suppliers" },
  { id: "ORD002", vendor: "Sharma Foods", items: [{ name: "Cooking Oil", qty: 2, price: 120 }], total: 240, status: "shipped", date: "2024-12-18", supplier: "Oil Depot" },
  { id: "ORD003", vendor: "Delhi Snacks", items: [{ name: "Garam Masala", qty: 1, price: 300 }], total: 300, status: "ordered", date: "2024-12-17", supplier: "Spice King" }
];

const sampleInventory: InventoryItem[] = [
  { id: "INV001", name: "Tomatoes", currentStock: 5, unit: "kg", status: "low" },
  { id: "INV002", name: "Cooking Oil", currentStock: 2, unit: "L", status: "critical" },
  { id: "INV003", name: "Rice", currentStock: 25, unit: "kg", status: "good" },
  { id: "INV004", name: "Onions", currentStock: 15, unit: "kg", status: "good" }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(sampleProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const searchProducts = (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.supplier.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const filterByCategory = (category: string) => {
    if (category === 'all' || !category) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => product.category === category);
    setFilteredProducts(filtered);
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
    setFilteredProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setFilteredProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setFilteredProducts(prev => prev.filter(p => p.id !== id));
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (order: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...order,
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0]
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `INV${String(inventory.length + 1).padStart(3, '0')}`
    };
    setInventory(prev => [...prev, newItem]);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev =>
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  return (
    <AppContext.Provider value={{
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
      inventory,
      addInventoryItem,
      updateInventoryItem
    }}>
      {children}
    </AppContext.Provider>
  );
};