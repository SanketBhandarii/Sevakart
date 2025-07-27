import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle, X, Truck, Package, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../../utils/firebase'; // ✅ Import auth to get currentUser

const SupplierOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useApp();
  const [activeTab, setActiveTab] = useState<'new' | 'processing' | 'completed'>('new');

  // ✅ Get Current Supplier UID
  const supplierUid = auth.currentUser?.uid;

  // ✅ Filter orders based on supplierId inside items[]
  const supplierOrders = orders.filter(order =>
    order.items.some((item: any) => item.supplierId === supplierUid)
  );

  // ✅ Categorize Filtered Orders
  const newOrders = supplierOrders.filter(order => order.status === 'ordered');
  const processingOrders = supplierOrders.filter(order => order.status === 'shipped');
  const completedOrders = supplierOrders.filter(order => order.status === 'delivered');

  // ✅ Handlers
  const handleAcceptOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'shipped');
    toast.success('Order accepted and marked as shipped!');
  };

  const handleRejectOrder = async (orderId: string) => {
    await deleteOrder(orderId);
    toast.success('Order rejected and removed successfully');
  };

  const handleMarkDelivered = async (orderId: string) => {
    await updateOrderStatus(orderId, 'delivered');
    toast.success('Order marked as delivered!');
  };

  // ✅ Status Icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered': return <Clock className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // ✅ Reusable Order Card
  const OrderCard = ({ order, showActions = false, showDelivered = false }: { 
    order: any; showActions?: boolean; showDelivered?: boolean;
  }) => (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-dark">Order #{order.id}</h3>
          <p className="text-sm text-text-gray">
            {order.date ? new Date(order.date).toLocaleDateString() : 'No Date'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.status)}
          <span className="text-sm font-medium capitalize text-text-gray">{order.status}</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-text-gray">Vendor:</span>
          <span className="font-medium text-text-dark">{order.vendor}</span>
        </div>

        <div>
          <span className="text-text-gray">Items Ordered:</span>
          <div className="mt-2 space-y-1">
            {order.items
              .filter((item: any) => item.supplierId === supplierUid) // ✅ show only this supplier's items
              .map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-text-dark">{item.name} × {item.qty}</span>
                  <span className="font-medium text-text-dark">₹{item.price * item.qty}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t border-gray-200">
          <span className="font-medium text-text-dark">Total:</span>
          <span className="font-bold text-primary-purple">₹{order.total}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex space-x-3">
          <button onClick={() => handleAcceptOrder(order.id)}
            className="flex-1 bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 flex items-center justify-center space-x-2">
            <CheckCircle size={16} /><span>Accept</span>
          </button>
          <button onClick={() => handleRejectOrder(order.id)}
            className="flex-1 bg-danger text-white px-4 py-2 rounded-lg hover:bg-danger/90 flex items-center justify-center space-x-2">
            <X size={16} /><span>Reject</span>
          </button>
        </div>
      )}

      {showDelivered && (
        <button onClick={() => handleMarkDelivered(order.id)}
          className="w-full btn-primary flex items-center justify-center space-x-2">
          <CheckCircle size={16} /><span>Mark as Delivered</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Order Management</h1>
        <p className="text-text-gray">Process and track your supplier orders</p>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1">
        <div className="flex space-x-1">
          {['new', 'processing', 'completed'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === tab ? 'bg-primary-purple text-white' : 'text-text-gray hover:text-text-dark'
              }`}>
              {tab === 'new' && `New Orders (${newOrders.length})`}
              {tab === 'processing' && `Processing (${processingOrders.length})`}
              {tab === 'completed' && `Completed (${completedOrders.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'new' && (
          newOrders.length > 0 ? newOrders.map(order => <OrderCard key={order.id} order={order} showActions />) :
          <EmptyState icon={<CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />} text="No new orders to process" />
        )}

        {activeTab === 'processing' && (
          processingOrders.length > 0 ? processingOrders.map(order => <OrderCard key={order.id} order={order} showDelivered />) :
          <EmptyState icon={<Truck className="h-12 w-12 text-text-gray mx-auto mb-4" />} text="No orders being processed" />
        )}

        {activeTab === 'completed' && (
          completedOrders.length > 0 ? completedOrders.map(order => <OrderCard key={order.id} order={order} />) :
          <EmptyState icon={<Package className="h-12 w-12 text-text-gray mx-auto mb-4" />} text="No completed orders" />
        )}
      </div>
    </div>
  );
};

// ✅ Empty State Component
const EmptyState = ({ icon, text }: { icon: JSX.Element; text: string }) => (
  <div className="col-span-full text-center py-12">
    {icon}
    <p className="text-text-gray">{text}</p>
  </div>
);

export default SupplierOrders;
