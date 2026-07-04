import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Monitor, UserPlus } from 'lucide-react';

const Register: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract redirect parameter
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect ? `/${redirect}` : '/');
    }
  }, [isAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Username, email, and password are required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        address,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.error || 'Registration failed. Verify inputs.');
          });
        }
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        login(data.token, data);
        navigate(redirect ? `/${redirect}` : '/');
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div className="max-w-xl w-full mx-auto my-12 px-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/10 p-3 rounded-2xl mb-3 flex items-center justify-center">
            <Monitor className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800">Create an account</h2>
          <p className="text-slate-400 text-xs mt-1">Sign up to buy and track high-performance computers.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-55/10 border border-red-200 text-red-500 text-xs font-semibold p-3.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase">Username *</label>
              <input
                type="text"
                placeholder="Pick username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-semibold"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase">Email Address *</label>
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase">First Name</label>
              <input
                type="text"
                placeholder="Enter first name..."
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase">Last Name</label>
              <input
                type="text"
                placeholder="Enter last name..."
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase">Password *</label>
              <input
                type="password"
                placeholder="Create password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-semibold"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase">Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase">Default Delivery Address</label>
            <textarea
              rows={2}
              placeholder="Enter street, city, region..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-semibold leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl text-center shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all-300 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <UserPlus className="h-4.5 w-4.5" />}
            <span>Register Account</span>
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs">
          <span className="text-slate-400 font-semibold">Already have an account? </span>
          <Link to={`/login${redirect ? `?redirect=${redirect}` : ''}`} className="text-primary font-black hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
