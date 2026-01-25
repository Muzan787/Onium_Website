import { useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, created_at, total_price')
        .eq('id', orderId.trim())
        .single();

      if (error) throw error;
      setOrderStatus(data);
    } catch (err) {
      setError('Order not found. Please check your Order ID.');
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
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Track Your Order</h1>
          <p className="text-slate-500 mt-2">Enter your Order ID to see current status</p>
        </div>

        <form onSubmit={handleTrack} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 550e8400-e29b..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono text-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <button 
            disabled={loading}
            className="w-full mt-4 bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-medium">
            {error}
          </div>
        )}

        {orderStatus && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 animate-fade-in">
            <div className="flex flex-col items-center text-center mb-6">
              {getStatusIcon(orderStatus.status)}
              <h3 className="text-xl font-bold text-slate-900 mt-3 capitalize">{orderStatus.status}</h3>
              <p className="text-sm text-slate-500">Order placed on {new Date(orderStatus.created_at).toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Order ID</span>
                <span className="font-mono text-slate-900">{orderStatus.id.slice(0,8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-bold text-slate-900">Rs{orderStatus.total_price}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}