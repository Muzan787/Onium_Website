import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Truck, Shield, Package, ArrowLeft, CreditCard, MessageCircle, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const shippingThreshold = 2000;
  const freeShipping = getTotalPrice() >= shippingThreshold;
  const remainingForFreeShipping = shippingThreshold - getTotalPrice();

  // Generate the WhatsApp message with item titles
  const whatsappMessage = encodeURIComponent(
    `I want to purchase following items:\n${cartItems.map(item => `• ${item.title}`).join('\n')}`
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl mb-6">
            <ShoppingBag className="w-16 h-16 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-blue-900 mb-3">
            Your Cleaning Cart is Empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some premium cleaning products to make your home sparkle!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all shadow-lg"
            >
              Start Shopping
            </Link>
            <a
              href="https://wa.me/923231550147?text=I%20need%20help%20choosing%20cleaning%20products..."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Ask for Help
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24 md:pb-8">
      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/923231550147?text=I%20want%20to%20order%20these%20items%20from%20my%20cart...`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
      >
        <MessageCircle className="w-6 h-6" fill="white" />
      </a>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-blue-900 mb-2">
              Your Cleaning Cart
            </h1>
            <p className="text-sm md:text-base text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Continue Shopping</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress Bar for Free Shipping */}
            {!freeShipping && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 md:p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs md:text-sm font-semibold text-blue-900 mb-1">
                      <span className="truncate mr-2">Add Rs{remainingForFreeShipping.toFixed(0)} for free delivery!</span>
                      <span className="whitespace-nowrap">Rs{getTotalPrice().toFixed(0)} / {shippingThreshold}</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((getTotalPrice() / shippingThreshold) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {freeShipping && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-green-700 text-sm md:text-base">🎉 Free Delivery Unlocked!</div>
                    <div className="text-xs md:text-sm text-green-600">Your order qualifies for free same-day delivery</div>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden"
                >
                  <div className="flex gap-3 md:gap-5 p-3 md:p-5">
                    {/* Product Image - Optimized for mobile */}
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            to={`/product/${item.id}`}
                            className="font-bold text-sm md:text-lg text-blue-900 hover:text-blue-600 transition-colors line-clamp-2 pr-2"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                        <p className="hidden md:block text-gray-600 text-sm mt-1 line-clamp-1">
                          {item.description}
                        </p>
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1 md:mt-2">
                          {item.category}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-2 md:mt-4">
                        {/* Quantity Controls - Larger touch targets */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-blue-200 rounded-lg overflow-hidden bg-white h-8 md:h-10">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="px-2 md:px-3 h-full hover:bg-blue-50 transition-colors text-blue-600 disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                            <span className="px-2 md:px-4 font-bold text-gray-900 text-sm md:text-lg min-w-[24px] md:min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 md:px-3 h-full hover:bg-blue-50 transition-colors text-blue-600"
                            >
                              <Plus className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Rs{item.price.toFixed(0)}/ea</div>
                          <div className="text-lg md:text-2xl font-bold text-blue-900">
                            Rs{(item.price * item.quantity).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="w-full py-3 border-2 border-red-100 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          </div>

          {/* Order Summary Sidebar (Desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 hidden lg:block">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">Rs{getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Delivery</span>
                    </div>
                    <span className={`font-semibold ${freeShipping ? 'text-green-600' : 'text-gray-900'}`}>
                      {freeShipping ? 'FREE' : 'Rs100.00'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">Quality Assurance</span>
                    </div>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-900">Total Amount</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-900">
                          Rs{(freeShipping ? getTotalPrice() : getTotalPrice() + 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-6 h-6" />
                  Proceed to Checkout
                </button>

                <a
                  href={`https://wa.me/923231550147?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-xl transition-all font-bold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" fill="white" />
                  Checkout on WhatsApp
                </a>
              </div>

              {/* Benefits Card */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-5 hidden lg:block">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Shopping Benefits
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Free same-day delivery
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Eco-friendly packaging
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Total (incl. delivery)</p>
            <p className="text-xl font-bold text-blue-900">
              Rs{(freeShipping ? getTotalPrice() : getTotalPrice() + 100).toFixed(0)}
            </p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Checkout <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}