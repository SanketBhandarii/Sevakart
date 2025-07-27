import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { Eye, Package, Truck, CheckCircle, Clock } from "lucide-react";
import Modal from "../../components/Common/Modal";
import { auth } from "../../utils/firebase";
import toast from "react-hot-toast";

const VendorOrders: React.FC = () => {
  const { orders, reorder } = useApp();
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingReorder, setLoadingReorder] = useState<string | null>(null);

  const vendorUid = auth.currentUser?.uid;

  // ✅ Filter orders only for the logged-in vendor
  const myOrders = orders.filter(order => order.vendor === vendorUid);
  const currentOrders = myOrders.filter(order => order.status !== "delivered");
  const orderHistory = myOrders.filter(order => order.status === "delivered");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ordered": return <Clock className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // ✅ Enhanced reorder handler: creates new order + cart + redirect
  const handleReorder = async (order: any) => {
    try {
      setLoadingReorder(order.id);
      await reorder(order);  // ✅ now also saves to Firestore
      toast.success("Order reordered successfully!");
    } catch (err) {
      console.error("Reorder failed", err);
      alert("Failed to reorder. Please try again.");
    } finally {
      setLoadingReorder(null);
    }
  };

  // ✅ Order Card UI
  const OrderCard = ({ order, showReorder = false }: { order: any; showReorder?: boolean }) => (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Order #{order.id}</h3>
          <p className="text-sm text-gray-500">
            {order.date?.toDate ? order.date.toDate().toLocaleDateString() : new Date(order.date).toLocaleDateString()}
          </p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="text-sm font-medium capitalize">{order.status}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Supplier:</span>
          <span className="font-medium">{order.supplier || "Multiple Suppliers"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Items:</span>
          <span className="font-medium">{order.items?.length || 0} item(s)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total:</span>
          <span className="font-bold text-purple-600">₹{order.total}</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button onClick={() => handleViewDetails(order)} className="flex-1 btn-secondary flex items-center justify-center space-x-2">
          <Eye size={16} /> <span>View Details</span>
        </button>
        {showReorder && (
          <button 
            onClick={() => handleReorder(order)} 
            disabled={loadingReorder === order.id} 
            className={`flex-1 btn-primary ${loadingReorder === order.id ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loadingReorder === order.id ? "Reordering..." : "Reorder"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-gray-500">Track and manage your orders with suppliers</p>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("current")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium ${activeTab === "current" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
          >
            Current Orders ({currentOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium ${activeTab === "history" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
          >
            Order History ({orderHistory.length})
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "current" ? (
          currentOrders.length > 0 ? currentOrders.map(order => <OrderCard key={order.id} order={order} />) :
          <EmptyState text="No current orders" />
        ) : (
          orderHistory.length > 0 ? orderHistory.map(order => <OrderCard key={order.id} order={order} showReorder />) :
          <EmptyState text="No order history" />
        )}
      </div>

      {/* Order Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Order Details" size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Order #{selectedOrder.id}</h3>
                <p className="text-gray-500">
                  Placed on {selectedOrder.date?.toDate ? selectedOrder.date.toDate().toLocaleDateString() : new Date(selectedOrder.date).toLocaleDateString()}
                </p>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                {getStatusIcon(selectedOrder.status)}
                <span className="text-sm font-medium capitalize">{selectedOrder.status}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                    </div>
                    <p className="font-semibold">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between">
              <span className="text-lg font-medium">Total Amount:</span>
              <span className="text-xl font-bold text-purple-600">₹{selectedOrder.total}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ✅ Empty State UI
const EmptyState = ({ text }: { text: string }) => (
  <div className="col-span-full text-center py-12">
    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">{text}</p>
  </div>
);

export default VendorOrders;
