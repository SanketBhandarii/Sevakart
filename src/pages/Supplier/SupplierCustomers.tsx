import React, { useState } from 'react';
import { Eye, MapPin, Phone, ShoppingCart } from 'lucide-react';
import Modal from '../../components/Common/Modal';

const SupplierCustomers: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock customer data
  const customers = [
    {
      id: 1,
      name: 'Ram Chaat Stall',
      location: 'Connaught Place, Delhi',
      phone: '9876543210',
      totalOrders: 24,
      lastOrderDate: '2024-12-18',
      totalBusiness: 12450,
      orders: [
        { id: 'ORD001', date: '2024-12-18', items: 'Tomatoes, Onions', amount: 400 },
        { id: 'ORD004', date: '2024-12-15', items: 'Green Chili', amount: 200 },
        { id: 'ORD007', date: '2024-12-12', items: 'Tomatoes', amount: 300 }
      ]
    },
    {
      id: 2,
      name: 'Sharma Foods',
      location: 'Karol Bagh, Delhi',
      phone: '9876543211',
      totalOrders: 18,
      lastOrderDate: '2024-12-17',
      totalBusiness: 8900,
      orders: [
        { id: 'ORD002', date: '2024-12-17', items: 'Cooking Oil', amount: 240 },
        { id: 'ORD005', date: '2024-12-14', items: 'Rice', amount: 300 },
        { id: 'ORD008', date: '2024-12-11', items: 'Wheat Flour', amount: 180 }
      ]
    },
    {
      id: 3,
      name: 'Delhi Snacks',
      location: 'Lajpat Nagar, Delhi',
      phone: '9876543212',
      totalOrders: 32,
      lastOrderDate: '2024-12-16',
      totalBusiness: 15600,
      orders: [
        { id: 'ORD003', date: '2024-12-16', items: 'Garam Masala', amount: 300 },
        { id: 'ORD006', date: '2024-12-13', items: 'Oil, Spices', amount: 450 },
        { id: 'ORD009', date: '2024-12-10', items: 'Vegetables', amount: 350 }
      ]
    },
    {
      id: 4,
      name: 'Punjabi Dhaba',
      location: 'Paharganj, Delhi',
      phone: '9876543213',
      totalOrders: 15,
      lastOrderDate: '2024-12-15',
      totalBusiness: 7200,
      orders: [
        { id: 'ORD010', date: '2024-12-15', items: 'Onions, Tomatoes', amount: 320 },
        { id: 'ORD011', date: '2024-12-12', items: 'Rice, Oil', amount: 380 }
      ]
    }
  ];

  const handleViewDetails = (customer: any) => {
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
        <div className="glass-card p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-purple">{customers.length}</p>
            <p className="text-sm text-text-gray">Total Customers</p>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">₹{customers.reduce((total, customer) => total + customer.totalBusiness, 0).toLocaleString()}</p>
            <p className="text-sm text-text-gray">Total Business</p>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-blue">{customers.reduce((total, customer) => total + customer.totalOrders, 0)}</p>
            <p className="text-sm text-text-gray">Total Orders</p>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-text-dark">Vendor List</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Location
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
                    <div>
                      <div className="font-medium text-text-dark">{customer.name}</div>
                      <div className="flex items-center text-sm text-text-gray">
                        <Phone size={12} className="mr-1" />
                        +91 {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-text-gray">
                      <MapPin size={12} className="mr-1" />
                      {customer.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-text-dark">
                      <ShoppingCart size={16} className="mr-2 text-primary-blue" />
                      {customer.totalOrders}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-dark">
                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-success">₹{customer.totalBusiness.toLocaleString()}</span>
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
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-text-dark mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-text-gray">Name:</span>
                    <span className="font-medium text-text-dark">{selectedCustomer.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={14} className="text-text-gray" />
                    <span className="text-text-dark">+91 {selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} className="text-text-gray" />
                    <span className="text-text-dark">{selectedCustomer.location}</span>
                  </div>
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
                    <span className="font-semibold text-success">₹{selectedCustomer.totalBusiness.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-gray">Last Order:</span>
                    <span className="font-medium text-text-dark">
                      {new Date(selectedCustomer.lastOrderDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-text-dark mb-3">Recent Order History</h4>
              <div className="space-y-3">
                {selectedCustomer.orders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-dark">{order.id}</p>
                      <p className="text-sm text-text-gray">{order.items}</p>
                      <p className="text-xs text-text-gray">{new Date(order.date).toLocaleDateString()}</p>
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