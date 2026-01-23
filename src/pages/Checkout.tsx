import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, Truck, Shield, CreditCard, Package, Home, Phone, Mail, User, MapPin, MessageCircle, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

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
  const remainingForFreeShipping = SHIPPING_THRESHOLD - subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

            <div className="mb-8">
              <h4 className="font-bold text-gray-900 mb-3">What's Next?</h4>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                  <div>Order Processing</div>
                </div>
                <div className="h-0.5 w-8 bg-blue-200"></div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                  <div>Quality Check</div>
                </div>
                <div className="h-0.5 w-8 bg-blue-200"></div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                  <div>Out for Delivery</div>
                </div>
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/923231550147?text=Need%20help%20with%20checkout...`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
      >
        <MessageCircle className="w-6 h-6" fill="white" />
      </a>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
              Complete Your Order
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Almost there! Just a few details to get your cleaning products delivered
            </p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Progress Bar */}
            {!isFreeShipping && subtotal > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  {remainingForFreeShipping > 0 ? (
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  ) : (
                    <Truck className="w-6 h-6 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-semibold text-blue-900 mb-1">
                      {remainingForFreeShipping > 0 ? (
                        <>
                          <span>Add Rs{remainingForFreeShipping.toFixed(2)} more for FREE delivery!</span>
                          <span>Rs{subtotal.toFixed(2)} / Rs{SHIPPING_THRESHOLD}</span>
                        </>
                      ) : (
                        <span className="text-green-600">🎉 Congratulations! You've unlocked FREE delivery!</span>
                      )}
                    </div>
                    {remainingForFreeShipping > 0 && (
                      <div className="w-full bg-blue-200 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {remainingForFreeShipping > 0 ? (
                    <>Currently: <span className="font-semibold text-red-600">Rs{SHIPPING_CHARGE} delivery charge applied</span></>
                  ) : (
                    <>Delivery: <span className="font-semibold text-green-600">FREE Same-day delivery</span></>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900">
                  Contact Information
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+92 300 1234567"
                      className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all"
                  />
                </div>
              </form>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900">
                  Shipping Address
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="Enter your city"
                      className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Complete Address
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="House #, Street, Area, Landmarks..."
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    placeholder="Delivery time preferences, gate code, etc."
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border-2 border-blue-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive your order</div>
                  </div>
                  <div className="text-lg font-bold text-blue-700">Rs{total.toFixed(2)}</div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 border-blue-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600">Secure online payment</div>
                  </div>
                  <Shield className="w-6 h-6 text-green-500" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary Card */}
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-blue-50/50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                          <div className="font-bold text-blue-700">Rs{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-blue-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">Rs{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Delivery</span>
                    </div>
                    <span className={`font-semibold ${isFreeShipping ? 'text-green-600' : 'text-red-600'}`}>
                      {isFreeShipping ? 'FREE' : `Rs${SHIPPING_CHARGE}.00`}
                    </span>
                  </div>

                  {/* Delivery Note */}
                  {!isFreeShipping && (
                    <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded-lg">
                      Add Rs{remainingForFreeShipping.toFixed(2)} more to get FREE delivery!
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-900">Total Amount</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-900">
                          Rs{total.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {paymentMethod === 'cod' ? 'Pay on delivery' : 'Pay online'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <Lock className="w-6 h-6" />
                      Place Secure Order
                    </>
                  )}
                </button>

                {/* Security Message */}
                <div className="text-center mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Your information is protected with 256-bit SSL encryption
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-5 mt-6">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Information
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold">FREE delivery</span> on orders above Rs{SHIPPING_THRESHOLD}
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold">Rs{SHIPPING_CHARGE} delivery charge</span> for orders below Rs{SHIPPING_THRESHOLD}
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Same-day delivery for orders before 2 PM
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Professional handling of cleaning products
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}