import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Menu, X, Monitor, ShieldAlert } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-50 transition-all-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-accent">
            <Monitor className="h-6 w-6 text-primary" />
            <span>MED<span className="text-primary font-light">COMPUTERS</span></span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 hover:text-primary font-medium transition-all-300">Catalog</Link>
            <Link to="/cart" className="relative text-slate-600 hover:text-primary font-medium transition-all-300 flex items-center gap-1">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-primary text-white text-[10px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/orders" className="text-slate-600 hover:text-primary font-medium transition-all-300">My Orders</Link>
                {user?.role === 'admin' && (
                  <a href="http://localhost:8000/dashboard/" className="text-amber-600 hover:text-amber-800 font-bold transition-all-300 flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                )}
                <span className="text-slate-500 text-sm font-medium">Hello, {user?.first_name || user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-4 py-1.5 rounded-lg transition-all-300 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-primary font-medium transition-all-300">Login</Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-hover text-white font-bold px-4 py-1.5 rounded-lg transition-all-300 text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-4">
            <Link to="/cart" className="relative text-slate-600 hover:text-primary transition-all-300">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-primary text-white text-[10px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-primary focus:outline-none transition-all-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Offscreen Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-72 bg-white shadow-2xl border-l border-slate-200 transition-all duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full invisible'
        } z-40 flex flex-col p-6 pt-6 gap-4`}
      >
        {/* Close Button Inside Drawer */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-2">
          <span className="font-extrabold text-slate-850 text-sm">Navigation Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-500 hover:text-primary transition-all-300 focus:outline-none"
            aria-label="Close Menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <Link to="/" onClick={() => setIsOpen(false)} className="text-lg text-slate-600 hover:text-primary font-semibold py-2 border-b border-slate-100">Catalog</Link>
        <Link to="/cart" onClick={() => setIsOpen(false)} className="text-lg text-slate-600 hover:text-primary font-semibold py-2 border-b border-slate-100 flex items-center justify-between">
          <span>Shopping Cart</span>
          {totalItems > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems} items</span>
          )}
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/orders" onClick={() => setIsOpen(false)} className="text-lg text-slate-600 hover:text-primary font-semibold py-2 border-b border-slate-100">My Orders</Link>
            {user?.role === 'admin' && (
              <a href="http://localhost:8000/dashboard/" onClick={() => setIsOpen(false)} className="text-lg text-amber-600 hover:text-amber-800 font-bold py-2 border-b border-slate-100 flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" />
                <span>Dashboard</span>
              </a>
            )}
            <div className="text-sm text-slate-400 font-medium mt-auto">Logged in as {user?.username}</div>
            <button
              onClick={handleLogout}
              className="w-100 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-center transition-all-300 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg text-slate-600 hover:text-primary font-semibold py-2 border-b border-slate-100">Login</Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg text-center transition-all-300 text-sm mt-4"
            >
              Register
            </Link>
          </>
        )}
      </div>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-30 transition-opacity"
        />
      )}
    </nav>
  );
};

export default Navbar;
