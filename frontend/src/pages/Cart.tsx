import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { API_BASE_URL } from '../config';
import { Trash2, ShoppingCart, ShieldAlert, ArrowRight, CornerUpLeft } from 'lucide-react';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-lg flex flex-col items-center">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <ShoppingCart className="h-12 w-12 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">You have not added any premium hardware configurations to your cart yet.</p>
        <Link to="/" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl text-sm hover:bg-primary-hover shadow-md transition-all-300 flex items-center justify-center gap-2">
          <CornerUpLeft className="h-4 w-4" />
          <span>Browse Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black text-slate-800 leading-tight mb-8">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Cart Items list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all-300"
            >
              {/* Product Info Block */}
              <div className="flex items-center gap-4 flex-1">
                <div className="h-16 w-16 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={`${API_BASE_URL}${item.image}`} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-slate-300" />
                  )}
                </div>
                
                <div>
                  <Link to={`/product/${item.slug}`} className="font-extrabold text-slate-800 text-sm hover:text-primary transition-all-300 leading-tight block mb-1">
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-semibold">Unit: GH₵{item.price.toLocaleString()}</span>
                    {item.stock <= 5 && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        <span>Only {item.stock} left!</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Select Option & Prices */}
              <div className="flex justify-between sm:justify-end items-center gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400">Qty:</span>
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 text-sm focus:outline-none focus:border-primary"
                  >
                    {[...Array(Math.min(9, item.stock))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="text-right min-w-[100px]">
                  <span className="text-slate-400 text-[10px] font-extrabold uppercase block leading-none mb-1">TOTAL</span>
                  <span className="text-base font-extrabold text-slate-900">GH₵{(item.price * item.quantity).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 hover:border-red-500 h-9 w-9 rounded-xl flex items-center justify-center transition-all-300"
                  title="Remove from Cart"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right column: Cart Summary */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-100 pb-3">Summary</h3>

          <div className="flex justify-between items-center text-sm font-semibold text-slate-500">
            <span>Total Configured Items</span>
            <span className="text-slate-800 font-extrabold">{totalItems} units</span>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <span className="text-base font-extrabold text-slate-800">Grand Total</span>
            <span className="text-2xl font-black text-primary">GH₵{totalPrice.toLocaleString()}</span>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Link
              to="/checkout"
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl text-center shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all-300 text-sm flex items-center justify-center gap-1.5"
            >
              <span>Secure Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link
              to="/"
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl py-3 text-center transition-all-300 text-sm font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
