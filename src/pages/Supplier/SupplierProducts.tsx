import React, { useState, useEffect } from "react";
import { useApp, Product } from "../../contexts/AppContext";
import { Plus, Edit2, Trash2, Package, ListPlusIcon } from "lucide-react";
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";
import { auth } from "@/utils/firebase";

// ✅ Simple food image function using Unsplash
const getFoodImage = (productName: string, category: string) => {
  const seed = productName.toLowerCase().replace(/\s+/g, '-');
  const categoryKeywords: { [key: string]: string } = {
    'dairy': 'milk-dairy',
    'vegetables': 'fresh-vegetables',
    'fruits': 'fresh-fruits',
    'grains': 'grains-cereals',
    'spices': 'spices-herbs',
    'meat': 'meat-chicken',
    'beverages': 'drinks-juice',
    'snacks': 'snacks-food',
    'bakery': 'bread-bakery'
  };
  const keyword = categoryKeywords[category.toLowerCase()] || 'food';
  return `https://source.unsplash.com/400x300/?${keyword}&sig=${seed}`;
};

// ✅ Product Form with Dynamic Category Option
const ProductForm = ({ 
  onSubmit, title, formData, setFormData, categories,
  setIsAddModalOpen, setIsEditModalOpen, setEditingProduct, resetForm,
  addCategory // ✅ Pass addCategory to ProductForm
}: any) => {
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Enter a valid category name");
      return;
    }
    try {
      await addCategory(newCategory);
      toast.success("Category added!");
      setFormData((p: any) => ({ ...p, category: newCategory }));
      setNewCategory("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))}
          className="input-field"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData((p: any) => ({ ...p, category: e.target.value }))}
          className="input-field"
        >
          {categories.filter((c: string) => c !== "all").map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="__add_new__"> Others</option>
        </select>

        {/* If user selects Add New Category, show input */}
        {formData.category === "__add_new__" && (
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category"
              className="input-field flex-1"
            />
            <button type="button" onClick={handleAddCategory} className="btn-primary px-3">
              Add
            </button>
          </div>
        )}
      </div>

      {/* Price & Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData((p: any) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Unit</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData((p: any) => ({ ...p, unit: e.target.value }))}
            className="input-field"
          >
            <option value="kg">kg</option>
            <option value="L">L</option>
            <option value="piece">piece</option>
            <option value="packet">packet</option>
          </select>
        </div>
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium mb-2">Stock Quantity</label>
        <input
          type="number"
          min="0"
          value={formData.stock}
          onChange={(e) => setFormData((p: any) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
          className="input-field"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setEditingProduct(null);
            resetForm();
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button type="submit" className="flex-1 btn-primary">{title}</button>
      </div>
    </form>
  );
};

const SupplierProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory } = useApp(); // ✅ include addCategory

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    unit: "kg",
    supplier: "",
  });

  const supplierUid = auth.currentUser?.uid || "";
  const supplierProducts = products.filter((p) => p.supplier === supplierUid);

  useEffect(() => {
    if (categories.length > 1 && !formData.category) {
      setFormData((prev) => ({ ...prev, category: categories[1] }));
    }
  }, [categories]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, supplier: supplierUid };
    if (!payload.name.trim() || payload.price <= 0 || payload.stock < 0) {
      toast.error("Please fill all required fields correctly");
      return;
    }
    if (supplierProducts.some((p) => p.name.toLowerCase() === payload.name.toLowerCase())) {
      toast.error("Product with this name already exists");
      return;
    }
    try {
      await addProduct(payload);
      toast.success("Product added successfully!");
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product.");
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.id, formData);
      toast.success("Product updated successfully!");
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product.");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Delete product "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success("Product deleted successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete product.");
      }
    }
  };

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
      name: "",
      category: categories[1] || "",
      price: 0,
      stock: 0,
      unit: "kg",
      supplier: supplierUid,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Product Management</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus size={20} /> <span>Add Product</span>
        </button>
      </div>

      {/* Product Grid - Fixed responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* ➕ Add Product Card - Fixed height */}
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="glass-card p-4 sm:p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition border-2 border-dashed border-purple-400 text-purple-600 h-[280px] sm:h-[320px]"
        >
          <Plus size={32} className="sm:size-10 mb-2" />
          <p className="font-semibold text-sm sm:text-base text-center">Add New Product</p>
        </div>

        {/* Supplier Products - Fixed height and added images */}
        {supplierProducts.map((product) => (
          <div key={product.id} className="glass-card p-4 sm:p-6 hover:shadow-lg transition h-[280px] sm:h-[320px] flex flex-col">
            {/* Product Image - Real food images */}
            <div className="h-32 sm:h-36 bg-gray-200 rounded-lg mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
              <img
                src={getFoodImage(product.name, product.category)}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  // Fallback to emoji if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              {/* Fallback emoji - hidden by default */}
              <span className="hidden text-2xl sm:text-4xl">📦</span>
            </div>
            
            {/* Product Info - Flex grow to fill remaining space */}
            <div className="space-y-2 flex-1 flex flex-col">
              <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{product.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{product.category}</p>
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-bold text-purple-600">
                  ₹{product.price}/{product.unit}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    product.stock > 10 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {product.stock} in stock
                </span>
              </div>
              
              {/* Buttons at bottom */}
              <div className="flex space-x-2 pt-2 mt-auto">
                <button onClick={() => openEditModal(product)} className="flex-1 btn-secondary text-xs sm:text-sm flex items-center justify-center space-x-1">
                  <Edit2 size={14} /> <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDeleteProduct(product.id, product.name)} 
                  className="flex-1 bg-red-600 text-white rounded-lg px-3 py-2 hover:bg-red-700 text-xs sm:text-sm flex items-center justify-center space-x-1"
                >
                  <Trash2 size={14} /> <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {supplierProducts.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">No products added yet</p>
        </div>
      )}

      {/* Modals */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); resetForm(); }} 
        title="Add Product"
      >
        <ProductForm 
          onSubmit={handleAddProduct} 
          title="Add Product"
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          setIsAddModalOpen={setIsAddModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          setEditingProduct={setEditingProduct}
          resetForm={resetForm}
          addCategory={addCategory} // ✅ pass addCategory
        />
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEditingProduct(null); resetForm(); }} 
        title="Edit Product"
      >
        <ProductForm 
          onSubmit={handleEditProduct} 
          title="Update Product"
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          setIsAddModalOpen={setIsAddModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          setEditingProduct={setEditingProduct}
          resetForm={resetForm}
          addCategory={addCategory} // ✅ pass addCategory
        />
      </Modal>
    </div>
  );
};

export default SupplierProducts;