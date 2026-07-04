import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Loader2, CornerUpLeft, ArrowRight } from 'lucide-react';

const Checkout: React.FC = () => {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const { user, token, isAuthenticated, updateUserAddress } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [billingAddress, setBillingAddress] = useState(user?.address || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.address) {
      setShippingAddress(user.address);
      setBillingAddress(user.address);
    }
  }, [user]);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Checkout Unavailable</h2>
        <p className="text-slate-500 text-sm mb-6">Your cart is empty. Please add hardware configurations before checking out.</p>
        <Link to="/" className="inline-flex bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-hover shadow-md transition-all-300 gap-1.5 items-center">
          <CornerUpLeft className="h-4 w-4" />
          <span>Browse Catalog</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!shippingAddress.trim() || !billingAddress.trim()) {
      setError('Please provide both shipping and billing addresses.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Format items for the API
    const items = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));

    fetch('http://localhost:8000/api/orders/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        items,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.error || 'Failed to place order.');
          });
        }
        return res.json();
      })
      .then((data) => {
        setSubmitting(false);
        // Save address in profile defaults locally
        updateUserAddress(shippingAddress);
        clearCart();
        navigate(`/orders/${data.order_id}`);
      })
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-6 transition-all-300">
        <CornerUpLeft className="h-4 w-4" />
        <span>Return to Cart</span>
      </Link>

      <h1 className="text-3xl font-black text-slate-800 leading-tight mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Shipping form */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-6">Shipping Details</h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-semibold p-3.5 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase">Shipping Destination Address</label>
              <textarea
                rows={3}
                placeholder="Enter complete shipping coordinates (Street, City, region)..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-medium leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase">Billing Invoice Address</label>
              <textarea
                rows={3}
                placeholder="Enter billing details (leave same as shipping if identical)..."
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-medium leading-relaxed"
              />
            </div>

            {/* Manual Payment Alert */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-slate-600 text-xs leading-relaxed flex flex-col gap-1">
              <strong className="text-slate-800 font-bold flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Manual Payment Notice:</span>
              </strong>
              <span>
                After placing this configuration order, you will receive instruction coordinates to finalize mobile money or bank transfers. Submit references to begin assembly dispatch.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl text-center shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all-300 text-base flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              <span>Place Order &amp; Pay Manually</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Order breakdown summary */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-100 pb-3">Items Summary</h3>

          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div className="max-w-[70%]">
                  <strong className="text-slate-800 font-bold block truncate">{item.name}</strong>
                  <span className="text-slate-400 font-medium">Qty: {item.quantity} &times; GH₵{item.price.toLocaleString()}</span>
                </div>
                <span className="font-extrabold text-slate-900">GH₵{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Total Configured Units</span>
            <span className="text-slate-800 font-extrabold">{totalItems} units</span>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <span className="text-base font-extrabold text-slate-800">Grand Total</span>
            <span className="text-xl font-black text-primary">GH₵{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
