import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Package, AlertTriangle, CheckCircle, Plus, ShoppingCart } from 'lucide-react';
import Modal from '../../components/Common/Modal';
import toast from 'react-hot-toast';

const VendorInventory: React.FC = () => {
  const { inventory, addInventoryItem, addToCart, products } = useApp();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    currentStock: 0,
    unit: 'kg',
    status: 'good' as 'good' | 'low' | 'critical'
  });

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'low').length;
  const criticalStockItems = inventory.filter(item => item.status === 'critical').length;
  const totalValue = inventory.reduce((total, item) => {
    const productPrice = products.find(p => p.name === item.name)?.price || 50;
    return total + (item.currentStock * productPrice);
  }, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-danger" />;
      default:
        return <Package className="h-4 w-4 text-text-gray" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-success/10 text-success border-success/20';
      case 'low':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'critical':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name.trim() || newItem.currentStock < 0) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    // Determine status based on stock level
    let status: 'good' | 'low' | 'critical' = 'good';
    if (newItem.currentStock <= 2) {
      status = 'critical';
    } else if (newItem.currentStock <= 5) {
      status = 'low';
    }

    addInventoryItem({
      ...newItem,
      status
    });

    toast.success('Item added to inventory successfully!');
    setIsAddItemModalOpen(false);
    setNewItem({ name: '', currentStock: 0, unit: 'kg', status: 'good' });
  };

  const handleReorder = (itemName: string) => {
    const product = products.find(p => p.name === itemName);
    if (product) {
      addToCart(product, 5); // Add 5 units by default
      toast.success(`${itemName} added to cart for reorder!`);
      window.location.href = '/vendor/shop';
    } else {
      toast.error('Product not found in shop');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Inventory Management</h1>
          <p className="text-text-gray">Track and manage your stock levels</p>
        </div>
        
        <button
          onClick={() => setIsAddItemModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">Total Items</p>
              <p className="text-2xl font-bold text-text-dark">{totalItems}</p>
            </div>
            <div className="p-3 bg-primary-purple/10 rounded-lg">
              <Package className="h-6 w-6 text-primary-purple" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">Low Stock</p>
              <p className="text-2xl font-bold text-warning">{lowStockItems}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">Critical Stock</p>
              <p className="text-2xl font-bold text-danger">{criticalStockItems}</p>
            </div>
            <div className="p-3 bg-danger/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-danger" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-gray">Total Value</p>
              <p className="text-2xl font-bold text-success">₹{totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <Package className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-text-dark">Stock Items</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-gray uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-text-dark">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-text-dark">{item.currentStock} {item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium capitalize">{item.status} Stock</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(item.status === 'low' || item.status === 'critical') && (
                      <button
                        onClick={() => handleReorder(item.name)}
                        className="btn-secondary flex items-center space-x-1 text-sm px-3 py-1"
                      >
                        <ShoppingCart size={14} />
                        <span>Reorder</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {inventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-text-gray mx-auto mb-4" />
              <p className="text-text-gray">No inventory items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add New Inventory Item"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter item name"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Current Quantity
            </label>
            <input
              type="number"
              min="0"
              value={newItem.currentStock}
              onChange={(e) => setNewItem(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
              placeholder="Enter quantity"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Unit
            </label>
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
              className="input-field"
            >
              <option value="kg">kg</option>
              <option value="L">L</option>
              <option value="piece">piece</option>
              <option value="packet">packet</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddItemModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-text-gray hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorInventory;