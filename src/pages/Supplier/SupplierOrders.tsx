import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, X, Truck, Package, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const SupplierOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useApp();
  const { getUserName } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'processing' | 'completed'>('new');
  const [vendorNames, setVendorNames] = useState<Record<string, string>>({});
  const [vendorPhones, setVendorPhones] = useState<Record<string, string>>({});

  const supplierUid = auth.currentUser?.uid;

  const supplierOrders = orders.filter(order =>
    order.items.some((item: any) => item.supplierId === supplierUid)
  );

  const fetchVendorDetails = async (vendorUid: string) => {
    if (vendorNames[vendorUid] && vendorPhones[vendorUid]) {
      console.log(`[VendorDetails] Cached: ${vendorUid} -> ${vendorNames[vendorUid]}`);
      return;
    }

    console.log(`[VendorDetails] Fetching details for UID: ${vendorUid}`);
    try {
      const userDoc = await getDoc(doc(db, 'User', vendorUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const name = userData.name || 'Unknown Vendor';
        const phone = userData.phone || 'No phone';
        
        setVendorNames(prev => ({ ...prev, [vendorUid]: name }));
        setVendorPhones(prev => ({ ...prev, [vendorUid]: phone }));
      } else {
        const name = await getUserName(vendorUid);
        setVendorNames(prev => ({ ...prev, [vendorUid]: name }));
        setVendorPhones(prev => ({ ...prev, [vendorUid]: 'No phone' }));
      }
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      const name = await getUserName(vendorUid);
      setVendorNames(prev => ({ ...prev, [vendorUid]: name }));
      setVendorPhones(prev => ({ ...prev, [vendorUid]: 'No phone' }));
    }
  };

  useEffect(() => {
    supplierOrders.forEach(order => {
      if (order.vendor) fetchVendorDetails(order.vendor);
    });
  }, [supplierOrders]);

  const newOrders = supplierOrders.filter(order => order.status === 'ordered');
  const processingOrders = supplierOrders.filter(order => order.status === 'shipped');
  const completedOrders = supplierOrders.filter(order => order.status === 'delivered');

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered': return <Clock className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const OrderCard = ({ order, showActions = false, showDelivered = false }: { 
    order: any; showActions?: boolean; showDelivered?: boolean;
  }) => {
    const vendorName = vendorNames[order.vendor] || 'Loading...';
    const vendorPhone = vendorPhones[order.vendor] || 'Loading...';
    
    return (
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-dark truncate">Order #{order.id}</h3>
            <p className="text-sm text-text-gray">
              {order.date ? new Date(order.date).toLocaleDateString() : 'No Date'}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            {getStatusIcon(order.status)}
            <span className="text-sm font-medium capitalize text-text-gray hidden sm:inline">{order.status}</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-text-gray">Vendor:</span>
            <span className="font-medium text-text-dark truncate ml-2">{vendorName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-text-gray">Vendor Phone:</span>
            <span className="font-medium text-text-dark truncate ml-2">{vendorPhone}</span>
          </div>

          <div>
            <span className="text-text-gray">Items Ordered:</span>
            <div className="mt-2 space-y-1">
              {order.items
                .filter((item: any) => item.supplierId === supplierUid)
                .map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-text-dark truncate">{item.name} × {item.qty}</span>
                    <span className="font-medium text-text-dark ml-2">₹{item.price * item.qty}</span>
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
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
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
  };

  return (
    <div className="space-y-6 p-4 sm:p-0">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Order Management</h1>
        <p className="text-text-gray">Process and track your supplier orders</p>
      </div>

      <div className="glass-card p-1">
        <div className="flex space-x-1">
          {['new', 'processing', 'completed'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === tab ? 'bg-primary-purple text-white' : 'text-text-gray hover:text-text-dark'
              }`}>
              <span className="sm:hidden text-xs">
                {tab === 'new' && `New (${newOrders.length})`}
                {tab === 'processing' && `Process (${processingOrders.length})`}
                {tab === 'completed' && `Done (${completedOrders.length})`}
              </span>
              <span className="hidden sm:inline">
                {tab === 'new' && `New Orders (${newOrders.length})`}
                {tab === 'processing' && `Processing (${processingOrders.length})`}
                {tab === 'completed' && `Completed (${completedOrders.length})`}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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

const EmptyState = ({ icon, text }: { icon: JSX.Element; text: string }) => (
  <div className="col-span-full text-center py-12">
    {icon}
    <p className="text-text-gray">{text}</p>
  </div>
);

export default SupplierOrders;