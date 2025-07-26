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
  Clock,
  AlertTriangle
} from 'lucide-react';

const VendorDashboard: React.FC = () => {
  const { orders, inventory, cart } = useApp();
  const { user } = useAuth();

  const todayOrders = orders.filter(order => {
    const today = new Date().toISOString().split('T')[0];
    return order.date === today;
  });

  const deliveredToday = todayOrders.filter(order => order.status === 'delivered').length;
  const pendingToday = todayOrders.filter(order => order.status !== 'delivered').length;

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'low' || item.status === 'critical').length;

  const weekSpending = orders
    .filter(order => {
      const orderDate = new Date(order.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate >= weekAgo;
    })
    .reduce((total, order) => total + order.total, 0);

  const recentActivities = [
    { text: "Tomatoes delivered", time: "2 hours ago", type: "success" },
    { text: "Oil order placed", time: "Yesterday", type: "info" },
    { text: "Onions running low", time: "2 days ago", type: "warning" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Welcome back, {user?.name}!</h1>
          <p className="text-text-gray">Here's what's happening with your business today</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Orders */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">Today's Orders</p>
              <p className="text-2xl font-bold text-text-dark">{todayOrders.length} Orders</p>
              <p className="text-sm text-text-gray mt-1">
                {deliveredToday} Delivered, {pendingToday} Pending
              </p>
            </div>
            <div className="p-3 bg-primary-purple/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary-purple" />
            </div>
          </div>
          <Link 
            to="/vendor/orders"
            className="inline-flex items-center space-x-1 text-primary-purple hover:text-primary-purple/80 text-sm font-medium mt-4"
          >
            <span>View All Orders</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Current Stock */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">Current Stock</p>
              <p className="text-2xl font-bold text-text-dark">{totalItems} Items</p>
              <p className="text-sm text-danger mt-1">
                {lowStockItems} Low Stock
              </p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <Package className="h-6 w-6 text-warning" />
            </div>
          </div>
          <Link 
            to="/vendor/inventory"
            className="inline-flex items-center space-x-1 text-primary-purple hover:text-primary-purple/80 text-sm font-medium mt-4"
          >
            <span>Manage Stock</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* This Week Spending */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">This Week Spending</p>
              <p className="text-2xl font-bold text-text-dark">₹{weekSpending.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <p className="text-sm text-success">+15% from last week</p>
              </div>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <IndianRupee className="h-6 w-6 text-success" />
            </div>
          </div>
          <Link 
            to="/vendor/orders"
            className="inline-flex items-center space-x-1 text-primary-purple hover:text-primary-purple/80 text-sm font-medium mt-4"
          >
            <span>View Details</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              to="/vendor/shop"
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <ShoppingCart size={20} />
              <span>Order Supplies</span>
            </Link>
            <Link 
              to="/vendor/inventory"
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Package size={20} />
              <span>Check Stock</span>
            </Link>
          </div>

          {/* Favorite Suppliers */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-gray">Favorite Suppliers</p>
              <span className="text-lg font-semibold text-text-dark">8 Suppliers</span>
            </div>
            <Link 
              to="/vendor/shop"
              className="inline-flex items-center space-x-1 text-primary-purple hover:text-primary-purple/80 text-sm font-medium"
            >
              <Users size={16} />
              <span>Browse More</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'success' ? 'bg-success/10' :
                  activity.type === 'warning' ? 'bg-warning/10' : 'bg-primary-blue/10'
                }`}>
                  {activity.type === 'success' && <Package className="h-4 w-4 text-success" />}
                  {activity.type === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                  {activity.type === 'info' && <Clock className="h-4 w-4 text-primary-blue" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-dark">{activity.text}</p>
                  <p className="text-xs text-text-gray">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;