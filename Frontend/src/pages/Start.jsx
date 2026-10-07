import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, MapPin, ArrowRight, User, Car } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import homeBg from '../assets/home-bg.jpg';

const Start = () => {
  const hasUserToken = Boolean(localStorage.getItem('userToken'));
  const hasCaptainToken = Boolean(localStorage.getItem('captainToken'));

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Navigation */}
      <header className="w-full max-w-6xl mx-auto px-5 py-5 sm:py-6 flex items-center justify-between z-20">
        <BrandLogo inverted showSubtitle textClassName="text-xl sm:text-2xl" />

        <div className="flex items-center gap-3">
          <Link
            to={hasCaptainToken ? '/captain-home' : '/captain-login'}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 transition"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Driver Portal</span>
          </Link>

          <Link
            to={hasUserToken ? '/home' : '/login'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-gray-100 transition shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span>{hasUserToken ? 'Open App' : 'Sign In'}</span>
          </Link>
        </div>
      </header>

      {/* Main Hero & Action Grid */}
      <main className="w-full max-w-6xl mx-auto px-5 py-8 sm:py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-10 z-10">
        {/* Left Column: Headline and Value Propositions */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-gray-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Next-Gen Urban Mobility</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-[1.1]">
            Your city moves <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
              with speed & style.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Experience effortless rides, live GPS navigation, upfront fares, and verified captains.
            Whether you are commuting or hitting the road as a driver, we get you there smoothly.
          </p>

          {/* Quick Stats / Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <p className="text-xs font-black">Fast Pickup</p>
              <p className="text-[10px] text-gray-400">&lt; 3 mins</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <MapPin className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <p className="text-xs font-black">Live Tracking</p>
              <p className="text-[10px] text-gray-400">OSRM Maps</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <Shield className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <p className="text-xs font-black">Verified</p>
              <p className="text-[10px] text-gray-400">Safety First</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Role Entry Cards */}
        <div className="w-full max-w-md space-y-4">
          {/* Passenger Entry Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-7 shadow-2xl transition hover:border-neutral-700">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold shadow-md">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                For Riders
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Book a Ride
            </h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Enter pickup & destination, compare ride tiers, and reach your destination safely.
            </p>

            <Link
              to={hasUserToken ? '/home' : '/login'}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white text-black text-sm font-extrabold hover:bg-gray-100 transition active:scale-[0.99]"
            >
              <span>{hasUserToken ? 'Continue as Rider' : 'Ride with Us'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-3 text-center">
              <Link to="/signup" className="text-xs text-gray-400 hover:text-white transition">
                New rider? <span className="underline font-semibold text-gray-300">Create an account</span>
              </Link>
            </div>
          </div>

          {/* Captain / Driver Entry Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-neutral-900/70 border border-neutral-800 p-6 sm:p-7 shadow-2xl transition hover:border-neutral-700">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-white flex items-center justify-center font-bold border border-white/10 shadow-md">
                <Car className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                For Captains
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Drive & Earn
            </h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Go online anytime, accept nearby trip requests, and track your daily & weekly earnings.
            </p>

            <Link
              to={hasCaptainToken ? '/captain-home' : '/captain-login'}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-sm font-extrabold transition active:scale-[0.99]"
            >
              <span>{hasCaptainToken ? 'Open Captain Dashboard' : 'Captain Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-3 text-center">
              <Link to="/captain-signup" className="text-xs text-gray-400 hover:text-white transition">
                Own a vehicle? <span className="underline font-semibold text-gray-300">Register as a Captain</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-800/80 py-5 px-5 text-center text-xs text-gray-500 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 VELOX Mobility. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400 text-xs">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Safety Guidelines</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Start;
