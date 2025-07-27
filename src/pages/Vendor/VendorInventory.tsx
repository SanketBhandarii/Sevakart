import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Plus,
  ShoppingCart,
} from "lucide-react";
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";
import { auth, db } from "../../utils/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const VendorInventory: React.FC = () => {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    products,
    addOrder,
    filterByCategory,
  } = useApp();

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [orderQty, setOrderQty] = useState(5);

  const [newItem, setNewItem] = useState({
    name: "",
    currentStock: 0,
    unit: "kg",
    status: "good" as "good" | "low" | "critical",
  });

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(
    (item) => item.status === "low"
  ).length;
  const criticalStockItems = inventory.filter(
    (item) => item.status === "critical"
  ).length;
  const totalValue = inventory.reduce((total, item) => {
    const productPrice =
      products.find((p) => p.name === item.name)?.price || 50;
    return total + item.currentStock * productPrice;
  }, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "low":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-danger" />;
      default:
        return <Package className="h-4 w-4 text-text-gray" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-success/10 text-success border-success/20";
      case "low":
        return "bg-warning/10 text-warning border-warning/20";
      case "critical":
        return "bg-danger/10 text-danger border-danger/20";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  /** ✅ Add New Inventory Item */
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItem.name.trim() || newItem.currentStock < 0) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    let status: "good" | "low" | "critical" = "good";
    if (newItem.currentStock <= 2) status = "critical";
    else if (newItem.currentStock <= 5) status = "low";

    try {
      await addInventoryItem({
        name: newItem.name.trim(),
        currentStock: newItem.currentStock,
        unit: newItem.unit,
        status,
      });
      toast.success("Item added successfully!");
      setIsAddItemModalOpen(false);
      setNewItem({ name: "", currentStock: 0, unit: "kg", status: "good" });
    } catch (err) {
      console.error("Error adding item:", err);
      toast.error("Failed to add item");
    }
  };

  /** ✅ Open Reorder Modal */
  const openReorderModal = (item: any) => {
    setSelectedItem(item);
    setOrderQty(5);
    setIsReorderModalOpen(true);
  };

  /** ✅ Confirm Reorder (fetch existing order and update qty) */
  const confirmReorder = async () => {
    if (!selectedItem) return;

    const vendorId = auth.currentUser?.uid || "currentVendor";
    console.log(
      "🔍 Reorder started for Vendor:",
      vendorId,
      "Product:",
      selectedItem.name
    );

    try {
      const ordersRef = collection(db, "Order");
      const q = query(ordersRef, where("vendor", "==", vendorId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn("⚠️ No orders found for vendor. Creating a new order.");
        return createNewOrder(vendorId);
      }

      console.log("📦 Found existing orders for vendor:", snapshot.docs);
      // ✅ Filter manually for product match
      const matchingDoc = snapshot.docs.find((doc) =>
        doc
          .data()
          .items?.some(
            (i: any) =>
              i.name?.toLowerCase() === selectedItem.name?.toLowerCase()
          )
      );
      console.log("🔍 Matching Order Document:", matchingDoc?.id);

      if (!matchingDoc) {
        console.warn(
          "⚠️ No matching product found in vendor's orders. Creating a new order."
        );
        return createNewOrder(vendorId);
      }

      const orderDoc = matchingDoc.data();
      console.log("🟢 Found matching order:", orderDoc);
      console.log("QTY",orderQty);
      // ✅ Update the qty for selected product
      const updatedItems = orderDoc.items.map((i: any) =>
        i.name.toLowerCase() === selectedItem.name.toLowerCase() ? { ...i, qty: orderQty } : i
      );

      const newTotal = updatedItems.reduce(
        (sum: number, i: any) => sum + i.qty * i.price,
        0
      );

      const orderPayload = {
        vendorId,
        supplier: orderDoc.supplier || "",
        status: "ordered" as const,
        total: newTotal,
        items: updatedItems,
      };

      console.log("📦 Final Order Payload (Update):", orderPayload);

      await addOrder(orderPayload);
      filterByCategory("all");
      toast.success(`${selectedItem.name} reordered (${orderQty} units)!`);
      setIsReorderModalOpen(false);
    } catch (err) {
      console.error("❌ Reorder Error:", err);
      toast.error("Failed to reorder item.");
    }
  };

  /** ✅ Helper to create a new order if no previous order exists */
  const createNewOrder = async (vendorId: string) => {
    const product = products.find((p) => p.name === selectedItem.name);
    if (!product) {
      toast.error("Product not found in catalog");
      return;
    }
    const fallbackPayload = {
      vendorId,
      supplier: product.supplierId || "",
      status: "ordered" as const,
      total: product.price * orderQty,
      items: [
        {
          name: product.name,
          qty: orderQty,
          price: product.price,
          supplierId: product.supplierId || "",
        },
      ],
    };
    console.log("📦 Creating new order with payload:", fallbackPayload);
    await addOrder(fallbackPayload);
    filterByCategory("all");
    toast.success(`${product.name} reordered (${orderQty} units)!`);
    setIsReorderModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-text-gray">Track and manage your stock levels</p>
        </div>
        <button
          onClick={() => setIsAddItemModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <p>Total Items</p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </div>
        <div className="glass-card p-6">
          <p>Low Stock</p>
          <p className="text-2xl font-bold text-warning">{lowStockItems}</p>
        </div>
        <div className="glass-card p-6">
          <p>Critical Stock</p>
          <p className="text-2xl font-bold text-danger">{criticalStockItems}</p>
        </div>
        <div className="glass-card p-6">
          <p>Total Value</p>
          <p className="text-2xl font-bold text-success">
            ₹{totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-card">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Stock Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Item</th>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">
                    {item.currentStock} {item.unit}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)}
                      <span className="ml-2 capitalize">
                        {item.status} Stock
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(item.status === "low" || item.status === "critical") && (
                      <button
                        onClick={() => openReorderModal(item)}
                        className="btn-secondary flex items-center space-x-1 px-3 py-1 text-sm"
                      >
                        <ShoppingCart size={14} />
                        <span>Reorder</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>No inventory items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add New Item"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="input-field"
            placeholder="Item Name"
            required
          />
          <input
            type="number"
            min="0"
            value={newItem.currentStock}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                currentStock: parseInt(e.target.value) || 0,
              })
            }
            className="input-field"
            placeholder="Quantity"
            required
          />
          <select
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            className="input-field"
          >
            <option value="kg">kg</option>
            <option value="L">L</option>
            <option value="piece">piece</option>
            <option value="packet">packet</option>
          </select>
          <button type="submit" className="btn-primary w-full">
            Add Item
          </button>
        </form>
      </Modal>

      {/* Reorder Modal */}
      <Modal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        title="Reorder Item"
      >
        <div className="space-y-4">
          <p>
            Reordering: <strong>{selectedItem?.name}</strong>
          </p>
          <input
            type="number"
            min="1"
            value={orderQty}
            onChange={(e) => setOrderQty(Number(e.target.value))}
            className="input-field"
          />
          <button onClick={confirmReorder} className="btn-primary w-full">
            Confirm Reorder
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default VendorInventory;
