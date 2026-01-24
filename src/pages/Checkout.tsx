import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, Truck, Shield, CreditCard, Package, Home, User, MapPin, MessageCircle, Lock, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';

export default function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // NEW: Wizard State
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    instructions: '',
  });

  // Delivery charge calculation
  const SHIPPING_THRESHOLD = 2000;
  const SHIPPING_CHARGE = 200;
  const subtotal = getTotalPrice();
  const isFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const shippingCharge = isFreeShipping ? 0 : SHIPPING_CHARGE;
  const total = subtotal + shippingCharge;

  // Validation for steps
  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Contact
        return formData.name && formData.phone && formData.email;
      case 2: // Shipping
        return formData.city && formData.address;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(curr => curr + 1);
      window.scrollTo(0, 0);
    } else {
      alert('Please fill in all required fields to proceed.');
    }
  };

  const handleBack = () => {
    setCurrentStep(curr => curr - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;
    
    setIsProcessing(true);

    try {
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: `${formData.address}, ${formData.city}`,
        special_instructions: formData.instructions,
        subtotal_price: subtotal,
        shipping_charge: shippingCharge,
        total_price: total,
        status: 'pending',
        payment_method: paymentMethod,
      };

      const { data: orderDataResp, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: orderDataResp.id,
        product_id: item.id,
        product_title: item.title,
        product_image: item.image_url,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderId(orderDataResp.id);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-blue-100">
          <div className="text-center">
            <div className="inline-flex p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            
            <h2 className="text-3xl font-bold text-blue-900 mb-3">
              Order Confirmed! 🎉
            </h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Order ID</span>
                <span className="font-mono font-bold text-blue-700 text-lg">
                  #{orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-bold text-2xl text-blue-900">
                  Rs{total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-blue-900">Delivery</h4>
                </div>
                <p className="text-sm text-gray-600">{isFreeShipping ? 'FREE Same-day delivery' : 'Standard delivery with charge'}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-900">Confirmation</h4>
                </div>
                <p className="text-sm text-gray-600">Email & WhatsApp sent to {formData.email}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold shadow-lg"
              >
                Continue Shopping
              </button>
              <a
                href={`https://wa.me/923231550147?text=Order%20ID:%20${orderId}%0AQuery%20about%20my%20order`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Track Order
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-12">
      {/* Mobile Sticky Header with Progress */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/cart')} className="text-gray-500 hover:text-blue-600 p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
          </div>
          <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Step {currentStep} of 3
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: Contact Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Contact Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {/* Added text-base to prevent iOS zoom */}
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-base transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-base transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-base transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Address */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Home className="w-5 h-5 text-green-600" />
                Shipping Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-base transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House #, Street, Area..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-base transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Landmark, delivery time, etc."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-base transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payment & Review */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Payment Method
                </h2>
                <label className="flex items-center gap-4 p-4 border-2 border-blue-600 bg-blue-50/50 rounded-xl cursor-pointer transition-all">
                  <div className="flex-shrink-0">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Pay on Delivery</div>
                    <div className="text-sm text-gray-600">Pay securely when you receive your order</div>
                  </div>
                </label>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item.title}</div>
                        <div className="text-gray-500 text-xs mt-1">{item.quantity} x Rs{item.price}</div>
                      </div>
                      <div className="font-semibold">Rs{(item.price * item.quantity).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rs{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className={`font-medium ${isFreeShipping ? 'text-green-600' : ''}`}>
                      {isFreeShipping ? 'FREE' : `Rs${SHIPPING_CHARGE}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t mt-2">
                    <span>Total</span>
                    <span>Rs{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Sticky Bottom Navigation - Increased z-index and shadow */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
        <div className="container mx-auto max-w-lg flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              disabled={isProcessing}
              className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Back
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Next Step <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" /> Place Order
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}