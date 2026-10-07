import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserDataContext } from '../context/UserContext';
import BrandLogo from '../components/common/BrandLogo';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(`${baseUrl}/users/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('userToken', data.token);
        navigate('/home');
      }
    } catch (err) {
      console.error('User login error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Invalid email or password. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-neutral-200/80 transition-all">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <Link to="/" className="hover:opacity-90 transition">
            <BrandLogo showSubtitle textClassName="text-xl" />
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Rider Access
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-black tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Sign in to book rides, view trips, and manage your account.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3.5 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3.5 pr-11 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-black text-white font-extrabold text-sm py-4 rounded-2xl hover:bg-neutral-800 active:scale-[0.99] transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In as Rider</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center text-xs text-gray-600">
          <span>Don't have an account yet? </span>
          <Link to="/signup" className="font-extrabold text-blue-600 hover:underline">
            Create Rider Account
          </Link>
        </div>

        {/* Divider */}
        <div className="my-6 relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 absolute">
            Are you a driver?
          </span>
        </div>

        {/* Switch to Captain */}
        <Link
          to="/captain-login"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border-2 border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 font-bold text-xs transition"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Captain / Driver Portal Login</span>
        </Link>
      </div>

      {/* Trust notice */}
      <p className="mt-6 text-center text-xs text-gray-400 max-w-sm">
        Protected with 256-bit encryption. By signing in, you agree to our Terms and Safety Policies.
      </p>
    </div>
  );
};

export default UserLogin;