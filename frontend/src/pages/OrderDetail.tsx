import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Loader2, CornerUpLeft, Phone, Calendar, MapPin, CheckCircle, FileText, Star } from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  price: number;
  quantity: number;
  cost: number;
  image: string | null;
}

interface OrderDetailData {
  id: number;
  status: string;
  total_price: number;
  shipping_address: string;
  billing_address: string;
  payment_reference: string | null;
  payment_network: string | null;
  payment_network_display: string | null;
  payment_receipt: string | null;
  payment_submitted_at: string | null;
  created_at: string;
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment Form States
  const [network, setNetwork] = useState('mtn');
  const [reference, setReference] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=orders/${id}`);
      return;
    }
    fetchOrderDetail();
  }, [id, token, isAuthenticated]);

  const fetchOrderDetail = () => {
    setLoading(true);
    fetch(`http://localhost:8000/api/orders/${id}/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Order details could not be found.');
        return res.json();
      })
      .then((data) => {
        setOrder(data.order);
        setItems(data.items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !order) return;

    if (!reference.trim()) {
      setPaymentError('Reference ID/Transaction ID is required.');
      return;
    }

    setSubmittingPayment(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    const formData = new FormData();
    formData.append('payment_network', network);
    formData.append('payment_reference', reference);
    if (receiptFile) {
      formData.append('payment_receipt', receiptFile);
    }

    fetch(`http://localhost:8000/api/orders/${order.id}/confirm/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.error || 'Failed to submit payment reference.');
          });
        }
        return res.json();
      })
      .then(() => {
        setSubmittingPayment(false);
        setPaymentSuccess(true);
        setReference('');
        setReceiptFile(null);
        fetchOrderDetail(); // reload updated status
      })
      .catch((err) => {
        setPaymentError(err.message);
        setSubmittingPayment(false);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="font-semibold text-sm">Tracking order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-lg">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-slate-500 text-sm mb-6">{error || 'Order specifications could not be loaded.'}</p>
        <Link to="/orders" className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-hover transition-all-300 flex items-center justify-center gap-2">
          <CornerUpLeft className="h-4 w-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  // Stepper calculations
  const step = order.status;
  const isStepDone = (check: string) => {
    const sequence = ['pending', 'paid', 'shipped', 'delivered'];
    return sequence.indexOf(step) >= sequence.indexOf(check);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Back Button */}
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-6 transition-all-300">
        <CornerUpLeft className="h-4 w-4" />
        <span>Return to Order History</span>
      </Link>

      {/* Header Info */}
      <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight">Order #{order.id}</h1>
          <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Placed: {order.created_at}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block leading-none mb-1">TOTAL INVOICE</span>
          <span className="text-2xl font-black text-slate-900">GH₵{order.total_price.toLocaleString()}</span>
        </div>
      </div>

      {/* Dynamic Progress Stepper */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
          
          {/* Step 1 */}
          <div className="flex items-center gap-3 relative z-10">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isStepDone('pending') ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              1
            </div>
            <div>
              <span className="text-xs text-slate-400 font-extrabold uppercase block leading-none">STEP 1</span>
              <span className={`text-sm font-bold ${isStepDone('pending') ? 'text-slate-800' : 'text-slate-400'}`}>Order Placed</span>
            </div>
          </div>

          {/* Line separator */}
          <div className="hidden md:block flex-1 h-0.5 bg-slate-100" />

          {/* Step 2 */}
          <div className="flex items-center gap-3 relative z-10">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isStepDone('paid') ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
            <div>
              <span className="text-xs text-slate-400 font-extrabold uppercase block leading-none">STEP 2</span>
              <span className={`text-sm font-bold ${isStepDone('paid') ? 'text-slate-800' : 'text-slate-400'}`}>Payment Verified</span>
            </div>
          </div>

          {/* Line separator */}
          <div className="hidden md:block flex-1 h-0.5 bg-slate-100" />

          {/* Step 3 */}
          <div className="flex items-center gap-3 relative z-10">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isStepDone('shipped') ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              3
            </div>
            <div>
              <span className="text-xs text-slate-400 font-extrabold uppercase block leading-none">STEP 3</span>
              <span className={`text-sm font-bold ${isStepDone('shipped') ? 'text-slate-800' : 'text-slate-400'}`}>Shipped</span>
            </div>
          </div>

          {/* Line separator */}
          <div className="hidden md:block flex-1 h-0.5 bg-slate-100" />

          {/* Step 4 */}
          <div className="flex items-center gap-3 relative z-10">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isStepDone('delivered') ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              4
            </div>
            <div>
              <span className="text-xs text-slate-400 font-extrabold uppercase block leading-none">STEP 4</span>
              <span className={`text-sm font-bold ${isStepDone('delivered') ? 'text-slate-800' : 'text-slate-400'}`}>Delivered</span>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
        {/* Left Columns: Items & Payment Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Order Details Submitted banner */}
          {order.payment_reference ? (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 border-b border-emerald-100 pb-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>Payment Reference Submitted</span>
              </h3>
              <p className="text-xs leading-relaxed">
                We have received your transfer details. Our billing team is currently verifying the reference ID to confirm coordinates.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 text-xs">
                <div>
                  <strong className="text-slate-500 font-bold block mb-0.5">Network</strong>
                  <span className="font-semibold text-slate-800">{order.payment_network_display}</span>
                </div>
                <div>
                  <strong className="text-slate-500 font-bold block mb-0.5">Txn Reference ID</strong>
                  <span className="font-semibold text-slate-800">{order.payment_reference}</span>
                </div>
                <div>
                  <strong className="text-slate-500 font-bold block mb-0.5">Submitted Timestamp</strong>
                  <span className="font-semibold text-slate-800">{order.payment_submitted_at}</span>
                </div>
              </div>
              {order.payment_receipt && (
                <div className="mt-2">
                  <a
                    href={`http://localhost:8000${order.payment_receipt}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all-300"
                  >
                    View Receipt Screenshot ↗
                  </a>
                </div>
              )}
            </div>
          ) : order.status === 'pending' ? (
            /* Submit Payment details form */
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-6 flex items-center gap-1.5">
                <Phone className="h-5 w-5 text-primary" />
                <span>Submit Payment Details</span>
              </h3>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed mb-6">
                💡 <strong>Instructions:</strong> Transfer exactly <strong>GH₵{order.total_price.toLocaleString()}</strong> to our MoMo coordinate at <strong>{settings.momo_number} ({settings.momo_name})</strong>. Once done, input network options and transaction reference IDs below.
              </div>

              <form onSubmit={handleConfirmPayment} className="flex flex-col gap-5">
                {paymentError && (
                  <div className="bg-red-55/10 border border-red-200 text-red-500 text-xs font-semibold p-3.5 rounded-xl">
                    {paymentError}
                  </div>
                )}
                {paymentSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-500 text-xs font-semibold p-3.5 rounded-xl">
                    Payment details submitted successfully!
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase">Payment Network</label>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="telecel">Telecel Cash</option>
                      <option value="at">AT Money</option>
                      <option value="bank">Bank Transfer / GCB / EcoBank</option>
                      <option value="other">Other manual option</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase">Transaction ID / Reference ID</label>
                    <input
                      type="text"
                      placeholder="Enter Momo Txn ID or Bank Ref ID..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase">Upload Receipt Screenshot (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 text-sm focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl text-center shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all-300 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingPayment ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : null}
                  <span>Submit Payment Confirmation</span>
                </button>
              </form>
            </div>
          ) : null}

          {/* Ordered Items List */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
              <FileText className="h-5 w-5 text-primary" />
              <span>Configured Hardware list</span>
            </h3>

            <div className="flex flex-col divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img src={`http://localhost:8000${item.image}`} alt={item.product_name} className="h-full w-full object-cover" />
                      ) : (
                        <Star className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <strong className="text-slate-800 text-sm font-bold block">{item.product_name}</strong>
                      <span className="text-xs text-slate-400">Qty: {item.quantity} &times; GH₵{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">GH₵{item.cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Address and summary info */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-100 pb-3">Fulfillment Target</h3>

          <div className="flex flex-col gap-4 text-xs">
            <div>
              <strong className="text-slate-400 font-bold block mb-1">SHIPPING DESTINATION</strong>
              <div className="text-slate-700 leading-relaxed font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>{order.shipping_address}</span>
              </div>
            </div>

            <div>
              <strong className="text-slate-400 font-bold block mb-1">BILLING ADDRESS</strong>
              <div className="text-slate-700 leading-relaxed font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-1.5">
                <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>{order.billing_address}</span>
              </div>
            </div>

            <div>
              <strong className="text-slate-400 font-bold block mb-1">FULFILLMENT DESK</strong>
              <div className="text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{settings.phone_1} / {settings.phone_2}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1">
                  {settings.location}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp support widget */}
      <a
        href={`https://wa.me/${settings.whatsapp_number}?text=Hello%20MED%20Computers,%20I%20would%20like%20to%20complete%20payment%20for%20Order%20%23${order.id}%20(Total:%20GH₵${order.total_price}).`}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-btn"
        title="Complete Payment via WhatsApp"
      >
        💬
      </a>
    </div>
  );
};

export default OrderDetail;
