import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import Modal from '../../components/Common/Modal';
import toast from 'react-hot-toast';
import { Product } from '../../contexts/AppContext';
import { auth } from '@/utils/firebase';

const SupplierProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useApp(); 
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

  const currentSupplierUid = auth.currentUser?.uid || "";

  // ✅ Filter products to only show those belonging to the logged-in supplier
  const supplierProducts = products.filter((p) => p.supplier === currentSupplierUid);

  React.useEffect(() => {
    if (categories.length > 1 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[1] })); // skip "all"
    }
  }, [categories]);

  // ✅ Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    formData.supplier = currentSupplierUid;

    if (!formData.name.trim() || formData.price <= 0 || formData.stock < 0) {
      toast.error('Please fill all required fields correctly');
      return;
    }
    if (products.some(product => product.name.toLowerCase() === formData.name.toLowerCase())) {
      toast.error('Product with this name already exists');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.unit) {
      toast.error('Please select a unit');
      return;
    }
    if (!formData.supplier) {
      toast.error('Missing supplier UID');
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

  const resetForm = () => {
    setFormData({
      name: '',
      category: categories[1] || '',
      price: 0,
      stock: 0,
      unit: 'kg',
      supplier: 'Your Store',
    });
  };

  const ProductForm = ({ onSubmit, title }: { onSubmit: (e: React.FormEvent) => void; title: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Form Fields */}
      {/* (Same as your existing code) */}
      {/* ... */}
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

      {/* ✅ Product Grid (Filtered) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {supplierProducts.map((product) => (
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

      {/* ✅ Empty State if No Supplier Products */}
      {supplierProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">You have not added any products yet.</p>
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
