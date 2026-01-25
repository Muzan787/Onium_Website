import { useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, XCircle, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrderStatus(null);

    // Remove '#' if user typed it, and trim whitespace
    const cleanId = orderId.replace(/^#/, '').trim();

    try {
      // FIX: Use the 'rpc' method to call our database function
      // This is necessary because we are matching a partial UUID (Text) against a UUID column
      const { data, error } = await supabase
        .rpc('get_order_by_tracking', { code: cleanId })
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setError('Order not found. Please check your Tracking Code.');
        return;
      }

      setOrderStatus(data);
    } catch (err) {
      console.error(err);
      setError('Order not found or invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'shipped': return <Truck className="w-12 h-12 text-primary-500" />;
      case 'cancelled': return <XCircle className="w-12 h-12 text-red-500" />;
      default: return <Clock className="w-12 h-12 text-accent-500" />;
    }
  };

  return (
    <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-4">
      <SEO title="Track Order" description="Track the status of your Onium order." />
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Track Your Order</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your Tracking Code (e.g. #12AB34CD)</p>
        </div>

        <form onSubmit={handleTrack} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. #12EEB7BE"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono text-sm uppercase"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <button
            disabled={loading}
            className="w-full mt-4 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        {orderStatus && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 animate-fade-in text-center">
            <div className="flex flex-col items-center mb-6">
              {getStatusIcon(orderStatus.status)}
              <h3 className="text-xl font-bold text-slate-900 mt-3 capitalize">
                {orderStatus.status}
              </h3>
              <p className="text-sm text-slate-500">
                Placed on {new Date(orderStatus.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-slate-200 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tracking Code</span>
                <span className="font-mono text-slate-900 font-bold">
                  #{orderStatus.id.slice(0,8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-bold text-slate-900">
                  Rs{orderStatus.total_price}
                </span>
              </div>
            </div>

            {/* WhatsApp Support Button */}
            <a 
              href={`https://wa.me/923231550147?text=Hello%2C%20I%20have%20a%20query%20about%20my%20order%20%23${orderStatus.id.slice(0,8).toUpperCase()}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </a>
          </div>
        )}
      </div>
    </div>
  );
}