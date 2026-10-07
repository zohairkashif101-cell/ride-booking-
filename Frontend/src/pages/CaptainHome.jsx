import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CarFront,
  CheckCircle2,
  Clock3,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  UserRound,
  X,
  DollarSign,
  History,
  Shield,
  Power,
  AlertCircle,
  RefreshCw,
  Star,
  Check,
  ChevronRight,
  User,
} from "lucide-react";

import { CaptainDataContext } from "../context/CaptainContext";
import MapView from "../components/home/MapView";
import BrandLogo from "../components/common/BrandLogo";
import { useGeolocation } from "../hooks/useGeolocation";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const CaptainHome = () => {
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  const {
    coords,
    accuracy,
    loading: isLocating,
    followUser,
    setFollowUser,
    getCurrentLocation,
  } = useGeolocation();

  // Navigation tab: 'dashboard' | 'earnings' | 'history' | 'profile'
  const [activeTab, setActiveTab] = useState("dashboard");

  // Driver state
  const [isOnline, setIsOnline] = useState(captain?.status === "active");
  const [statusLoading, setStatusLoading] = useState(false);

  // Ride states
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loadingRides, setLoadingRides] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Earnings data
  const [earnings, setEarnings] = useState({
    todayEarnings: 0,
    weeklyEarnings: 0,
    totalEarnings: 0,
    completedRidesCount: 0,
    recentRides: [],
  });
  const [earningsLoading, setEarningsLoading] = useState(false);

  // History data
  const [historyRides, setHistoryRides] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const captainToken = localStorage.getItem("captainToken");

  const captainFirstName =
    captain?.fullname?.firstname ||
    captain?.fullname?.firstName ||
    captain?.name?.split(" ")[0] ||
    "Captain";

  const captainFullName = captain?.fullname
    ? `${captain.fullname.firstname || ""} ${captain.fullname.lastname || ""}`.trim()
    : captain?.name || captainFirstName;

  // Sync isOnline with captain context when loaded
  useEffect(() => {
    if (captain?.status) {
      setIsOnline(captain.status === "active");
    }
  }, [captain?.status]);

  // Auth check
  useEffect(() => {
    if (!captainToken) {
      navigate("/captain-login");
    }
  }, [captainToken, navigate]);

  // ==========================================
  // 1. ONLINE / OFFLINE TOGGLE (Real API)
  // ==========================================
  const handleToggleOnline = async () => {
    if (!captainToken) return;

    const nextStatus = isOnline ? "inactive" : "active";
    setStatusLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/captains/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${captainToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update availability");
      }

      const updatedOnline = nextStatus === "active";
      setIsOnline(updatedOnline);

      if (setCaptain && data.captain) {
        setCaptain(data.captain);
      }

      setSuccessMsg(
        updatedOnline
          ? "You are now ONLINE. You will receive real-time ride requests."
          : "You are now OFFLINE. Ride requests paused."
      );
      setTimeout(() => setSuccessMsg(""), 3500);

      if (updatedOnline) {
        fetchRideRequests();
      } else {
        setRides([]);
      }
    } catch (err) {
      console.error("Status toggle error:", err);
      setError(err.message || "Could not update status. Check your connection.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ==========================================
  // 2. FETCH INCOMING RIDE REQUESTS (Real API)
  // ==========================================
  const fetchRideRequests = useCallback(async () => {
    if (!captainToken || !isOnline || activeRide) return;

    try {
      const response = await fetch(`${BASE_URL}/api/rides/requests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${captainToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/captain-login");
          return;
        }
        throw new Error(data.message || "Failed to get ride requests");
      }

      setRides(data.rides || []);
    } catch (err) {
      console.warn("Poll requests warning:", err.message);
    } finally {
      setLoadingRides(false);
    }
  }, [captainToken, isOnline, activeRide, navigate]);

  // Polling for incoming ride requests while online and no active ride
  useEffect(() => {
    if (!isOnline || activeRide) {
      setRides([]);
      return;
    }

    setLoadingRides(true);
    fetchRideRequests();

    const interval = setInterval(fetchRideRequests, 3500);
    return () => clearInterval(interval);
  }, [isOnline, activeRide, fetchRideRequests]);

  // ==========================================
  // 3. ACCEPT RIDE (Atomic backend lock)
  // ==========================================
  const handleAcceptRide = async (ride) => {
    if (!ride?._id || !captainToken) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${BASE_URL}/api/rides/captain/${ride._id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${captainToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "accepted" }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to accept ride");
      }

      const assignedRide = data.ride || data;
      setActiveRide(assignedRide);
      setRides((prev) => prev.filter((r) => r._id !== ride._id));
      setActiveTab("dashboard");

      setSuccessMsg("Ride accepted! Navigate to passenger pickup location.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Accept error:", err);
      setError(err.message || "Ride accept failed. It may have been taken by another driver.");
      fetchRideRequests();
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // 4. REJECT RIDE (Real API)
  // ==========================================
  const handleRejectRide = async (ride) => {
    if (!ride?._id || !captainToken) return;

    setRides((prev) => prev.filter((r) => r._id !== ride._id));

    try {
      await fetch(
        `${BASE_URL}/api/rides/captain/${ride._id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${captainToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  // ==========================================
  // 5. UPDATE RIDE STATUS (Start / Complete / Cancel)
  // ==========================================
  const handleUpdateRideStatus = async (status) => {
    if (!activeRide?._id || !captainToken) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${BASE_URL}/api/rides/captain/${activeRide._id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${captainToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to update ride to ${status}`);
      }

      const updated = data.ride || data;

      if (status === "started") {
        setActiveRide(updated);
        setSuccessMsg("Trip started. Driving to passenger destination.");
        setTimeout(() => setSuccessMsg(""), 3500);
      } else if (status === "completed") {
        setActiveRide(null);
        setSuccessMsg(`Ride completed! Fare of Rs. ${Number(activeRide.fare || 0).toLocaleString()} credited.`);
        setTimeout(() => setSuccessMsg(""), 5000);
        fetchEarnings();
        fetchHistory();
        fetchRideRequests();
      } else if (status === "cancelled") {
        setActiveRide(null);
        setSuccessMsg("Ride has been cancelled.");
        setTimeout(() => setSuccessMsg(""), 3500);
        fetchRideRequests();
      }
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.message || "Failed to update ride status.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // 6. FETCH REAL EARNINGS (Real API)
  // ==========================================
  const fetchEarnings = useCallback(async () => {
    if (!captainToken) return;

    try {
      setEarningsLoading(true);
      const res = await fetch(`${BASE_URL}/captains/earnings`, {
        headers: { Authorization: `Bearer ${captainToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEarnings({
          todayEarnings: data.todayEarnings || 0,
          weeklyEarnings: data.weeklyEarnings || 0,
          totalEarnings: data.totalEarnings || 0,
          completedRidesCount: data.completedRidesCount || 0,
          recentRides: data.recentRides || [],
        });
      }
    } catch (err) {
      console.error("Fetch earnings error:", err);
    } finally {
      setEarningsLoading(false);
    }
  }, [captainToken]);

  // ==========================================
  // 7. FETCH REAL RIDE HISTORY (Real API)
  // ==========================================
  const fetchHistory = useCallback(async () => {
    if (!captainToken) return;

    try {
      setHistoryLoading(true);
      const res = await fetch(`${BASE_URL}/captains/rides/history`, {
        headers: { Authorization: `Bearer ${captainToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHistoryRides(data.rides || []);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [captainToken]);

  useEffect(() => {
    if (activeTab === "earnings") {
      fetchEarnings();
    } else if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, fetchEarnings, fetchHistory]);

  const handleLogout = () => {
    navigate("/captain/logout");
  };

  // Map destination coordinates
  const selectedRide = activeRide || rides[0] || null;

  const mapDestination = useMemo(() => {
    if (!selectedRide) return null;

    if (selectedRide.status === "requested" || selectedRide.status === "accepted") {
      return {
        lat: selectedRide.pickup.latitude,
        lng: selectedRide.pickup.longitude,
      };
    }

    if (selectedRide.status === "started") {
      return {
        lat: selectedRide.destination.latitude,
        lng: selectedRide.destination.longitude,
      };
    }

    return null;
  }, [selectedRide]);

  const formatFare = (fare) => `Rs. ${Number(fare || 0).toLocaleString()}`;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-950 font-sans select-none flex flex-col">
      {/* ══════════════════════════════════════════════════════════
          TOP APPLICATION HEADER
      ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full bg-black/95 backdrop-blur-md text-white border-b border-neutral-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Captain Badge */}
          <div className="flex items-center gap-3">
            <BrandLogo inverted showSubtitle textClassName="text-lg sm:text-xl" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <CarFront size={12} />
              Captain Hub
            </span>
          </div>

          {/* Desktop & Tablet Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900 px-2 py-1.5 rounded-2xl border border-neutral-800 shadow-inner">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              Dispatch & Map
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "earnings"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <DollarSign size={13} />
              Earnings
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "history"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <History size={13} />
              Ride History
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Shield size={13} />
              Vehicle Info
            </button>
          </nav>

          {/* Right Actions: Availability Toggle & Menu */}
          <div className="flex items-center gap-2.5">
            {/* Availability Toggle */}
            <button
              disabled={statusLoading}
              onClick={handleToggleOnline}
              title="Toggle Driver Availability"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer border ${
                isOnline
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/25"
                  : "bg-neutral-900 hover:bg-neutral-800 text-gray-300 border-neutral-700"
              } ${statusLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {statusLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <span
                  className={`h-2 w-2 rounded-full ${
                    isOnline ? "bg-white animate-pulse" : "bg-gray-500"
                  }`}
                />
              )}
              <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </button>

            {/* Menu Trigger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 transition cursor-pointer"
              aria-label="Captain menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu Modal */}
        {menuOpen && (
          <div className="absolute right-4 top-16 w-72 overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl border border-neutral-800 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="border-b border-neutral-800 p-5 bg-neutral-950/80">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-lg">
                  {captainFirstName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-white text-sm truncate">
                    {captainFullName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {captain?.email}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="flex items-center text-xs font-bold text-amber-400">
                      <Star size={12} className="fill-amber-400 text-amber-400 mr-0.5" />
                      5.0
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">
                      • {captain?.vehicle?.vehicleType || "Captain"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 space-y-1 text-xs">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition text-left cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-white text-black"
                    : "text-gray-300 hover:bg-neutral-800"
                }`}
              >
                <CarFront size={16} />
                Dashboard & Requests
              </button>
              <button
                onClick={() => {
                  setActiveTab("earnings");
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition text-left cursor-pointer ${
                  activeTab === "earnings"
                    ? "bg-white text-black"
                    : "text-gray-300 hover:bg-neutral-800"
                }`}
              >
                <DollarSign size={16} />
                Earnings & Revenue
              </button>
              <button
                onClick={() => {
                  setActiveTab("history");
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition text-left cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white text-black"
                    : "text-gray-300 hover:bg-neutral-800"
                }`}
              >
                <History size={16} />
                Trip Records
              </button>
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition text-left cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-white text-black"
                    : "text-gray-300 hover:bg-neutral-800"
                }`}
              >
                <Shield size={16} />
                Vehicle Specifications
              </button>
            </div>

            <div className="border-t border-neutral-800 p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition text-left cursor-pointer"
              >
                <LogOut size={16} />
                Sign Out Captain
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════
          NOTIFICATIONS / TOASTS
      ═══════════════════════════════════════════════════════════ */}
      {(error || successMsg) && (
        <div className="absolute top-18 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-in fade-in slide-in-from-top-2">
          <div
            className={`flex items-center justify-between p-4 rounded-2xl text-xs font-bold text-white shadow-2xl border ${
              error
                ? "bg-red-600 border-red-700"
                : "bg-neutral-900 border-neutral-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {error ? (
                <AlertCircle size={16} className="shrink-0 text-white" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              )}
              <span>{error || successMsg}</span>
            </div>
            <button
              onClick={() => {
                setError("");
                setSuccessMsg("");
              }}
              className="p-1 hover:bg-white/20 rounded-full transition ml-2"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MAIN VIEW CONTAINER
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* ========================================================
            TAB 1: DISPATCH & MAP DASHBOARD
        ========================================================= */}
        {activeTab === "dashboard" && (
          <div className="relative h-full w-full">
            {/* Background Map Layer */}
            <div className="absolute inset-0 z-0">
              <MapView
                userCoords={coords}
                destinationCoords={mapDestination}
                nearbyCars={[]}
                followUser={followUser}
                accuracy={accuracy}
              />
            </div>

            {/* Recenter Button */}
            <button
              onClick={() => {
                setFollowUser(true);
                getCurrentLocation();
              }}
              title="Recenter Map"
              className="absolute right-4 bottom-72 md:bottom-8 z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl border border-gray-100 hover:bg-gray-50 transition active:scale-95 cursor-pointer"
            >
              {isLocating ? (
                <Loader2 size={20} className="animate-spin text-black" />
              ) : (
                <Navigation size={20} className="text-black" />
              )}
            </button>

            {/* RESPONSIVE DRIVER INTERACTION CARD */}
            <div className="md:absolute md:left-6 md:top-6 md:bottom-6 md:w-[440px] md:max-w-[calc(100vw-3rem)] fixed bottom-0 left-0 right-0 z-20 bg-white md:rounded-3xl rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.25)] md:shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] md:max-h-[calc(100vh-6rem)] overflow-hidden transition-all duration-300">
              {/* Drag Indicator */}
              <div className="md:hidden w-full pt-3 pb-1 flex justify-center shrink-0">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
                {/* -----------------------------------------------
                    STATE A: OFFLINE
                ------------------------------------------------ */}
                {!isOnline ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-100 text-neutral-600 shadow-inner">
                      <Power size={32} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-black">
                        You Are Offline
                      </h2>
                      <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                        Switch your status to Online to start receiving passenger ride requests in your area.
                      </p>
                    </div>
                    <button
                      disabled={statusLoading}
                      onClick={handleToggleOnline}
                      className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 rounded-2xl bg-black py-4 text-xs font-black text-white shadow-xl hover:bg-neutral-800 transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                    >
                      {statusLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      )}
                      <span>GO ONLINE NOW</span>
                    </button>
                  </div>
                ) : activeRide ? (
                  /* -----------------------------------------------
                     STATE B: ACTIVE RIDE IN PROGRESS
                  ------------------------------------------------ */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            activeRide.status === "accepted"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {activeRide.status === "accepted"
                            ? "EN ROUTE TO PICKUP"
                            : "TRIP IN PROGRESS"}
                        </span>
                        <h2 className="text-xl font-black text-black mt-1">
                          Active Ride
                        </h2>
                      </div>
                      <div className="rounded-2xl bg-black px-4 py-2.5 text-right text-white shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Fare
                        </p>
                        <p className="text-base font-black">
                          {formatFare(activeRide.fare)}
                        </p>
                      </div>
                    </div>

                    {/* Route Steps */}
                    <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center pt-1">
                          <div className="h-3.5 w-3.5 rounded-full bg-black flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          </div>
                          <div className="my-1.5 h-8 w-0.5 bg-gray-300" />
                          <div className="h-3.5 w-3.5 rounded-sm bg-black flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-sm bg-white" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-3 min-w-0">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-gray-400">
                              Pickup Spot
                            </p>
                            <p className="text-xs font-bold text-black truncate">
                              {activeRide.pickup?.address || "Pickup address"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-gray-400">
                              Destination
                            </p>
                            <p className="text-xs font-bold text-black truncate">
                              {activeRide.destination?.address || "Destination address"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Passenger Card */}
                    <div className="flex items-center justify-between rounded-2xl border border-gray-200 p-3.5 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                          <UserRound size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            Passenger
                          </p>
                          <p className="text-sm font-bold text-black">
                            {activeRide.passenger?.fullname?.firstname
                              ? `${activeRide.passenger.fullname.firstname} ${activeRide.passenger.fullname.lastname || ""}`.trim()
                              : activeRide.passenger?.email || "Passenger"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star size={13} className="fill-amber-400" />
                        5.0
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-2 space-y-2">
                      {activeRide.status === "accepted" && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleUpdateRideStatus("started")}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-4 text-xs font-black text-white shadow-xl hover:bg-neutral-800 transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Navigation size={16} />
                          )}
                          Start Ride (Passenger Onboard)
                        </button>
                      )}

                      {activeRide.status === "started" && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleUpdateRideStatus("completed")}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-4 text-xs font-black text-white shadow-xl hover:bg-neutral-800 transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          )}
                          Complete Ride (Arrived at Destination)
                        </button>
                      )}

                      <button
                        disabled={actionLoading}
                        onClick={() => handleUpdateRideStatus("cancelled")}
                        className="w-full rounded-2xl py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        Cancel Ride
                      </button>
                    </div>
                  </div>
                ) : (
                  /* -----------------------------------------------
                     STATE C: ONLINE & WAITING FOR REQUESTS
                  ------------------------------------------------ */
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                            Live Dispatch Active
                          </span>
                        </div>
                        <h2 className="text-xl font-black text-black">
                          Available Requests ({rides.length})
                        </h2>
                      </div>
                      <button
                        onClick={fetchRideRequests}
                        title="Refresh requests"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                      >
                        <RefreshCw size={14} className="text-gray-700" />
                      </button>
                    </div>

                    {loadingRides && rides.length === 0 ? (
                      <div className="py-12 text-center">
                        <Loader2 size={28} className="animate-spin mx-auto text-black" />
                        <p className="mt-2 text-xs font-semibold text-gray-500">
                          Scanning city for ride requests...
                        </p>
                      </div>
                    ) : rides.length === 0 ? (
                      <div className="rounded-2xl bg-gray-50 border border-gray-100 py-10 px-4 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <Clock3 size={24} className="text-gray-400" />
                        </div>
                        <h3 className="font-black text-black text-sm">
                          Waiting for trip requests
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
                          New ride requests from riders will appear here instantly with full pickup & fare info.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {rides.map((ride) => {
                          const passengerName =
                            ride.passenger?.fullname?.firstname
                              ? `${ride.passenger.fullname.firstname} ${ride.passenger.fullname.lastname || ""}`.trim()
                              : ride.passenger?.email || "Passenger";

                          return (
                            <div
                              key={ride._id}
                              className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 transition"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                                    Offered Fare
                                  </span>
                                  <p className="text-xl font-black text-black">
                                    {formatFare(ride.fare)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-extrabold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Ready
                                </div>
                              </div>

                              <div className="mb-3 flex items-center gap-2 text-xs text-gray-600 font-semibold">
                                <UserRound size={14} className="text-gray-400" />
                                <span>{passengerName}</span>
                              </div>

                              {/* Route summary */}
                              <div className="space-y-2 rounded-2xl bg-gray-50 p-3 text-xs border border-gray-100">
                                <div className="flex items-start gap-2">
                                  <MapPin size={14} className="text-black shrink-0 mt-0.5" />
                                  <span className="truncate font-semibold text-gray-800">
                                    {ride.pickup?.address || "Pickup"}
                                  </span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="h-3.5 w-3.5 rounded-sm bg-black shrink-0 mt-0.5 flex items-center justify-center text-white text-[8px] font-bold">
                                    •
                                  </div>
                                  <span className="truncate font-semibold text-gray-800">
                                    {ride.destination?.address || "Dropoff"}
                                  </span>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="mt-3.5 grid grid-cols-2 gap-2">
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleRejectRide(ride)}
                                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-gray-200 py-3 text-xs font-black text-gray-700 hover:bg-gray-100 transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                                >
                                  <X size={15} />
                                  Decline
                                </button>
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleAcceptRide(ride)}
                                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-black py-3 text-xs font-black text-white shadow-md hover:bg-neutral-800 transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                                >
                                  {actionLoading ? (
                                    <Loader2 size={15} className="animate-spin" />
                                  ) : (
                                    <Check size={15} />
                                  )}
                                  Accept Ride
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: EARNINGS & METRICS
        ========================================================= */}
        {activeTab === "earnings" && (
          <div className="h-full w-full py-8 px-4 sm:px-6 max-w-5xl mx-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Financial Analytics
                </p>
                <h2 className="text-2xl font-black text-white">
                  Captain Earnings
                </h2>
              </div>
              <button
                onClick={fetchEarnings}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
              >
                <RefreshCw size={14} className={earningsLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="rounded-3xl bg-white text-black p-5 sm:p-6 shadow-xl">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Today's Earnings
                </p>
                <h3 className="text-2xl sm:text-3xl font-black mt-2">
                  {formatFare(earnings.todayEarnings)}
                </h3>
                <p className="text-[10px] text-emerald-600 mt-2 font-bold">
                  Real-time database sync
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-900 text-white border border-neutral-800 p-5 sm:p-6 shadow-xl">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  This Week
                </p>
                <h3 className="text-2xl sm:text-3xl font-black mt-2">
                  {formatFare(earnings.weeklyEarnings)}
                </h3>
                <p className="text-[10px] text-gray-400 mt-2 font-semibold">
                  Cumulative weekly total
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-900 text-white border border-neutral-800 p-5 sm:p-6 shadow-xl">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Lifetime Total
                </p>
                <h3 className="text-2xl sm:text-3xl font-black mt-2">
                  {formatFare(earnings.totalEarnings)}
                </h3>
                <p className="text-[10px] text-gray-400 mt-2 font-semibold">
                  All completed trips
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-900 text-white border border-neutral-800 p-5 sm:p-6 shadow-xl">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Completed Rides
                </p>
                <h3 className="text-2xl sm:text-3xl font-black mt-2">
                  {earnings.completedRidesCount}
                </h3>
                <p className="text-[10px] text-emerald-400 mt-2 font-bold">
                  Verified trip logs
                </p>
              </div>
            </div>

            {/* Recent Completed Trips Breakdown */}
            <div className="rounded-3xl bg-neutral-900 text-white border border-neutral-800 p-5 sm:p-6 shadow-xl">
              <h4 className="text-sm font-black text-white mb-4">
                Recent Completed Trips
              </h4>

              {earningsLoading ? (
                <div className="py-12 text-center">
                  <Loader2 size={24} className="animate-spin mx-auto text-white" />
                  <p className="mt-2 text-xs text-gray-400 font-semibold">
                    Calculating earnings ledger...
                  </p>
                </div>
              ) : earnings.recentRides.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No completed rides logged yet. Complete trips to generate your earnings report.
                </div>
              ) : (
                <div className="divide-y divide-neutral-800">
                  {earnings.recentRides.map((ride) => (
                    <div key={ride._id} className="py-3.5 flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <p className="text-xs font-bold text-white truncate">
                          {ride.destination?.address || "Trip"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(ride.createdAt).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-emerald-400">
                          +{formatFare(ride.fare)}
                        </p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: TRIP RECORDS
        ========================================================= */}
        {activeTab === "history" && (
          <div className="h-full w-full py-8 px-4 sm:px-6 max-w-5xl mx-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Audit History
                </p>
                <h2 className="text-2xl font-black text-white">
                  Captain Ride Logs
                </h2>
              </div>
              <button
                onClick={fetchHistory}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
              >
                <RefreshCw size={14} className={historyLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {historyLoading ? (
              <div className="py-16 text-center">
                <Loader2 size={28} className="animate-spin mx-auto text-white" />
                <p className="mt-2 text-xs text-gray-400 font-semibold">
                  Loading trip history from database...
                </p>
              </div>
            ) : historyRides.length === 0 ? (
              <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-8 text-center shadow-xl">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-gray-400">
                  <History size={24} />
                </div>
                <h3 className="font-extrabold text-white text-sm">
                  No trips recorded yet
                </h3>
                <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
                  When you accept and complete passenger rides, full route and fare records will be saved here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyRides.map((ride) => {
                  const passengerName =
                    ride.passenger?.fullname?.firstname
                      ? `${ride.passenger.fullname.firstname} ${ride.passenger.fullname.lastname || ""}`.trim()
                      : ride.passenger?.email || "Passenger";

                  const isDone = ride.status === "completed";
                  const isCancelled = ride.status === "cancelled";

                  return (
                    <div
                      key={ride._id}
                      className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-xl hover:border-neutral-700 transition text-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isDone
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isCancelled
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {ride.status}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(ride.createdAt).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-white">
                            {formatFare(ride.fare)}
                          </p>
                          <p className="text-[10px] font-semibold text-gray-400">
                            Passenger: {passengerName}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-neutral-950 p-3.5 space-y-2 text-xs border border-neutral-800">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-500 text-[10px] uppercase w-12">
                            Pickup:
                          </span>
                          <span className="truncate text-gray-200 font-medium">
                            {ride.pickup?.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-500 text-[10px] uppercase w-12">
                            Dropoff:
                          </span>
                          <span className="truncate text-gray-200 font-medium">
                            {ride.destination?.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: PROFILE & VEHICLE SPECS
        ========================================================= */}
        {activeTab === "profile" && (
          <div className="h-full w-full py-8 px-4 sm:px-6 max-w-2xl mx-auto overflow-y-auto">
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-7 shadow-xl text-white mb-5">
              <div className="flex items-center gap-4 pb-6 border-b border-neutral-800">
                <div className="h-16 w-16 rounded-3xl bg-white text-black flex items-center justify-center font-black text-2xl shadow-md">
                  {captainFirstName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {captainFullName}
                  </h3>
                  <p className="text-xs text-gray-400">{captain?.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                      Verified Fleet Driver
                    </span>
                    <span className="flex items-center text-xs font-bold text-amber-400">
                      <Star size={12} className="fill-amber-400 text-amber-400 mr-0.5" />
                      5.0
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4">
                  Registered Vehicle Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Vehicle Type
                    </p>
                    <p className="font-extrabold text-white mt-1 uppercase text-sm">
                      {captain?.vehicle?.vehicleType || "Car"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      License Plate
                    </p>
                    <p className="font-mono font-bold text-white mt-1 uppercase text-sm">
                      {captain?.vehicle?.plate || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Vehicle Color
                    </p>
                    <p className="font-bold text-white mt-1 capitalize text-sm">
                      {captain?.vehicle?.color || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Seating Capacity
                    </p>
                    <p className="font-bold text-white mt-1 text-sm">
                      {captain?.vehicle?.capacity || 4} Passengers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600/10 text-red-400 border border-red-600/20 py-4 text-xs font-extrabold hover:bg-red-600/20 transition cursor-pointer"
            >
              <LogOut size={16} />
              Sign Out from Captain Account
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (Mobile only)
      ═══════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-md border-t border-neutral-800 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "dashboard" ? "text-white font-extrabold" : "text-gray-400 font-semibold"
          }`}
        >
          <CarFront size={18} />
          <span className="text-[10px]">Dispatch</span>
        </button>

        <button
          onClick={() => setActiveTab("earnings")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "earnings" ? "text-white font-extrabold" : "text-gray-400 font-semibold"
          }`}
        >
          <DollarSign size={18} />
          <span className="text-[10px]">Earnings</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "history" ? "text-white font-extrabold" : "text-gray-400 font-semibold"
          }`}
        >
          <History size={18} />
          <span className="text-[10px]">Trips</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "profile" ? "text-white font-extrabold" : "text-gray-400 font-semibold"
          }`}
        >
          <Shield size={18} />
          <span className="text-[10px]">Vehicle</span>
        </button>
      </nav>
    </div>
  );
};

export default CaptainHome;