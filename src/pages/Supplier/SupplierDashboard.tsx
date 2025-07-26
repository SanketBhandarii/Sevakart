import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShoppingCart, 
  Package, 
  IndianRupee, 
  Users, 
  ArrowRight, 
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const SupplierDashboard: React.FC = () => {
  const { orders, products } = useApp();
  const { user } = useAuth();

  const todayOrders = orders.filter(order => {
    const today = new Date().toISOString().split('T')[0];
    return order.date === today;
  });

  const weekSales = orders
    .filter(order => {
      const orderDate = new Date(order.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate >= weekAgo;
    })
    .reduce((total, order) => total + order.total, 0);

  const totalProducts = products.length;
  const totalCustomers = 156; // Mock data

  const newOrders = orders.filter(order => order.status === 'ordered');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Welcome back, {user?.name}!</h1>
          <p className="text-text-gray">Here's your business overview today</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Orders */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">Today's Orders</p>
              <p className="text-2xl font-bold text-text-dark">{todayOrders.length} New Orders</p>
            </div>
            <div className="p-3 bg-primary-purple/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary-purple" />
            </div>
          </div>
          <Link 
            to="/supplier/orders"
            className="inline-flex items-center space-x-1 text-primary-purple hover:text-primary-purple/80 text-sm font-medium mt-4"
          >
            <span>Process Orders</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* This Week Sales */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">This Week Sales</p>
              <p className="text-2xl font-bold text-text-dark">₹{weekSales.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <p className="text-sm text-success">+22% from last week</p>
              </div>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <IndianRupee className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        {/* Products Listed */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">Products Listed</p>
              <p className="text-2xl font-bold text-text-dark">{totalProducts} Products</p>
            </div>
            <div className="p-3 bg-primary-blue/10 rounded-lg">
              <Package className="h-6 w-6 text-primary-blue" />
            </div>
          </div>
          <Link 
            to="/supplier/products"
            className="inline-flex items-center space-x-1 text-primary-purple hover:text-primary-purple/80 text-sm font-medium mt-4"
          >
            <span>Manage Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Customers */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">Customers</p>
              <p className="text-2xl font-bold text-text-dark">{totalCustomers} Vendors</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <Users className="h-6 w-6 text-warning" />
            </div>
          </div>
          <Link 
            to="/supplier/customers"
            className="inline-flex items-center space-x-1 text-primary-purple hover:text-primary-purple/80 text-sm font-medium mt-4"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-dark">Recent Orders</h3>
          <Link 
            to="/supplier/orders"
            className="text-primary-purple hover:text-primary-purple/80 text-sm font-medium"
          >
            View All Orders
          </Link>
        </div>

        <div className="space-y-4">
          {newOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-text-dark">{order.id}</h4>
                  <span className="text-sm text-text-gray">-</span>
                  <span className="text-sm text-text-gray">{order.vendor}</span>
                </div>
                <p className="text-sm text-text-gray mt-1">
                  {order.items.map(item => `${item.name} ${item.qty}${item.name.includes('Oil') ? 'L' : 'kg'}`).join(', ')}
                </p>
              </div>
              
              <div className="text-right mr-4">
                <p className="font-semibold text-text-dark">₹{order.total}</p>
                <p className="text-sm text-text-gray">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              
              <button className="btn-primary text-sm px-4 py-2">
                Process
              </button>
            </div>
          ))}

          {newOrders.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-text-gray">No new orders to process</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;