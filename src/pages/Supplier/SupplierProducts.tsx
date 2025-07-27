import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import Modal from '../../components/Common/Modal';
import toast from 'react-hot-toast';
import { Product } from '../../contexts/AppContext';

const SupplierProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useApp(); // ✅ fetch categories from context
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    unit: 'kg',
    supplier: 'Your Store',
  });

  // ✅ Initialize category with the first available category
  React.useEffect(() => {
    if (categories.length > 1 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[1] })); // skip "all"
    }
  }, [categories]);

  // ✅ Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.price <= 0 || formData.stock < 0) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    try {
      await addProduct(formData);
      toast.success('Product added successfully!');
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add product. Check permissions.');
    }
  };

  // ✅ Edit Product
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.price <= 0 || formData.stock < 0) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    if (!editingProduct) return;

    try {
      await updateProduct(editingProduct.id, formData);
      toast.success('Product updated successfully!');
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product.');
    }
  };

  // ✅ Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete product.');
      }
    }
  };

  // ✅ Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      supplier: product.supplier,
    });
    setIsEditModalOpen(true);
  };

  // ✅ Reset Form
  const resetForm = () => {
    setFormData({
      name: '',
      category: categories[1] || '', // default to first available category
      price: 0,
      stock: 0,
      unit: 'kg',
      supplier: 'Your Store',
    });
  };

  // ✅ Product Form Component
  const ProductForm = ({ onSubmit, title }: { onSubmit: (e: React.FormEvent) => void; title: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter product name"
          className="input-field"
          required
        />
      </div>

      {/* ✅ Dynamic Categories */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        {categories.length === 0 ? (
          <p className="text-gray-400 text-sm">Loading categories...</p>
        ) : (
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="input-field"
          >
            {categories
              .filter(cat => cat !== 'all')
              .map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* ✅ Price and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Price per Unit</label>
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
          <label className="block text-sm font-medium mb-2">Unit</label>
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

      {/* ✅ Stock */}
      <div>
        <label className="block text-sm font-medium mb-2">Stock Quantity</label>
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
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button type="submit" className="flex-1 btn-primary">
          {title}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-gray-500">Manage your product catalog</p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="glass-card p-4 hover:shadow-lg transition">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-purple-600">
                  ₹{product.price}/{product.unit}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {product.stock} in stock
                </span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button onClick={() => openEditModal(product)} className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1">
                  <Edit2 size={14} /> <span>Edit</span>
                </button>
                <button onClick={() => handleDeleteProduct(product.id, product.name)} className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm flex items-center justify-center space-x-1">
                  <Trash2 size={14} /> <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products added yet</p>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} title="Add New Product">
        <ProductForm onSubmit={handleAddProduct} title="Add Product" />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingProduct(null); resetForm(); }} title="Edit Product">
        <ProductForm onSubmit={handleEditProduct} title="Update Product" />
      </Modal>
    </div>
  );
};

export default SupplierProducts;
