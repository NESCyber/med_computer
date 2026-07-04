import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CornerUpLeft, ClipboardList } from 'lucide-react';

interface OrderSummary {
  id: number;
  status: string;
  total_price: number;
  shipping_address: string;
  billing_address: string;
  created_at: string;
}

const OrderHistory: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=orders');
      return;
    }

    fetch(`${API_BASE_URL}/api/orders/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load purchase history.');
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="font-semibold text-sm">Loading purchase history...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 leading-tight">Your Orders</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor shipping states and check purchase history.</p>
      </div>

      {error ? (
        <div className="max-w-md mx-auto my-10 p-6 bg-red-55/10 border border-red-200 text-red-500 text-center rounded-2xl">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-md flex flex-col items-center">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <ClipboardList className="h-12 w-12 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Orders Found</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">You have not placed any orders yet on this storefront account.</p>
          <Link to="/" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl text-sm hover:bg-primary-hover shadow-md transition-all-300 flex items-center justify-center gap-2">
            <CornerUpLeft className="h-4 w-4" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-100 font-bold text-slate-700 bg-slate-50">
                <th className="p-4">Order ID</th>
                <th className="p-4">Date Placed</th>
                <th className="p-4">Shipping Destination</th>
                <th className="p-4">Status</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4 text-right">Fulfillment Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-all-300">
                  <td className="p-4 font-extrabold text-slate-800">#{order.id}</td>
                  <td className="p-4 text-slate-500 font-medium">{order.created_at}</td>
                  <td className="p-4 text-slate-500 font-medium max-w-[200px] truncate" title={order.shipping_address}>
                    {order.shipping_address}
                  </td>
                  <td className="p-4">
                    {order.status === 'pending' && (
                      <span className="text-amber-600 bg-amber-50 border border-amber-100 font-extrabold px-2.5 py-1 rounded-full text-xs">Pending</span>
                    )}
                    {order.status === 'paid' && (
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 font-extrabold px-2.5 py-1 rounded-full text-xs">Paid</span>
                    )}
                    {order.status === 'shipped' && (
                      <span className="text-blue-600 bg-blue-50 border border-blue-100 font-extrabold px-2.5 py-1 rounded-full text-xs">Shipped</span>
                    )}
                    {order.status === 'delivered' && (
                      <span className="text-slate-500 bg-slate-50 border border-slate-200 font-extrabold px-2.5 py-1 rounded-full text-xs">Delivered</span>
                    )}
                  </td>
                  <td className="p-4 font-black text-slate-800">GH₵{order.total_price.toLocaleString()}</td>
                  <td className="p-4 text-right font-extrabold">
                    <Link to={`/orders/${order.id}`} className="text-primary hover:text-primary-hover hover:underline transition-all-300">
                      Track Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
