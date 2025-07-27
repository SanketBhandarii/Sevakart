import React, { useState } from "react";
import { useApp, Product } from "../../contexts/AppContext";
import { Search, ShoppingCart, Plus, Minus, X } from "lucide-react";
import toast from "react-hot-toast";

const VendorShop: React.FC = () => {
  const {
    filteredProducts,
    searchProducts,
    filterByCategory,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    clearCart,
    addOrder,
    categories,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ✅ Search Handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchProducts(query);
    setSelectedCategory("all");
  };

  // ✅ Category Filter
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterByCategory(category);
    setSearchQuery("");
  };

  // ✅ Add to Cart
  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  // ✅ Checkout → Places order using new format (no supplier field at root)
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const newOrder = {
      items: cart.map((item) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
        supplierId: (item as any).supplierId || "",
      })),
      total: cartTotal,
      status: "ordered" as const,
    };

    try {
      await addOrder(newOrder);
      await clearCart(); // ✅ Clears Firestore cart
      setIsCartOpen(false);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Order placement failed:", error);
      toast.error("Failed to place order");
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Shop Supplies</h1>
          <p className="text-text-gray">Browse and order from our suppliers</p>
        </div>

        {/* Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative btn-primary flex items-center space-x-2"
        >
          <ShoppingCart size={20} />
          <span>Cart</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Categories Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-text-dark mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-text-gray text-sm">Loading categories...</p>
              ) : (
                categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                      selectedCategory === category
                        ? "bg-primary-purple text-white"
                        : "text-text-gray hover:bg-gray-100"
                    }`}
                  >
                    {category === "all" ? "All Products" : category}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="glass-card p-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-text-gray" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products, suppliers..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple/20 focus:border-primary-purple outline-none"
              />
            </div>
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="glass-card p-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-text-dark">{product.name}</h3>
                  <p className="text-sm text-text-gray">{product.supplier}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-purple">
                      ₹{product.price}/{product.unit}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.stock > 0
                          ? product.stock > 10
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      {product.stock > 0 ? "Available" : "Out of Stock"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-gray">
                No products found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-text-dark">Shopping Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <p className="text-text-gray text-center">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-text-dark">{item.name}</h3>
                          <p className="text-sm text-text-gray">
                            ₹{item.price}/{item.unit}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-danger hover:text-danger/80"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkout Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-text-dark">Total:</span>
                    <span className="text-lg font-bold text-primary-purple">₹{cartTotal}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full btn-primary">
                    Place Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorShop;
