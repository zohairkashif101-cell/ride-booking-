import { useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  Menu,
  LocateFixed,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  X,
  Star,
  Clock,
  MapPin,
  Navigation,
  CheckCircle2,
  Loader2,
  AlertCircle,
  History,
  Shield,
  Phone,
  Share2,
  Plus,
  Home as HomeIcon,
  Briefcase,
  Dumbbell,
  Compass,
  ArrowLeft,
  CreditCard,
  Banknote,
  Send,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import MapView from '../components/home/MapView';
import SideDrawer from '../components/home/SideDrawer';
import BrandLogo from '../components/common/BrandLogo';
import { useGeolocation } from '../hooks/useGeolocation';
import { getNearbyCars } from '../data/homeData';
import {
  UberGoIcon,
  UberPremierIcon,
  UberAutoIcon,
  GoRentalsIcon,
} from '../components/home/VehicleIcons';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

/** Calculate distance-based fare */
const estimateFare = (pickupCoords, destCoords, rideType) => {
  if (!pickupCoords?.lat || !destCoords?.lat) return 120;
  const R = 6371;
  const dLat = ((destCoords.lat - pickupCoords.lat) * Math.PI) / 180;
  const dLon = ((destCoords.lng - pickupCoords.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((pickupCoords.lat * Math.PI) / 180) *
    Math.cos((destCoords.lat * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const rates = {
    uber_go: { base: 60, perKm: 15, min: 100 },
    uber_premier: { base: 90, perKm: 20, min: 140 },
    uber_auto: { base: 40, perKm: 10, min: 60 },
    go_rentals: { base: 200, perKm: 28, min: 300 },
  };

  const rate = rates[rideType] || rates.uber_go;
  const rawFare = Math.round(rate.base + dist * rate.perKm);
  return Math.max(rawFare, rate.min);
};

const RIDE_POLL_INTERVAL = 3500;

const Home = () => {
  const { user } = useContext(UserDataContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('userToken');

  // Map and Geolocation
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const {
    coords,
    accuracy,
    address: pickupAddress,
    loading: isLocating,
    error: locationError,
    followUser,
    setFollowUser,
    getCurrentLocation,
  } = useGeolocation();

  const nearbyCars = useMemo(() => getNearbyCars(coords.lat, coords.lng), [coords.lat, coords.lng]);

  // Panels: 'search' | 'rideType' | 'searching' | 'driverAssigned' | 'activeRide' | 'completed' | 'history' | 'profile'
  const [panel, setPanel] = useState('search');

  // Locations
  const [pickupInput, setPickupInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [destCoords, setDestCoords] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchDebounce, setSearchDebounce] = useState(null);
  const [scheduleType, setScheduleType] = useState('Now');
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // Selected ride type
  const [selectedRideType, setSelectedRideType] = useState('uber_go');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'card'

  // Live ride & backend state
  const [currentRide, setCurrentRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Chat message to driver simulation
  const [driverMessage, setDriverMessage] = useState('');
  const [sentMessageToast, setSentMessageToast] = useState('');

  // Rating
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // History
  const [rides, setRides] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Sync pickup address with current geolocated address
  useEffect(() => {
    if (pickupAddress && !pickupInput) {
      setPickupInput(pickupAddress);
    }
  }, [pickupAddress, pickupInput]);

  // Destination autocomplete search (Nominatim)
  const handleDestChange = (val) => {
    setDestInput(val);
    if (searchDebounce) clearTimeout(searchDebounce);
    if (val.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            val
          )}&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(
          data.map((item) => {
            const parts = item.display_name.split(',');
            return {
              id: item.place_id,
              title: parts[0]?.trim() || item.name,
              address: parts.slice(1, 3).join(',').trim(),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            };
          })
        );
      } catch {
        setSuggestions([]);
      }
    }, 400);
    setSearchDebounce(t);
  };

  const selectSuggestion = (place) => {
    setDestInput(place.title);
    setDestCoords({ lat: place.lat, lng: place.lng });
    setSuggestions([]);
    setFollowUser(false);
  };

  // Quick place chips click handler
  const handleSelectQuickChip = (title, latOffset = 0.02, lngOffset = 0.02) => {
    const lat = (coords?.lat || 24.8607) + latOffset;
    const lng = (coords?.lng || 67.0011) + lngOffset;
    setDestInput(title);
    setDestCoords({ lat, lng });
    setSuggestions([]);
    setFollowUser(false);
    setPanel('rideType');
  };

  // Estimated fare
  const estimatedFare = useMemo(
    () => estimateFare(coords, destCoords, selectedRideType),
    [coords, destCoords, selectedRideType]
  );

  // Defined ride options with authentic pricing & imagery
  const rideOptions = useMemo(() => {
    const goFare = estimateFare(coords, destCoords, 'uber_go');
    const premFare = estimateFare(coords, destCoords, 'uber_premier');
    const autoFare = estimateFare(coords, destCoords, 'uber_auto');
    const rentFare = estimateFare(coords, destCoords, 'go_rentals');

    return [
      {
        id: 'uber_go',
        name: 'VELOX Go',
        capacity: 4,
        eta: '3 min',
        time: 'Fastest arrival',
        desc: 'Everyday affordable, compact rides',
        price: goFare,
        origPrice: Math.round(goFare * 1.2),
        icon: UberGoIcon,
      },
      {
        id: 'uber_premier',
        name: 'VELOX Premier',
        capacity: 4,
        eta: '5 min',
        time: 'Premium comfort',
        desc: 'High-end sedans with top-rated captains',
        price: premFare,
        origPrice: Math.round(premFare * 1.2),
        icon: UberPremierIcon,
      },
      {
        id: 'uber_auto',
        name: 'VELOX Auto',
        capacity: 3,
        eta: '2 min',
        time: 'Doorstep pickup',
        desc: 'Quick 3-wheeler rides across town',
        price: autoFare,
        origPrice: Math.round(autoFare * 1.25),
        icon: UberAutoIcon,
      },
      {
        id: 'go_rentals',
        name: 'VELOX Rentals',
        capacity: 4,
        eta: '7 min',
        time: 'Hourly bookings',
        desc: 'Dedicated car for multiple stops & hours',
        price: rentFare,
        origPrice: null,
        icon: GoRentalsIcon,
      },
    ];
  }, [coords, destCoords]);

  const selectedOption = rideOptions.find((r) => r.id === selectedRideType) || rideOptions[0];

  // ==========================================
  // BOOK RIDE (Real API)
  // ==========================================
  const handleBookRide = async () => {
    if (!destCoords || !pickupInput.trim()) {
      setApiError('Please enter pickup and destination locations.');
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setApiError('');

      const res = await fetch(`${API_URL}/rides/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickup: {
            address: pickupInput.trim(),
            latitude: coords.lat,
            longitude: coords.lng,
          },
          destination: {
            address: destInput.trim(),
            latitude: destCoords.lat,
            longitude: destCoords.lng,
          },
          fare: estimatedFare,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to book ride');

      setCurrentRide(data.ride);
      setPanel('searching');
    } catch (err) {
      setApiError(err.message || 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // POLL RIDE STATUS
  // ==========================================
  const pollRideStatus = useCallback(async () => {
    if (!currentRide?._id || !token) return;

    try {
      const res = await fetch(`${API_URL}/rides/${currentRide._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;

      const ride = data.ride;
      setCurrentRide(ride);

      if (ride.status === 'accepted' && panel === 'searching') {
        setPanel('driverAssigned');
      } else if (
        ride.status === 'started' &&
        (panel === 'searching' || panel === 'driverAssigned')
      ) {
        setPanel('activeRide');
      } else if (ride.status === 'completed' && panel !== 'completed') {
        setPanel('completed');
      } else if (ride.status === 'cancelled') {
        setPanel('search');
        setCurrentRide(null);
        setApiError('Ride was cancelled.');
      }
    } catch {
      /* silent */
    }
  }, [currentRide?._id, token, panel]);

  useEffect(() => {
    if (!['searching', 'driverAssigned', 'activeRide'].includes(panel)) return;
    const interval = setInterval(pollRideStatus, RIDE_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [panel, pollRideStatus]);

  // ==========================================
  // CANCEL RIDE
  // ==========================================
  const handleCancelRide = async () => {
    if (!currentRide?._id || !token) return;
    try {
      setLoading(true);
      await fetch(`${API_URL}/rides/${currentRide._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      setPanel('search');
      setCurrentRide(null);
    } catch (err) {
      setApiError('Could not cancel ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SUBMIT RATING
  // ==========================================
  const handleSubmitRating = async () => {
    if (!currentRide?._id || ratingValue < 1 || !token) return;
    try {
      setLoading(true);
      const toUserId = currentRide.driver?._id || currentRide.driver;
      if (toUserId) {
        await fetch(`${API_URL}/ratings/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rideId: currentRide._id,
            toUserId,
            rating: ratingValue,
            comment: ratingComment,
          }),
        });
      }
      setRatingSubmitted(true);
      setTimeout(() => {
        setPanel('search');
        setCurrentRide(null);
        setDestCoords(null);
        setDestInput('');
        setRatingValue(5);
        setRatingComment('');
        setRatingSubmitted(false);
      }, 1500);
    } catch {
      setPanel('search');
      setCurrentRide(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH RIDE HISTORY
  // ==========================================
  const fetchRideHistory = async () => {
    if (!token) return;
    try {
      setHistoryLoading(true);
      const res = await fetch(`${API_URL}/rides/my/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRides(data.rides || []);
    } catch {
      /* silent */
    } finally {
      setHistoryLoading(false);
    }
  };

  // Driver details extraction
  const driverName =
    currentRide?.driver?.fullname?.firstname ||
    currentRide?.driver?.name ||
    'Captain';
  const driverPlate = currentRide?.driver?.vehicle?.plate || 'VERIFIED';
  const driverVehicle = currentRide?.driver?.vehicle
    ? `${currentRide.driver.vehicle.color || 'White'} ${currentRide.driver.vehicle.vehicleType === 'car'
      ? 'Sedan'
      : currentRide.driver.vehicle.vehicleType.toUpperCase()
    }`
    : 'Assigned Vehicle';

  // Send message simulation
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!driverMessage.trim()) return;
    setSentMessageToast(`Message sent to Captain ${driverName}: "${driverMessage}"`);
    setDriverMessage('');
    setTimeout(() => setSentMessageToast(''), 4000);
  };

  const userInitial =
    user?.fullname?.firstname?.charAt(0) ||
    user?.name?.charAt(0) ||
    'R';

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-950 font-sans select-none flex flex-col">
      {/* ══════════════════════════════════════════════════════════
          TOP APPLICATION HEADER
      ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full bg-black/95 backdrop-blur-md text-white border-b border-neutral-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Navigation Menu & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (panel !== 'search') setPanel('search');
                else setIsDrawerOpen(true);
              }}
              className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white hover:bg-neutral-800 transition cursor-pointer"
              aria-label="Navigation"
            >
              {panel !== 'search' ? (
                <ArrowLeft className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <BrandLogo inverted showSubtitle textClassName="text-lg sm:text-xl" />
          </div>

          {/* Center: Stage Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-900/80 px-3.5 py-1.5 rounded-full border border-neutral-800 text-xs font-bold text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {panel === 'search' && 'Plan Your Trip'}
              {panel === 'rideType' && 'Select Vehicle Tier'}
              {panel === 'searching' && 'Connecting to Captain'}
              {panel === 'driverAssigned' && 'Captain Dispatched'}
              {panel === 'activeRide' && 'En Route to Destination'}
              {panel === 'completed' && 'Trip Completed'}
              {panel === 'history' && 'Trip History'}
              {panel === 'profile' && 'Your Profile'}
            </span>
          </div>

          {/* Right: Quick Trips & User Avatar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                fetchRideHistory();
                setPanel('history');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white hover:bg-neutral-800 transition shadow-sm cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">Trips</span>
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm hover:scale-105 transition cursor-pointer shadow-sm"
              title="Open profile menu"
            >
              {userInitial}
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT AREA (MAP + RESPONSIVE INTERACTION PANEL)
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* FULLSCREEN MAP BACKGROUND LAYER */}
        <div className="absolute inset-0 z-0">
          <MapView
            userCoords={coords}
            destinationCoords={destCoords}
            nearbyCars={nearbyCars}
            followUser={followUser}
            accuracy={accuracy}
          />
        </div>

        {/* FLOATING MAP CONTROLS (Recenter GPS) */}
        <div className="absolute right-4 bottom-72 md:bottom-8 z-10 flex flex-col gap-2">
          <button
            onClick={() => {
              setFollowUser(true);
              getCurrentLocation();
            }}
            className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-gray-100 flex items-center justify-center text-black hover:bg-gray-50 active:scale-95 transition cursor-pointer"
            title="Recenter location"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <LocateFixed className="w-5 h-5 text-black" />
            )}
          </button>
        </div>

        {/* TOAST ALERTS */}
        {(apiError || sentMessageToast) && (
          <div className="absolute top-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40 animate-in fade-in slide-in-from-top-2">
            <div
              className={`flex items-center justify-between p-4 rounded-2xl text-xs font-bold text-white shadow-2xl border ${apiError
                  ? 'bg-red-600 border-red-700'
                  : 'bg-neutral-900 border-neutral-700'
                }`}
            >
              <div className="flex items-center gap-2.5">
                {apiError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{apiError || sentMessageToast}</span>
              </div>
              <button
                onClick={() => {
                  setApiError('');
                  setSentMessageToast('');
                }}
                className="p-1 hover:bg-white/20 rounded-full transition ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            RESPONSIVE INTERACTION PANEL
            - Desktop & Tablet (md:): Floating left panel (w-[440px])
            - Mobile (< md:): Bottom sheet (fixed bottom-0)
        ═══════════════════════════════════════════════════════════ */}
        <div className="md:absolute md:left-6 md:top-6 md:bottom-6 md:w-[440px] md:max-w-[calc(100vw-3rem)] fixed bottom-0 left-0 right-0 z-20 bg-white md:rounded-3xl rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.25)] md:shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] md:max-h-[calc(100vh-6rem)] overflow-hidden transition-all duration-300">
          {/* Subtle Mobile Drag Indicator */}
          <div className="md:hidden w-full pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
            {/* ────────────────────────────────────────────────────────
                1. PANEL: SEARCH & DESTINATION INPUT
            ──────────────────────────────────────────────────────── */}
            {panel === 'search' && (
              <div className="space-y-4">
                {/* Schedule Selector */}
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <button
                      onClick={() => setScheduleOpen((v) => !v)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-extrabold text-black transition cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{scheduleType}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {scheduleOpen && (
                      <div className="absolute left-0 top-10 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-30 space-y-1">
                        <button
                          onClick={() => {
                            setScheduleType('Now');
                            setScheduleOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition"
                        >
                          ⚡ Ride Now
                        </button>
                        <button
                          onClick={() => {
                            setScheduleType('Schedule');
                            setScheduleOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition"
                        >
                          🕒 Reserve for Later
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-gray-400">
                    Step 1: Set Route
                  </span>
                </div>

                {/* DUAL INPUT BOX (Pickup ◉ & Dropoff ■) */}
                <div className="rounded-2xl border-2 border-black bg-white p-1 shadow-sm">
                  {/* Pickup Row */}
                  <div className="flex items-center gap-3 px-3.5 py-3 border-b border-gray-100">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-black flex items-center justify-center shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-black" />
                    </div>
                    <input
                      value={pickupInput}
                      onChange={(e) => setPickupInput(e.target.value)}
                      placeholder="Pickup location"
                      className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-black placeholder:text-gray-400 outline-none"
                    />
                    {isLocating && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                  </div>

                  {/* Dropoff Row */}
                  <div className="flex items-center gap-3 px-3.5 py-3">
                    <div className="h-3.5 w-3.5 rounded-sm bg-black shrink-0" />
                    <input
                      value={destInput}
                      onChange={(e) => handleDestChange(e.target.value)}
                      placeholder="Dropoff destination"
                      className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-black placeholder:text-gray-400 outline-none"
                    />
                    {destInput ? (
                      <button
                        onClick={() => {
                          setDestInput('');
                          setDestCoords(null);
                          setSuggestions([]);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    ) : (
                      <button
                        title="Add Stop"
                        className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-black hover:bg-gray-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* QUICK DESTINATION CHIPS */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Quick Destinations
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      onClick={() => handleSelectQuickChip('Dolmen Mall Clifton', 0.02, 0.02)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-xs font-bold text-black hover:bg-gray-200 transition shrink-0 cursor-pointer"
                    >
                      <HomeIcon className="w-3.5 h-3.5" />
                      <span>Clifton</span>
                    </button>
                    <button
                      onClick={() => handleSelectQuickChip('Financial District', -0.02, 0.015)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-xs font-bold text-black hover:bg-gray-200 transition shrink-0 cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Work</span>
                    </button>
                    <button
                      onClick={() => handleSelectQuickChip('Airport Terminal', 0.035, -0.02)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-xs font-bold text-black hover:bg-gray-200 transition shrink-0 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Airport</span>
                    </button>
                    <button
                      onClick={() => handleSelectQuickChip('Fitness Club', 0.012, -0.01)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-xs font-bold text-black hover:bg-gray-200 transition shrink-0 cursor-pointer"
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Gym</span>
                    </button>
                  </div>
                </div>

                {/* LIVE AUTOCOMPLETE SUGGESTIONS */}
                {suggestions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden divide-y divide-gray-50">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => selectSuggestion(s)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition cursor-pointer"
                      >
                        <div className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-black truncate">
                            {s.title}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {s.address}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* MAP PIN SHORTCUT */}
                <div className="divide-y divide-gray-100 border-t border-gray-100 pt-1">
                  <button
                    onClick={() => {
                      if (coords) {
                        setDestCoords({
                          lat: coords.lat + 0.02,
                          lng: coords.lng + 0.02,
                        });
                        setDestInput('Pin drop location');
                      }
                    }}
                    className="w-full flex items-center gap-3 py-3 text-left hover:bg-gray-50 transition rounded-xl px-2 cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-black">
                        Set destination on map
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Drop a pin at your exact destination point
                      </p>
                    </div>
                  </button>
                </div>

                {/* CONTINUE BUTTON */}
                <button
                  onClick={() => destCoords && setPanel('rideType')}
                  disabled={!destCoords}
                  className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${destCoords
                      ? 'bg-black text-white hover:bg-neutral-800 active:scale-[0.99] cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <span>{destCoords ? 'Select Ride Vehicle' : 'Enter Destination'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                2. PANEL: CHOOSE A RIDE
            ──────────────────────────────────────────────────────── */}
            {panel === 'rideType' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-black">
                      Select Vehicle
                    </h2>
                    <p className="text-xs text-gray-400">
                      Available tiers for your route
                    </p>
                  </div>
                  <button
                    onClick={() => setPanel('search')}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 4 RIDE OPTIONS */}
                <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-1">
                  {rideOptions.map((opt) => {
                    const isSelected = selectedRideType === opt.id;
                    const IconComponent = opt.icon;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedRideType(opt.id)}
                        className={`relative flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${isSelected
                            ? 'border-black bg-white shadow-md'
                            : 'border-transparent bg-gray-50/80 hover:bg-gray-100/80'
                          }`}
                      >
                        <div className="shrink-0 flex items-center justify-center w-16 h-12">
                          <IconComponent className="w-16 h-12 object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-extrabold text-sm text-black">
                              {opt.name}
                            </p>
                            <span className="text-[10px] font-bold text-gray-500">
                              👤 {opt.capacity}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                            {opt.eta} away • {opt.time}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">
                            {opt.desc}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-base font-black text-black">
                            Rs. {opt.price.toLocaleString()}
                          </p>
                          {opt.origPrice && (
                            <p className="text-[10px] font-bold text-gray-400 line-through">
                              Rs. {opt.origPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PAYMENT METHOD BAR */}
                <div
                  onClick={() =>
                    setPaymentMethod((prev) => (prev === 'cash' ? 'card' : 'cash'))
                  }
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-12 rounded-xl bg-black text-white flex items-center justify-center font-black text-[10px] tracking-wider">
                      {paymentMethod === 'card' ? 'CARD' : 'CASH'}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-black">
                        {paymentMethod === 'card'
                          ? 'Electronic Card Payment'
                          : 'Cash to Captain'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Tap to change payment method
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                {/* REQUEST BUTTON */}
                <button
                  disabled={loading}
                  onClick={handleBookRide}
                  className="w-full py-4 rounded-2xl bg-black text-white font-black text-sm shadow-xl hover:bg-neutral-800 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Dispatching Request...</span>
                    </>
                  ) : (
                    <span>Request {selectedOption.name}</span>
                  )}
                </button>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                3. PANEL: SEARCHING STATE (RADAR)
            ──────────────────────────────────────────────────────── */}
            {panel === 'searching' && (
              <div className="py-6 text-center space-y-4">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-75" />
                  <div className="h-16 w-16 rounded-3xl bg-black text-white flex items-center justify-center shadow-xl">
                    <Navigation className="w-8 h-8 animate-pulse text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-black">
                    Finding your Captain...
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Matching your trip with the closest available vehicle.
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 text-left border border-gray-100 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="font-bold text-gray-500">Tier</span>
                    <span className="font-extrabold text-black">
                      {selectedOption.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-500">Estimated Fare</span>
                    <span className="font-black text-black text-sm">
                      Rs. {estimatedFare.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={handleCancelRide}
                  className="w-full py-3 rounded-2xl border border-gray-200 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  Cancel Request
                </button>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                4. PANEL: DRIVER ASSIGNED
            ──────────────────────────────────────────────────────── */}
            {panel === 'driverAssigned' && currentRide && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Captain En Route
                  </span>
                  <h2 className="text-base font-black text-black mt-1">
                    Pickup: {pickupInput || 'Current spot'}
                  </h2>
                </div>

                {/* DRIVER CARD */}
                <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg shadow-md">
                          {driverName.charAt(0)}
                        </div>
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-black border border-gray-200 rounded-full px-1.5 py-0.2 text-[9px] font-extrabold flex items-center gap-0.5 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          5.0
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-black text-black">
                          {driverName}
                        </p>
                        <p className="text-xs font-semibold text-gray-500">
                          {driverVehicle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-block bg-neutral-100 border border-neutral-300 px-3 py-1 rounded-xl font-mono text-base font-black text-black tracking-wider">
                        {driverPlate}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                        Verified Vehicle
                      </p>
                    </div>
                  </div>

                  {/* MESSAGE INPUT */}
                  <form onSubmit={handleSendMessage} className="relative">
                    <input
                      value={driverMessage}
                      onChange={(e) => setDriverMessage(e.target.value)}
                      placeholder="Send a pickup note to captain..."
                      className="w-full bg-gray-100 rounded-2xl px-4 py-2.5 pr-10 text-xs font-semibold text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1.5 h-7 w-7 rounded-xl bg-black text-white flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* ACTION BUTTONS */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100">
                    <button
                      onClick={() => setSentMessageToast('Safety: Driver background verified.')}
                      className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center text-blue-600">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">Safety</span>
                    </button>

                    <button
                      onClick={() => setSentMessageToast('Live trip link copied to clipboard.')}
                      className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center text-blue-600">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">Share Trip</span>
                    </button>

                    <button
                      onClick={() => setSentMessageToast(`Connecting direct call with Captain ${driverName}...`)}
                      className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center text-blue-600">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">Call</span>
                    </button>
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={handleCancelRide}
                  className="w-full py-3 rounded-2xl border border-gray-200 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  Cancel Ride
                </button>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                5. PANEL: ACTIVE RIDE NAVIGATION
            ──────────────────────────────────────────────────────── */}
            {panel === 'activeRide' && currentRide && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      Trip in Progress
                    </span>
                    <h2 className="text-lg font-black text-black mt-1">
                      En route to destination
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400">Total Fare</p>
                    <p className="text-lg font-black text-black">
                      Rs. {Number(currentRide.fare || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Route Stat Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-black text-white text-center shadow-md">
                    <p className="text-[10px] font-bold text-gray-300">Fastest</p>
                    <p className="text-xs font-black mt-0.5">5.2 km</p>
                    <p className="text-xs font-bold text-emerald-400">11 min</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 text-gray-800 text-center border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400">Via Ring</p>
                    <p className="text-xs font-bold mt-0.5">7.8 km</p>
                    <p className="text-xs font-semibold text-gray-500">16 min</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 text-gray-800 text-center border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400">Express</p>
                    <p className="text-xs font-bold mt-0.5">9.0 km</p>
                    <p className="text-xs font-semibold text-gray-500">18 min</p>
                  </div>
                </div>

                {/* Active Captain Summary */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                      {driverName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black">{driverName}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{driverPlate}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSentMessageToast('Calling driver...')}
                    className="h-9 w-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                6. PANEL: TRIP COMPLETED & RATING
            ──────────────────────────────────────────────────────── */}
            {panel === 'completed' && currentRide && (
              <div className="py-2 text-center space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-black">
                    You have arrived!
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Trip completed smoothly.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-neutral-900 text-white shadow-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Final Fare
                  </p>
                  <h2 className="text-3xl font-black mt-1">
                    Rs. {Number(currentRide.fare || 0).toLocaleString()}
                  </h2>
                  <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                    Payment via {paymentMethod.toUpperCase()}
                  </p>
                </div>

                {/* Rating Input */}
                <div className="p-4 rounded-3xl border border-gray-100 bg-gray-50 space-y-3">
                  <p className="text-xs font-extrabold text-black">
                    Rate Captain {driverName}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatingValue(star)}
                        className="p-1 transition hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= ratingValue
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                            }`}
                        />
                      </button>
                    ))}
                  </div>

                  <input
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Leave feedback for captain..."
                    className="w-full bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-black placeholder:text-gray-400 outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      disabled={loading || ratingSubmitted}
                      onClick={handleSubmitRating}
                      className="py-3.5 rounded-2xl bg-black text-white text-xs font-bold shadow-md hover:bg-neutral-800 transition disabled:opacity-50 cursor-pointer"
                    >
                      {ratingSubmitted ? 'Saved!' : 'Submit Review'}
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/payment/${currentRide._id}/${currentRide.fare}`
                        )
                      }
                      className="py-3.5 rounded-2xl border border-gray-300 bg-white text-black text-xs font-bold hover:bg-gray-100 transition cursor-pointer"
                    >
                      Receipt & Pay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                7. PANEL: TRIP HISTORY
            ──────────────────────────────────────────────────────── */}
            {panel === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-black">Your Past Trips</h2>
                  <button
                    onClick={() => setPanel('search')}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {historyLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-black" />
                    <p className="text-xs font-bold text-gray-500 mt-2">
                      Loading trip records...
                    </p>
                  </div>
                ) : rides.length === 0 ? (
                  <div className="py-10 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl p-4">
                    No previous trips found in your account.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {rides.map((r) => (
                      <div
                        key={r._id}
                        className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-2 hover:border-gray-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${r.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                          >
                            {r.status}
                          </span>
                          <span className="text-sm font-black text-black">
                            Rs. {Number(r.fare || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-black truncate">
                          <span className="text-gray-400 font-normal">To: </span>
                          {r.destination?.address || 'Destination'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(r.createdAt).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                8. PANEL: USER PROFILE
            ──────────────────────────────────────────────────────── */}
            {panel === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-black">Rider Profile</h2>
                  <button
                    onClick={() => setPanel('search')}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 rounded-3xl bg-neutral-900 text-white space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl">
                      {userInitial}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base">
                        {user?.fullname?.firstname || 'Rider'}{' '}
                        {user?.fullname?.lastname || ''}
                      </h3>
                      <p className="text-xs text-gray-400">{user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-gray-400 font-bold text-[10px] uppercase">Rider Rating</p>
                    <p className="font-black text-base text-black mt-1 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      5.0
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-gray-400 font-bold text-[10px] uppercase">Account Status</p>
                    <p className="font-black text-base text-emerald-600 mt-1">Verified</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SIDE DRAWER FOR USER PROFILE & NAVIGATION */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onOpenTrips={() => {
          fetchRideHistory();
          setPanel('history');
        }}
        onOpenProfile={() => setPanel('profile')}
      />
    </div>
  );
};

export default Home;
