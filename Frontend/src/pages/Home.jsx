import { useContext, useState, useMemo } from 'react';
import { Menu, LocateFixed } from 'lucide-react';
import { UserDataContext } from '../context/UserContext';
import MapView from '../components/home/MapView';
import BottomSheet from '../components/home/BottomSheet';
import SideDrawer from '../components/home/SideDrawer';
import { useGeolocation } from '../hooks/useGeolocation';
import { getNearbyCars } from '../data/homeData';

/**
 * Uber Rider Home — redesigned
 *
 * Layout:
 *  • Full-screen OpenStreetMap (free, no API key) via react-leaflet
 *  • Live GPS tracking with watchPosition (blue dot follows the user)
 *  • Floating 48px Menu button (top-left) → SideDrawer
 *  • Floating 48px Locate button (top-right) → snaps map back to user
 *  • BottomSheet with drag handle, greeting, TripCard, SavedPlaces,
 *    Recent / Suggestions list, and "Search Rides" CTA
 */
const Home = () => {
  const { user } = useContext(UserDataContext);

  /* ── State ── */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [destination, setDestination] = useState(null);
  const [notice, setNotice] = useState(null);

  /* ── Live geolocation + reverse geocode ── */
  const {
    coords,
    accuracy,
    address: pickupAddress,
    setAddress: setPickupAddress,
    loading: isLocating,
    error: locationError,
    followUser,
    setFollowUser,
    getCurrentLocation,
  } = useGeolocation();

  /* ── Demo nearby cars (shift around user position) ── */
  const nearbyCars = useMemo(() => getNearbyCars(coords.lat, coords.lng), [coords.lat, coords.lng]);

  /* ── Search Rides handler ── */
  const handleSearchRides = ({ pickup, destination: dest }) => {
    console.log('[Home] Search Rides →', {
      pickup: pickup?.address || pickupAddress,
      pickupCoords: coords,
      destination: dest,
    });
    // TODO: navigate to /ride-options once that screen exists
    setNotice('Looking for nearby captains…');
    setTimeout(() => setNotice(null), 4000);
  };

  /* ── Locate-me button handler (re-centers + re-geocodes) ── */
  const handleLocate = () => {
    setFollowUser(true);
    getCurrentLocation();
  };

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── 1. Full-screen map ── */}
      <MapView
        userCoords={coords}
        destinationCoords={destination}
        nearbyCars={nearbyCars}
        followUser={followUser}
        accuracy={accuracy}
      />

      {/* ── 2. Floating top-bar buttons ── */}
      <div className="fixed top-5 left-5 right-5 z-20 flex justify-between pointer-events-none">
        {/* Menu button (top-left) */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          style={{ boxShadow: '0 4px 14px rgba(0,0,0,.18)' }}
          className="pointer-events-auto w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-black" />
        </button>

        {/* Locate-me button (top-right) */}
        <button
          type="button"
          onClick={handleLocate}
          style={{ boxShadow: '0 4px 14px rgba(0,0,0,.18)' }}
          className={`pointer-events-auto w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
            followUser ? 'ring-2 ring-[#276EF1]' : ''
          }`}
          aria-label="Centre map on my location"
          title="Centre on my location"
        >
          {isLocating ? (
            <svg className="w-5 h-5 animate-spin text-[#276EF1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
            </svg>
          ) : (
            <LocateFixed
              className={`w-5 h-5 transition-colors ${followUser ? 'text-[#276EF1]' : 'text-black'}`}
            />
          )}
        </button>
      </div>

      {/* ── 3. Toast notice (after Search Rides) ── */}
      {notice && (
        <div
          role="status"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,.35)' }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-30 bg-black text-white text-sm font-semibold px-5 py-3 rounded-2xl flex items-center gap-3 whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {notice}
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="ml-2 text-white/60 hover:text-white text-base"
            aria-label="Dismiss"
          >✕</button>
        </div>
      )}

      {/* ── 4. Bottom sheet ── */}
      <BottomSheet
        user={user}
        pickupAddress={pickupAddress}
        onPickupAddressChange={setPickupAddress}
        destination={destination}
        onSelectDestination={(dest) => {
          setDestination(dest);
          setFollowUser(false); // stop following so map shows full route
        }}
        onLocateUser={handleLocate}
        isLocatingUser={isLocating}
        locationError={locationError}
        onSearchRides={handleSearchRides}
      />

      {/* ── 5. Side drawer ── */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
      />
    </main>
  );
};

export default Home;
