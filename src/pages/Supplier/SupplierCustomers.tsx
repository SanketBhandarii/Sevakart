import React, { useState, useMemo } from 'react';
import { Eye, MapPin, Phone, ShoppingCart } from 'lucide-react';
import Modal from '../../components/Common/Modal';
import { useApp } from '../../contexts/AppContext';
import { auth } from '../../utils/firebase'; // adjust as per your setup

interface Customer {
  id: string;
  name: string; // Ideally fetch from Users collection
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

  const { orders , products } = useApp();
  const supplierUid = auth.currentUser?.uid;
  console.log(orders , products );
  

  // Filter orders that include products supplied by current supplier
  const supplierOrders = useMemo(() => {
    if (!supplierUid) return [];
    return orders.filter(order =>
      order.items.some(item => item.supplierId === supplierUid)
    );
  }, [orders, supplierUid]);

  // Aggregate unique vendors (customers) and their stats
  const customers: Customer[] = useMemo(() => {
    const map = new Map<string, Customer>();

    supplierOrders.forEach(order => {
      const vendorId = order.vendor;
      if (!vendorId) return;

      if (!map.has(vendorId)) {
        map.set(vendorId, {
          id: vendorId,
          name: vendorId, // TODO: Replace with vendor name fetched from Users collection
          totalOrders: 0,
          totalBusiness: 0,
          lastOrderDate: new Date(0),
          orders: [],
        });
      }

      const vendorData = map.get(vendorId)!;

      vendorData.totalOrders += 1;
      vendorData.totalBusiness += order.total;

      // Convert Firestore timestamp to JS Date if needed
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

      map.set(vendorId, vendorData);
    });

    // Sort customers by last order date descending (most recent first)
    return Array.from(map.values()).sort(
      (a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime()
    );
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

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <p className="text-2xl font-bold text-primary-purple">{customers.length}</p>
          <p className="text-sm text-text-gray">Total Customers</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-2xl font-bold text-success">
            ₹{customers.reduce((total, c) => total + c.totalBusiness, 0).toLocaleString()}
          </p>
          <p className="text-sm text-text-gray">Total Business</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-2xl font-bold text-primary-blue">
            {customers.reduce((total, c) => total + c.totalOrders, 0)}
          </p>
          <p className="text-sm text-text-gray">Total Orders</p>
        </div>
      </div>

      {/* Customer List */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-text-dark">Customer List</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Total Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-text-dark">{customer.name}</div>
                    {/* TODO: add phone & location if available */}
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
                    <span className="font-semibold text-success">
                      ₹{customer.totalBusiness.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="btn-secondary flex items-center space-x-1 text-sm px-3 py-1"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-text-gray">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-text-dark mb-3">Customer Information</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-text-gray">Name:</span>
                  <span className="font-medium text-text-dark">{selectedCustomer.name}</span>
                </div>
                {/* Add phone and location here if fetched */}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-text-dark mb-3">Business Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-gray">Total Orders:</span>
                  <span className="font-medium text-text-dark">{selectedCustomer.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-gray">Total Business:</span>
                  <span className="font-semibold text-success">
                    ₹{selectedCustomer.totalBusiness.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-gray">Last Order:</span>
                  <span className="font-medium text-text-dark">
                    {selectedCustomer.lastOrderDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-text-dark mb-3">Recent Order History</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedCustomer.orders.length === 0 && (
                  <p className="text-text-gray">No orders found.</p>
                )}
                {selectedCustomer.orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-text-dark">{order.id}</p>
                      <p className="text-sm text-text-gray">{order.items}</p>
                      <p className="text-xs text-text-gray">
                        {order.date.toLocaleDateString()}
                      </p>
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