import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { 
  CheckCircle, CreditCard, Package, Home, User, 
  Ticket, X, Lock, ArrowLeft, ChevronRight, LogIn 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // State to save the total before clearing the cart
  const [savedOrderTotal, setSavedOrderTotal] = useState(0);
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '', instructions: '' });

  // --- NEW: AUTH STATE ---
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // --- COUPON LOGIC ---
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  const SHIPPING_THRESHOLD = 2000;
  const SHIPPING_CHARGE = 200;
  const subtotal = getTotalPrice();

  // 1. Check for Logged In User on Mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          // Auto-fill email and lock it
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            name: user.user_metadata?.full_name || prev.name
          }));
        }
      } catch (error) {
        console.error('Auth check failed', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkUser();
  }, []);

  // 2. Updated Coupon Handler with Login Check
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    // STRICT RULE: User must be logged in
    if (!user) {
      toast.error('You must log in to use coupons!');
      // Optional: navigate('/login') here if you have a login page
      return;
    }
    
    // Basic Validation
    if (couponCode.toUpperCase() !== 'WELCOME10') {
      toast.error('Invalid coupon code');
      setDiscount(0);
      setIsCouponApplied(false);
      return;
    }

    setIsCheckingCoupon(true);

    try {
      // 3. Database Check (Secure)
      const { data: previousOrders, error } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_email', user.email) // Check against authenticated email
        .ilike('special_instructions', `%${couponCode}%`)
        .limit(1);

      if (error) throw error;

      if (previousOrders && previousOrders.length > 0) {
        toast.error('You have already used this coupon!');
        setDiscount(0);
        setIsCouponApplied(false);
      } else {
        const discountAmount = subtotal * 0.10; // 10% Discount
        setDiscount(discountAmount);
        setIsCouponApplied(true);
        toast.success('Welcome discount applied!');
      }
    } catch (err) {
      console.error('Error checking coupon:', err);
      toast.error('Could not verify coupon.');
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setIsCouponApplied(false);
    toast.success('Coupon removed');
  };

  const isFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const shippingCharge = isFreeShipping ? 0 : SHIPPING_CHARGE;
  const total = subtotal - discount + shippingCharge;

  const validateStep = (step: number) => {
    switch (step) {
      case 1: return formData.name && formData.phone && formData.email;
      case 2: return formData.city && formData.address;
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(curr => curr + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error('Please fill in all required fields.');
    }
  };
// ... imports

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;
    setIsProcessing(true);

    try {
      // 1. Generate the Order ID here (Client Side) instead of asking the DB
      // This bypasses the need for "SELECT" permission
      const newOrderId = crypto.randomUUID(); 

      const orderData = {
        id: newOrderId, // <--- Manual ID
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: `${formData.address}, ${formData.city}`,
        special_instructions: formData.instructions + (isCouponApplied ? ` [Coupon Applied: ${couponCode.toUpperCase()}]` : ''),
        subtotal_price: subtotal,
        shipping_charge: shippingCharge,
        total_price: total,
        status: 'pending',
        payment_method: paymentMethod,
        // user_id: user?.id // Uncomment if you add user_id to your table later
      };

      // 2. Remove .select() to prevent the 401 Error
      const { error: orderError } = await supabase.from('orders').insert(orderData);
      
      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: newOrderId, // <--- Use the ID we generated above
        product_id: item.id,
        product_title: item.title,
        // product_image: item.image_url, <--- REMOVED: This column does not exist in your SQL schema
        quantity: item.quantity,
        price_at_purchase: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Success!
      setSavedOrderTotal(total);
      setOrderId(newOrderId);
      setOrderComplete(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order: ' + (error.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0 && !orderComplete) { navigate('/cart'); return null; }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full border border-slate-100 text-center">
          <div className="inline-flex p-4 bg-primary-100 rounded-full mb-6 text-primary-600 animate-bounce"><CheckCircle className="w-16 h-16" /></div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
          <p className="text-slate-500 mb-6">Thank you for your purchase.</p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
            <div className="flex justify-between mb-2 text-sm text-slate-500"><span>Order ID</span><span className="font-mono text-slate-900 font-bold">#{orderId.slice(0, 8).toUpperCase()}</span></div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Total</span>
              <span className="font-bold text-slate-900 text-lg">Rs{savedOrderTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg">Continue Shopping</button>
            <button onClick={() => navigate('/track-order')} className="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors">
              <Package className="w-5 h-5" /> Track Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-slate-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/cart')} className="text-slate-400 hover:text-slate-900"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-lg font-bold text-slate-900">Checkout</h1>
          </div>
          <div className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100">Step {currentStep} / 3</div>
        </div>
        <div className="w-full h-1 bg-slate-100"><div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${(currentStep / 3) * 100}%` }} /></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: CONTACT INFO */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><User className="w-5 h-5 text-primary-500" /> Contact Info</h2>
                {/* Login Prompt if guest */}
                {!user && !isLoadingAuth && (
                  <Link to="/login" className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors flex items-center gap-1">
                    <LogIn className="w-3 h-3" /> Log In
                  </Link>
                )}
              </div>
              
              <div className="space-y-4">
                {['name', 'phone', 'email'].map(field => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{field}</label>
                    <div className="relative">
                      <input 
                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} 
                        required 
                        value={formData[field as keyof typeof formData]} 
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} 
                        // LOCK EMAIL IF LOGGED IN
                        readOnly={field === 'email' && !!user}
                        className={`w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-base transition-all ${
                          field === 'email' && user 
                            ? 'bg-slate-100 text-slate-500 cursor-not-allowed focus:border-slate-200' 
                            : 'bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500'
                        }`} 
                        placeholder={`Enter your ${field}`} 
                      />
                      {/* Show lock icon if email is locked */}
                      {field === 'email' && user && (
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Home className="w-5 h-5 text-secondary-500" /> Shipping Details</h2>
              <div className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">City</label><input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none text-base bg-slate-50 focus:bg-white" placeholder="Islamabad" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address</label><textarea required rows={3} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none text-base bg-slate-50 focus:bg-white resize-none" placeholder="House #, Street..." /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Special Instructions (Optional)</label><textarea rows={2} value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none text-base bg-slate-50 focus:bg-white resize-none" placeholder="Landmark, delivery time, etc." /></div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT & COUPONS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Payment Method */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-accent-500" /> Payment</h2>
                <label className="flex items-center gap-4 p-4 border-2 border-primary-500 bg-primary-50/30 rounded-xl cursor-pointer"><div className="flex-shrink-0"><input type="radio" checked readOnly className="w-5 h-5 text-primary-600 focus:ring-primary-500" /></div><div><div className="font-bold text-slate-900">Cash on Delivery</div><div className="text-sm text-slate-500">Pay securely upon delivery</div></div></label>
              </div>

              {/* Coupon Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                 <div className="flex justify-between items-center mb-4">
                   <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Ticket className="w-5 h-5 text-primary-500" /> Discount Code</h2>
                   {!user && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">LOGIN REQUIRED</span>}
                 </div>
                 
                 <div className="flex gap-2">
                   <div className="relative flex-1">
                     <input 
                       type="text" 
                       value={couponCode}
                       onChange={(e) => setCouponCode(e.target.value)}
                       disabled={isCouponApplied || isCheckingCoupon || !user} // DISABLED IF NO USER
                       placeholder={user ? "Enter code (e.g. WELCOME10)" : "Log in to use coupons"}
                       className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                         !user 
                          ? 'bg-slate-100 border-slate-200 cursor-not-allowed placeholder:text-slate-400'
                          : isCouponApplied 
                            ? 'bg-green-50 border-green-200 text-green-700 font-bold' 
                            : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-primary-500'
                       }`}
                     />
                     {isCouponApplied && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
                     {!user && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                   </div>
                   
                   {isCouponApplied ? (
                     <button type="button" onClick={removeCoupon} className="bg-red-50 text-red-500 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors border border-red-100">
                       <X className="w-5 h-5" />
                     </button>
                   ) : (
                     <button 
                        type="button" 
                        onClick={handleApplyCoupon} 
                        disabled={isCheckingCoupon || !user} // DISABLED IF NO USER
                        className={`px-6 py-3 rounded-xl font-bold transition-colors ${
                          !user 
                           ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                           : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                     >
                       {isCheckingCoupon ? '...' : 'Apply'}
                     </button>
                   )}
                 </div>
                 {!user && (
                    <p className="text-xs text-slate-500 mt-2">
                      <Link to="/login" className="text-primary-600 font-bold hover:underline">Click here to login</Link> to unlock discounts.
                    </p>
                 )}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Summary</h2>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">{cartItems.map((item) => (<div key={item.id} className="flex gap-3 text-sm border-b border-slate-50 pb-2 last:border-0"><div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0"><img src={item.image_url} alt="" className="w-full h-full object-contain mix-blend-multiply" /></div><div className="flex-1"><div className="font-bold text-slate-900 truncate">{item.title}</div><div className="text-slate-500 text-xs">{item.quantity} x Rs{item.price}</div></div><div className="font-bold text-slate-900">Rs{(item.price * item.quantity).toFixed(0)}</div></div>))}</div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>Rs{subtotal.toFixed(2)}</span></div>
                  
                  {isCouponApplied && (
                     <div className="flex justify-between text-sm text-green-600 font-bold">
                       <span>Discount (10%)</span>
                       <span>-Rs{discount.toFixed(2)}</span>
                     </div>
                  )}

                  <div className="flex justify-between text-sm text-slate-600"><span>Delivery</span><span className={isFreeShipping ? 'text-primary-600 font-bold' : ''}>{isFreeShipping ? 'FREE' : `Rs${SHIPPING_CHARGE}`}</span></div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-50 mt-2"><span>Total</span><span>Rs{total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="container mx-auto max-w-lg flex gap-3">
          {currentStep > 1 && <button onClick={() => setCurrentStep(c => c - 1)} disabled={isProcessing} className="px-6 py-3.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Back</button>}
          <button onClick={currentStep < 3 ? handleNext : handleSubmit} disabled={isProcessing} className="flex-1 bg-primary-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-primary-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
            {isProcessing ? 'Processing...' : currentStep < 3 ? <>Next Step <ChevronRight className="w-5 h-5" /></> : <>Place Order <Lock className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}