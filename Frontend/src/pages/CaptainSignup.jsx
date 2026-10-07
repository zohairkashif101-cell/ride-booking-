import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Loader2, ArrowRight, UserCheck, AlertCircle, Car, Shield } from 'lucide-react';
import { CaptainDataContext } from '../context/CaptainContext';
import BrandLogo from '../components/common/BrandLogo';

const CaptainSignup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('4');
  const [vehicleType, setVehicleType] = useState('car');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || firstName.trim().length < 3) {
      setErrorMessage('First name must be at least 3 characters long.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!vehicleColor.trim() || vehicleColor.trim().length < 3) {
      setErrorMessage('Vehicle color must be at least 3 characters long.');
      return;
    }
    if (!vehiclePlate.trim() || vehiclePlate.trim().length < 3) {
      setErrorMessage('Vehicle plate must be at least 3 characters long.');
      return;
    }
    if (!vehicleCapacity || Number(vehicleCapacity) < 1) {
      setErrorMessage('Vehicle capacity must be at least 1.');
      return;
    }
    if (!['car', 'motorcycle', 'auto', 'moto'].includes(vehicleType)) {
      setErrorMessage('Please select a valid vehicle type.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const captainData = {
      fullname: {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
      },
      email: email.trim().toLowerCase(),
      password,
      vehicle: {
        color: vehicleColor.trim(),
        plate: vehiclePlate.trim().toUpperCase(),
        capacity: Number(vehicleCapacity),
        vehicleType,
      },
    };

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(`${baseUrl}/captains/register`, captainData);

      if (response.status === 201) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem('captainToken', data.token);
        navigate('/captain-home');
      }
    } catch (err) {
      console.error('Captain registration error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Captain registration failed. Please review your details.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Container Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-neutral-200/80 transition-all my-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <Link to="/" className="hover:opacity-90 transition">
            <BrandLogo showSubtitle textClassName="text-xl" />
          </Link>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Car className="w-3 h-3" />
            Join Fleet
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-black tracking-tight">
            Captain Registration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Register your driver profile and vehicle to begin accepting rides.
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
          {/* Captain Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Captain Full Name
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                type="text"
                placeholder="First name (min 3)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              required
              type="email"
              placeholder="captain@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3 pr-11 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                autoComplete="new-password"
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

          {/* Vehicle Information Box */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Vehicle Specifications
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <input
                  required
                  type="text"
                  placeholder="Color (e.g. Silver)"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                />
              </div>
              <div>
                <input
                  required
                  type="text"
                  placeholder="Plate (e.g. ABC-1234)"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Passenger Capacity
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="12"
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-4 py-3 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Vehicle Category
                </label>
                <select
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-black text-sm font-semibold rounded-2xl px-3 py-3 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition cursor-pointer"
                >
                  <option value="car">Car (Sedan/Hatchback)</option>
                  <option value="auto">Auto (Rickshaw)</option>
                  <option value="moto">Moto (Bike)</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm py-4 rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Fleet Vehicle...</span>
              </>
            ) : (
              <>
                <span>Complete Captain Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing account */}
        <div className="mt-6 text-center text-xs text-gray-600">
          <span>Already registered as a Captain? </span>
          <Link to="/captain-login" className="font-extrabold text-emerald-700 hover:underline">
            Sign In here
          </Link>
        </div>

        {/* Switch to Rider */}
        <div className="my-5 relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 absolute">
            Not a driver?
          </span>
        </div>

        <Link
          to="/signup"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-gray-300 text-gray-800 bg-gray-50 hover:bg-gray-100 font-bold text-xs transition"
        >
          <UserCheck className="w-4 h-4" />
          <span>Register as Rider Instead</span>
        </Link>
      </div>

      <p className="mb-6 text-center text-[11px] text-gray-400 max-w-sm">
        All captain registrations undergo automated verification prior to ride assignment.
      </p>
    </div>
  );
};

export default CaptainSignup;
