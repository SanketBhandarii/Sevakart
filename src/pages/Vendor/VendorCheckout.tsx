import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Minus, Plus, X, MapPin, Clock, CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const VendorCheckout: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, clearCart, addOrder } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [deliveryTime, setDeliveryTime] = useState('morning');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderItems = cart.map(item => ({
        name: item.name,
        qty: item.quantity,
        price: item.price
      }));

      addOrder({
        vendor: user?.name || 'Unknown Vendor',
        items: orderItems,
        total: cartTotal,
        status: 'ordered',
        supplier: 'Multiple Suppliers'
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/vendor/orders');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Checkout</h1>
          <p className="text-text-gray">Complete your order</p>
        </div>
        
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-lg font-semibold text-text-dark mb-2">Your cart is empty</h3>
          <p className="text-text-gray mb-6">Add some items to your cart to proceed with checkout</p>
          <button
            onClick={() => navigate('/vendor/shop')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Checkout</h1>
        <p className="text-text-gray">Review your order and complete payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Order Summary</h3>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-text-dark">{item.name}</h4>
                    <p className="text-sm text-text-gray">₹{item.price}/{item.unit}</p>
                    <p className="text-sm text-text-gray">Supplier: {item.supplier}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-text-dark">₹{item.price * item.quantity}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-danger hover:text-danger/80 mt-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Delivery Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Delivery Address
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-text-dark">{user?.name}</p>
                  <p className="text-text-gray">{user?.location}</p>
                  <p className="text-text-gray">Phone: +91 {user?.phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Delivery Time Preference
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryTime"
                      value="morning"
                      checked={deliveryTime === 'morning'}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="h-4 w-4 text-primary-purple focus:ring-primary-purple/20 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-text-dark">Morning (9 AM - 12 PM)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryTime"
                      value="evening"
                      checked={deliveryTime === 'evening'}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="h-4 w-4 text-primary-purple focus:ring-primary-purple/20 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-text-dark">Evening (2 PM - 6 PM)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special delivery instructions..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Payment Method</h3>
            
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary-purple focus:ring-primary-purple/20 border-gray-300"
                />
                <CreditCard className="h-5 w-5 ml-3 mr-2 text-text-gray" />
                <div>
                  <p className="font-medium text-text-dark">Cash on Delivery</p>
                  <p className="text-sm text-text-gray">Pay when your order arrives</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary-purple focus:ring-primary-purple/20 border-gray-300"
                />
                <Smartphone className="h-5 w-5 ml-3 mr-2 text-text-gray" />
                <div>
                  <p className="font-medium text-text-dark">UPI Payment</p>
                  <p className="text-sm text-text-gray">Pay instantly via UPI</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Order Total</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-text-gray">Subtotal ({cart.length} items)</span>
                <span className="font-medium text-text-dark">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-gray">Delivery Fee</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-text-dark">Total</span>
                  <span className="text-xl font-bold text-primary-purple">₹{cartTotal}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Place Order</span>
              )}
            </button>

            <p className="text-xs text-text-gray text-center mt-3">
              By placing this order, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCheckout;