import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Loader2, ArrowRight, UserCheck, AlertCircle, Car } from 'lucide-react';
import { CaptainDataContext } from '../context/CaptainContext';
import BrandLogo from '../components/common/BrandLogo';

const Captainlogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { setCaptain } = useContext(CaptainDataContext);
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
      const response = await axios.post(`${baseUrl}/captains/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.status === 200) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem('captainToken', data.token);
        navigate('/captain-home');
      }
    } catch (err) {
      console.error('Captain login error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Invalid captain credentials. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-neutral-200/80 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <Link to="/" className="hover:opacity-90 transition">
            <BrandLogo showSubtitle textClassName="text-xl" />
          </Link>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Car className="w-3 h-3" />
            Captain Portal
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-black tracking-tight">
            Captain Sign In
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Access your driver dashboard, live ride requests, and earnings summary.
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
              Captain Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="captain@example.com"
              className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3.5 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm py-4 rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Captain...</span>
              </>
            ) : (
              <>
                <span>Sign In to Drive</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-gray-600">
          <span>New driver? </span>
          <Link to="/captain-signup" className="font-extrabold text-emerald-700 hover:underline">
            Register as a Captain
          </Link>
        </div>

        {/* Divider */}
        <div className="my-6 relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 absolute">
            Looking for a ride?
          </span>
        </div>

        {/* Switch to Rider login */}
        <Link
          to="/login"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border-2 border-gray-300 text-gray-800 bg-gray-50 hover:bg-gray-100 font-bold text-xs transition"
        >
          <UserCheck className="w-4 h-4" />
          <span>Sign in as Rider</span>
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 max-w-sm">
        VELOX Captain Portal. Verified drivers receive real-time dispatch and trip coverage.
      </p>
    </div>
  );
};

export default Captainlogin;
