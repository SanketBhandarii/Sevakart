import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import Modal from '../../components/Common/Modal';
import toast from 'react-hot-toast';

const SupplierProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    price: 0,
    stock: 0,
    unit: 'kg',
    supplier: 'Your Store' // This would be dynamic based on supplier
  });

  const categories = [
    'Vegetables',
    'Spices',
    'Oil & Ghee',
    'Flour & Rice',
    'Dairy',
    'Others'
  ];

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.price <= 0 || formData.stock < 0) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    addProduct(formData);
    toast.success('Product added successfully!');
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.price <= 0 || formData.stock < 0) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    updateProduct(editingProduct.id, formData);
    toast.success('Product updated successfully!');
    setIsEditModalOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleDeleteProduct = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
      toast.success('Product deleted successfully!');
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      supplier: product.supplier
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Vegetables',
      price: 0,
      stock: 0,
      unit: 'kg',
      supplier: 'Your Store'
    });
  };

  const ProductForm = ({ onSubmit, title }: { onSubmit: (e: React.FormEvent) => void; title: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">
          Product Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter product name"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="input-field"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Price per Unit
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            placeholder="Enter price"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Unit
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            className="input-field"
          >
            <option value="kg">kg</option>
            <option value="L">L</option>
            <option value="piece">piece</option>
            <option value="packet">packet</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">
          Stock Quantity
        </label>
        <input
          type="number"
          min="0"
          value={formData.stock}
          onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
          placeholder="Enter stock quantity"
          className="input-field"
          required
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setEditingProduct(null);
            resetForm();
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-text-gray hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 btn-primary"
        >
          {title}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Product Management</h1>
          <p className="text-text-gray">Manage your product catalog</p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="glass-card p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-text-dark">{product.name}</h3>
              <p className="text-sm text-text-gray">{product.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-purple">
                  ₹{product.price}/{product.unit}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.stock > 10 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {product.stock} in stock
                </span>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="flex-1 bg-danger text-white px-3 py-2 rounded-lg hover:bg-danger/90 transition-colors duration-200 text-sm flex items-center justify-center space-x-1"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-text-gray mx-auto mb-4" />
          <p className="text-text-gray">No products added yet</p>
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Product"
      >
        <ProductForm onSubmit={handleAddProduct} title="Add Product" />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
          resetForm();
        }}
        title="Edit Product"
      >
        <ProductForm onSubmit={handleEditProduct} title="Update Product" />
      </Modal>
    </div>
  );
};

export default SupplierProducts;