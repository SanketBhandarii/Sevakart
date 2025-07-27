import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle, X, Truck, Package, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const SupplierOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useApp();
  const [activeTab, setActiveTab] = useState<'new' | 'processing' | 'completed'>('new');

  // ✅ Categorize Orders
  const newOrders = orders.filter(order => order.status === 'ordered');
  const processingOrders = orders.filter(order => order.status === 'shipped');
  const completedOrders = orders.filter(order => order.status === 'delivered');

  // ✅ Handlers using AppContext methods
  const handleAcceptOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'shipped');
    toast.success('Order accepted and marked as shipped!');
  };

  const handleRejectOrder = async (orderId: string) => {
    // 🔹 Optionally delete the order or update to "rejected" if you add such a status
    await deleteOrder(orderId);
    toast.success('Order rejected and removed successfully');
  };

  const handleMarkDelivered = async (orderId: string) => {
    await updateOrderStatus(orderId, 'delivered');
    toast.success('Order marked as delivered!');
  };

  // ✅ Status Icon Helper
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
    order: any; 
    showActions?: boolean; 
    showDelivered?: boolean;
  }) => (
    <div className="glass-card p-6">
      {/* Order Header */}
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

      {/* Order Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-text-gray">Vendor:</span>
          <span className="font-medium text-text-dark">{order.vendor}</span>
        </div>

        <div>
          <span className="text-text-gray">Items Ordered:</span>
          <div className="mt-2 space-y-1">
            {order.items.map((item: any, index: number) => (
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

      {/* Action Buttons */}
      {showActions && (
        <div className="flex space-x-3">
          <button
            onClick={() => handleAcceptOrder(order.id)}
            className="flex-1 bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <CheckCircle size={16} />
            <span>Accept</span>
          </button>
          <button
            onClick={() => handleRejectOrder(order.id)}
            className="flex-1 bg-danger text-white px-4 py-2 rounded-lg hover:bg-danger/90 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <X size={16} />
            <span>Reject</span>
          </button>
        </div>
      )}

      {showDelivered && (
        <button
          onClick={() => handleMarkDelivered(order.id)}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <CheckCircle size={16} />
          <span>Mark as Delivered</span>
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
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === tab ? 'bg-primary-purple text-white' : 'text-text-gray hover:text-text-dark'
              }`}
            >
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
          newOrders.length > 0 ? newOrders.map(order => (
            <OrderCard key={order.id} order={order} showActions />
          )) : (
            <div className="col-span-full text-center py-12">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-text-gray">No new orders to process</p>
            </div>
          )
        )}

        {activeTab === 'processing' && (
          processingOrders.length > 0 ? processingOrders.map(order => (
            <OrderCard key={order.id} order={order} showDelivered />
          )) : (
            <div className="col-span-full text-center py-12">
              <Truck className="h-12 w-12 text-text-gray mx-auto mb-4" />
              <p className="text-text-gray">No orders being processed</p>
            </div>
          )
        )}

        {activeTab === 'completed' && (
          completedOrders.length > 0 ? completedOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          )) : (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-text-gray mx-auto mb-4" />
              <p className="text-text-gray">No completed orders</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SupplierOrders;
