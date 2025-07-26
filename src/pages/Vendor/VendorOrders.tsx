import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Eye, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Modal from '../../components/Common/Modal';

const VendorOrders: React.FC = () => {
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentOrders = orders.filter(order => order.status !== 'delivered');
  const orderHistory = orders.filter(order => order.status === 'delivered');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'shipped':
        return 'bg-primary-blue/10 text-primary-blue border-primary-blue/20';
      case 'delivered':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleReorder = (order: any) => {
    // Add order items to cart and redirect to shop
    window.location.href = '/vendor/shop';
  };

  const OrderCard = ({ order, showReorder = false }: { order: any; showReorder?: boolean }) => (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-dark">{order.id}</h3>
          <p className="text-sm text-text-gray">{new Date(order.date).toLocaleDateString()}</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="text-sm font-medium capitalize">{order.status}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-text-gray">Supplier:</span>
          <span className="font-medium text-text-dark">{order.supplier || 'Multiple Suppliers'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-gray">Items:</span>
          <span className="font-medium text-text-dark">{order.items.length} item(s)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-gray">Total:</span>
          <span className="font-bold text-primary-purple">₹{order.total}</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => handleViewDetails(order)}
          className="flex-1 btn-secondary flex items-center justify-center space-x-2"
        >
          <Eye size={16} />
          <span>View Details</span>
        </button>
        {showReorder && (
          <button
            onClick={() => handleReorder(order)}
            className="flex-1 btn-primary"
          >
            Reorder
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">My Orders</h1>
        <p className="text-text-gray">Track and manage your orders</p>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'current'
                ? 'bg-primary-purple text-white'
                : 'text-text-gray hover:text-text-dark'
            }`}
          >
            Current Orders ({currentOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'history'
                ? 'bg-primary-purple text-white'
                : 'text-text-gray hover:text-text-dark'
            }`}
          >
            Order History ({orderHistory.length})
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'current' ? (
          currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-text-gray mx-auto mb-4" />
              <p className="text-text-gray">No current orders</p>
            </div>
          )
        ) : (
          orderHistory.length > 0 ? (
            orderHistory.map((order) => (
              <OrderCard key={order.id} order={order} showReorder={true} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-text-gray mx-auto mb-4" />
              <p className="text-text-gray">No order history</p>
            </div>
          )
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-dark">{selectedOrder.id}</h3>
                <p className="text-text-gray">Placed on {new Date(selectedOrder.date).toLocaleDateString()}</p>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                {getStatusIcon(selectedOrder.status)}
                <span className="text-sm font-medium capitalize">{selectedOrder.status}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-text-dark mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-dark">{item.name}</p>
                      <p className="text-sm text-text-gray">Quantity: {item.qty}</p>
                    </div>
                    <p className="font-semibold text-text-dark">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-text-dark">Total Amount:</span>
                <span className="text-xl font-bold text-primary-purple">₹{selectedOrder.total}</span>
              </div>
            </div>

            {selectedOrder.status === 'shipped' && (
              <div className="bg-primary-blue/10 p-4 rounded-lg">
                <h4 className="font-medium text-primary-blue mb-2">Tracking Information</h4>
                <p className="text-sm text-text-dark">Your order is on the way and will be delivered soon.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorOrders;