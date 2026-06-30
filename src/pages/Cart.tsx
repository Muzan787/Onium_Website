import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Truck, Shield, Package, ArrowLeft, CreditCard, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const shippingThreshold = 3000;
  const freeShipping = getTotalPrice() >= shippingThreshold;
  const remainingForFreeShipping = shippingThreshold - getTotalPrice();
  const whatsappMessage = encodeURIComponent(`I want to purchase following items:\n${cartItems.map(item => `• ${item.title}`).join('\n')}`);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex p-4 bg-primary-100 rounded-full mb-6">
            <ShoppingBag className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 mb-8">Add some premium cleaning products to make your home sparkle!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/20">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <a href={`https://wa.me/923231550147?text=I%20want%20to%20order...`} target="_blank" rel="noopener noreferrer" className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-primary-600 to-primary-500 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all"><MessageCircle className="w-6 h-6" fill="white" /></a>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Your Cart</h1>
            <p className="text-slate-500 text-sm font-medium">{cartItems.length} items</p>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold text-sm"><ArrowLeft className="w-4 h-4" /> Continue Shopping</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {!freeShipping && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-6 h-6 text-primary-600" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-bold text-slate-900 mb-1">
                      <span>Add Rs{remainingForFreeShipping.toFixed(0)} for free delivery!</span>
                      <span>{Math.round((getTotalPrice()/shippingThreshold)*100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-primary-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((getTotalPrice() / shippingThreshold) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {freeShipping && (
              <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 shadow-sm flex items-center gap-3">
                <Truck className="w-6 h-6 text-primary-600" />
                <div>
                  <div className="font-bold text-primary-700">🎉 Free Delivery Unlocked!</div>
                  <div className="text-sm text-primary-600">Your order qualifies for free shipping.</div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="group bg-white rounded-2xl p-3 border border-slate-200 hover:border-primary-200 transition-colors">
                  <div className="flex gap-4">
                    <Link to={`/product/${item.id}`} className="flex-shrink-0 w-24 h-24 bg-slate-50 rounded-xl overflow-hidden p-2">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link to={`/product/${item.id}`} className="font-bold text-slate-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm md:text-base">{item.title}</Link>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <p className="text-xs text-primary-600 font-medium bg-primary-50 inline-block px-2 py-0.5 rounded mt-1">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg h-8">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-2 hover:bg-slate-50 text-slate-600"><Minus className="w-3 h-3" /></button>
                          <span className="px-2 text-sm font-bold text-slate-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 hover:bg-slate-50 text-slate-600"><Plus className="w-3 h-3" /></button>
                        </div>
                        <div className="font-bold text-slate-900">Rs{(item.price * item.quantity).toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={clearCart} className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors text-sm">Clear Cart</button>
          </div>

          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6 border-b border-slate-100 pb-6">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-bold text-slate-900">Rs{getTotalPrice().toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Delivery</span><span className={freeShipping ? 'text-primary-600 font-bold' : 'text-slate-900 font-bold'}>{freeShipping ? 'FREE' : 'Rs200'}</span></div>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 mb-6"><span>Total</span><span>Rs{(freeShipping ? getTotalPrice() : getTotalPrice() + 200).toFixed(2)}</span></div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/10 flex items-center justify-center gap-2"><CreditCard className="w-5 h-5"/> Proceed to Checkout</button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium">Total (incl. delivery)</p>
            <p className="text-xl font-extrabold text-slate-900">Rs{(freeShipping ? getTotalPrice() : getTotalPrice() + 100).toFixed(0)}</p>
          </div>
          <button onClick={() => navigate('/checkout')} className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-primary-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
            Checkout <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}