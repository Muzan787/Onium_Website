import { useEffect, useState } from 'react';
import { supabase, Order, OrderItem } from '../../lib/supabase';
import { CreditCard, Banknote, Truck, AlertCircle } from 'lucide-react';

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            order_items: items || [],
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                      {order.payment_method === 'card' ? (
                        <CreditCard className="w-4 h-4 text-purple-500" />
                      ) : (
                        <Banknote className="w-4 h-4 text-green-500" />
                      )}
                      {order.payment_method === 'cod' ? 'COD' : order.payment_method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    Rs{order.total_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer border-0 ring-1 ring-inset ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900 font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <p className="text-gray-500">No orders found.</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    ID: <span className="font-mono">{selectedOrder.id}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <span className="text-2xl leading-none">&times;</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Customer Details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                      Customer Information
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm border border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.customer_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.customer_phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                      Shipping & Payment
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm border border-gray-100">
                      <div>
                        <span className="text-gray-500 block mb-1">Address:</span>
                        <span className="font-medium text-gray-900 block bg-white p-2 rounded border border-gray-200">
                          {selectedOrder.customer_address}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-500">Payment Method:</span>
                        <span className="font-bold text-gray-900 capitalize px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                          {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.special_instructions && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Special Instructions
                      </h4>
                      <div className="bg-orange-50 text-orange-800 rounded-xl p-4 text-sm border border-orange-100 italic">
                        "{selectedOrder.special_instructions}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items & Totals */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                      Order Items
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-[300px] overflow-y-auto">
                      <div className="space-y-4">
                        {selectedOrder.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                            <div>
                              <p className="font-semibold text-gray-900">{item.product_title}</p>
                              <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-gray-900">
                              Rs{(item.price_at_purchase * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                    <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
                      <div className="flex justify-between text-slate-300 text-sm">
                        <span>Subtotal</span>
                        <span>Rs{selectedOrder.subtotal_price?.toFixed(2) || (selectedOrder.total_price - (selectedOrder.shipping_charge || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span>Delivery Charge</span>
                        </div>
                        <span>Rs{selectedOrder.shipping_charge?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                        <span className="font-bold text-lg">Total Amount</span>
                        <span className="font-bold text-2xl text-green-400">Rs{selectedOrder.total_price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}