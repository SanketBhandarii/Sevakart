import React, { useState, useMemo, useEffect } from 'react';
import { Eye, ShoppingCart } from 'lucide-react';
import Modal from '../../components/Common/Modal';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

interface Customer {
  id: string;
  name: string;
  totalOrders: number;
  totalBusiness: number;
  lastOrderDate: Date;
  orders: {
    id: string;
    date: Date;
    items: string;
    amount: number;
  }[];
}

const SupplierCustomers: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { orders } = useApp();
  const { getUserName } = useAuth();
  const supplierUid = auth.currentUser?.uid;

  const [vendorNames, setVendorNames] = useState<Record<string, string>>({});
  const [vendorPhones, setVendorPhones] = useState<Record<string, string>>({});

  const supplierOrders = useMemo(() => {
    if (!supplierUid) return [];
    return orders.filter(order =>
      order.items.some(item => item.supplierId === supplierUid)
    );
  }, [orders, supplierUid]);

  const customers: Customer[] = useMemo(() => {
    const map = new Map<string, Customer>();

    supplierOrders.forEach(order => {
      const vendorId = order.vendor;
      if (!vendorId) return;

      if (!map.has(vendorId)) {
        map.set(vendorId, {
          id: vendorId,
          name: vendorNames[vendorId] || vendorId,
          totalOrders: 0,
          totalBusiness: 0,
          lastOrderDate: new Date(0),
          orders: [],
        });
      }

      const vendorData = map.get(vendorId)!;
      vendorData.totalOrders += 1;
      vendorData.totalBusiness += order.total;

      const orderDate = order.date?.toDate ? order.date.toDate() : new Date(order.date);
      if (orderDate > vendorData.lastOrderDate) {
        vendorData.lastOrderDate = orderDate;
      }

      vendorData.orders.push({
        id: order.id,
        date: orderDate,
        items: order.items.map(i => i.name).join(', '),
        amount: order.total,
      });
    });

    return Array.from(map.values()).sort((a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime());
  }, [supplierOrders, vendorNames]);

  const fetchVendorDetails = async (vendorId: string) => {
    if (vendorNames[vendorId] && vendorPhones[vendorId]) {
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'User', vendorId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const name = userData.name || 'Unknown Vendor';
        const phone = userData.phone || 'No phone';
        
        setVendorNames(prev => ({ ...prev, [vendorId]: name }));
        setVendorPhones(prev => ({ ...prev, [vendorId]: phone }));
      } else {
        const name = await getUserName(vendorId);
        setVendorNames(prev => ({ ...prev, [vendorId]: name }));
        setVendorPhones(prev => ({ ...prev, [vendorId]: 'No phone' }));
      }
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      const name = await getUserName(vendorId);
      setVendorNames(prev => ({ ...prev, [vendorId]: name }));
      setVendorPhones(prev => ({ ...prev, [vendorId]: 'No phone' }));
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      const uniqueVendorIds = [...new Set(supplierOrders.map(o => o.vendor).filter(Boolean))];
      for (const vendorId of uniqueVendorIds) {
        await fetchVendorDetails(vendorId);
      }
    };
    fetchDetails();
  }, [supplierOrders]);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Customer Management</h1>
        <p className="text-text-gray">View and manage your vendor customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <p className="text-2xl font-bold text-primary-purple">{customers.length}</p>
          <p className="text-sm text-text-gray">Total Customers</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-2xl font-bold text-success">
            ₹{customers.reduce((t, c) => t + c.totalBusiness, 0).toLocaleString()}
          </p>
          <p className="text-sm text-text-gray">Total Business</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-2xl font-bold text-primary-blue">
            {customers.reduce((t, c) => t + c.totalOrders, 0)}
          </p>
          <p className="text-sm text-text-gray">Total Orders</p>
        </div>
      </div>

      <div className="glass-card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-text-dark">Customer List</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">Vendor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">Total Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">Last Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">Total Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-text-dark">
                      {vendorNames[customer.id] || "Loading..."}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-text-dark">
                      {vendorPhones[customer.id] || "Loading..."}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-dark">
                    <div className="flex items-center">
                      <ShoppingCart size={16} className="mr-2 text-primary-blue" />
                      {customer.totalOrders}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-dark">
                    {customer.lastOrderDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-success">₹{customer.totalBusiness.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleViewDetails(customer)} className="btn-secondary flex items-center space-x-1 text-sm px-3 py-1">
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-text-gray">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Customer Details" size="lg">
        {selectedCustomer && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-text-dark mb-3">Customer Information</h4>
              <div className="space-y-2">
                <p><span className="text-text-gray">Name:</span> <span className="font-medium">{vendorNames[selectedCustomer.id] || selectedCustomer.name}</span></p>
                <p><span className="text-text-gray">Phone:</span> <span className="font-medium">{vendorPhones[selectedCustomer.id] || 'Loading...'}</span></p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-text-dark mb-3">Business Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between"><span>Total Orders:</span><span>{selectedCustomer.totalOrders}</span></div>
                <div className="flex justify-between"><span>Total Business:</span><span className="text-success">₹{selectedCustomer.totalBusiness.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Last Order:</span><span>{selectedCustomer.lastOrderDate.toLocaleDateString()}</span></div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-text-dark mb-3">Recent Order History</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedCustomer.orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-text-gray">{order.items}</p>
                      <p className="text-xs text-text-gray">{order.date.toLocaleDateString()}</p>
                    </div>
                    <p className="font-semibold text-primary-purple">₹{order.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupplierCustomers; 