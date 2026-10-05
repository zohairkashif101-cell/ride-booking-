import { useState, useRef } from 'react';
import TripCard from './TripCard';
import SavedPlaces from './SavedPlaces';
import RecentList from './RecentList';
import useDebounce from '../../hooks/useDebounce';
import { initialSavedPlaces, initialRecentPlaces } from '../../data/homeData';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Computes an appropriate greeting based on time of day
 */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/**
 * BottomSheet component matching Uber Rider interface:
 * Fixed bottom, radius 24px 24px 0 0, drag handle, collapsed/expanded states,
 * greeting, Where to? heading, TripCard, SavedPlaces, RecentList/Suggestions, and CTA.
 */
const BottomSheet = ({
  user,
  pickupAddress,
  onPickupAddressChange,
  destination,
  onSelectDestination,
  onLocateUser,
  isLocatingUser,
  locationError,
  onSearchRides,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [pickupInput, setPickupInput] = useState(pickupAddress || '');
  const [prevPickupAddress, setPrevPickupAddress] = useState(pickupAddress);

  // Sync pickup input when geolocation changes without calling setState in an effect
  if (pickupAddress !== prevPickupAddress) {
    setPrevPickupAddress(pickupAddress);
    setPickupInput(pickupAddress || '');
  }

  const [destinationInput, setDestinationInput] = useState(destination?.address || '');
  const [prevDestination, setPrevDestination] = useState(destination);

  // Sync destination input when destination prop changes
  if (destination !== prevDestination) {
    setPrevDestination(destination);
    setDestinationInput(destination?.address || destination?.title || '');
  }

  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState(initialSavedPlaces);
  const [recentPlaces] = useState(initialRecentPlaces);

  // Debounced search for destination autocomplete (400ms delay)
  const debouncedQuery = useDebounce(destinationInput, 400);

  const shouldSearch = Boolean(
    debouncedQuery &&
    debouncedQuery.trim().length >= 2 &&
    (!destination || destination.address !== debouncedQuery)
  );

  useEffect(() => {
    if (!shouldSearch) {
      return;
    }

    let active = true;

    const fetchSuggestions = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          debouncedQuery
        )}&limit=5&addressdetails=1`;
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en' },
        });

        if (!res.ok) throw new Error('Search service failed');
        const data = await res.json();

        if (active) {
          const formatted = data.map((item) => {
            const parts = item.display_name.split(',');
            return {
              id: item.place_id,
              title: parts[0]?.trim() || item.name || 'Location',
              address: parts.slice(1, 4).join(',').trim() || item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            };
          });
          setSuggestions(formatted);
          setIsSearching(false);
          setSearchError(null);
        }
      } catch (err) {
        if (active) {
          console.warn('Destination search error:', err.message);
          setSearchError('Unable to load suggestions. Check your connection.');
          setIsSearching(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      active = false;
    };
  }, [debouncedQuery, shouldSearch, destination]);

  // Extract user's first name
  const firstName =
    user?.fullname?.firstname ||
    (user?.name ? user.name.split(' ')[0] : '') ||
    user?.firstname ||
    'Rider';
  const greeting = `${getGreeting()}, ${firstName}`;

  // Handle drag gesture for toggling bottom sheet
  const touchStartY = useRef(0);
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 50) {
      setIsExpanded(false); // dragged down
    } else if (deltaY < -50) {
      setIsExpanded(true); // dragged up
    }
  };

  const handleSelectDestination = (place) => {
    const formatted = {
      title: place.title || place.name,
      address: place.address || place.title,
      lat: place.lat,
      lng: place.lng,
    };
    setDestinationInput(formatted.address);
    setSuggestions([]);
    setIsSearching(false);
    onSelectDestination(formatted);
  };

  const handleClearDestination = () => {
    setDestinationInput('');
    setSuggestions([]);
    setIsSearching(false);
    onSelectDestination(null);
  };

  const handleAddSavedPlace = (place) => {
    const newAddress = prompt(`Enter address for ${place.title}:`);
    if (newAddress && newAddress.trim()) {
      setSavedPlaces((prev) =>
        prev.map((item) =>
          item.id === place.id ? { ...item, address: newAddress.trim() } : item
        )
      );
    }
  };

  const canSearchRides = Boolean(destination && destination.lat && destination.lng);
  const activeSuggestions = shouldSearch ? suggestions : [];

  return (
    <section
      aria-label="Trip planning sheet"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.12)',
      }}
      className={`fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-[24px] max-w-2xl mx-auto transition-all duration-250 ease-out flex flex-col ${
        isExpanded ? 'max-h-[88vh] sm:max-h-[82vh]' : 'max-h-[175px]'
      }`}
    >
      {/* Drag handle button (40x4 gray pill, toggles on tap/drag) */}
      <div className="w-full pt-3 pb-1 flex justify-center">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-16 h-5 flex items-center justify-center cursor-pointer group focus:outline-none"
          aria-label={isExpanded ? 'Collapse trip details' : 'Expand trip details'}
        >
          <div className="w-10 h-1 bg-[#E5E5E5] group-hover:bg-[#6B6B6B] rounded-full transition-colors" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="px-5 pb-5 pt-1 overflow-y-auto flex-1 flex flex-col space-y-4">
        {/* Header Greeting & "Where to?" */}
        <div>
          <p className="text-sm font-semibold text-[#6B6B6B] tracking-tight">
            {greeting}
          </p>
          <h1 className="text-2xl font-bold text-black tracking-tight mt-0.5">
            Where to?
          </h1>
        </div>

        {/* Location Error Notification if any */}
        {locationError && (
          <div
            role="alert"
            className="flex items-center gap-2 p-2.5 text-xs text-black bg-[#F3F3F3] rounded-lg border border-[#E5E5E5]"
          >
            <AlertCircle className="w-4 h-4 text-[#6B6B6B] shrink-0" />
            <span className="flex-1 truncate">{locationError}</span>
          </div>
        )}

        {/* TripCard: ONE container (#F3F3F3, radius 12px) */}
        <TripCard
          pickupValue={pickupInput}
          destinationValue={destinationInput}
          onPickupChange={(val) => {
            setPickupInput(val);
            onPickupAddressChange && onPickupAddressChange(val);
          }}
          onDestinationChange={(val) => {
            setDestinationInput(val);
            if (val.trim().length >= 2) {
              setIsSearching(true);
            } else {
              setIsSearching(false);
              setSuggestions([]);
            }
            if (!val) {
              onSelectDestination(null);
            }
          }}
          onLocateClick={onLocateUser}
          onClearDestination={handleClearDestination}
          onFocusDestination={() => setIsExpanded(true)}
          onFocusPickup={() => setIsExpanded(true)}
          isLocating={isLocatingUser}
        />

        {/* Expanded View Content */}
        {isExpanded && (
          <>
            {/* Search error if autocomplete fails */}
            {searchError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                {searchError}
              </p>
            )}

            {/* If user is typing in destination, show suggestions; otherwise show SavedPlaces and RecentList */}
            {shouldSearch && (activeSuggestions.length > 0 || isSearching) ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  Suggestions
                </p>
                <RecentList
                  items={activeSuggestions}
                  isLoading={isSearching}
                  isSearching={true}
                  onSelectItem={handleSelectDestination}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Saved Places (Home & Work) */}
                <div className="space-y-1">
                  <SavedPlaces
                    places={savedPlaces}
                    onSelectPlace={handleSelectDestination}
                    onAddPlace={handleAddSavedPlace}
                  />
                </div>

                {/* Thin divider */}
                <div className="h-[1px] bg-[#E5E5E5] w-full" />

                {/* Recent Places (3 rows with clock icon) */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">
                    Recent Trips
                  </p>
                  <RecentList
                    items={recentPlaces}
                    isLoading={false}
                    isSearching={false}
                    onSelectItem={handleSelectDestination}
                  />
                </div>
              </div>
            )}

            {/* CTA Button: "Search Rides" */}
            <div className="pt-2 sticky bottom-0 bg-white">
              <button
                type="button"
                disabled={!canSearchRides}
                onClick={() => {
                  if (canSearchRides && onSearchRides) {
                    onSearchRides({
                      pickup: { address: pickupInput },
                      destination: destination,
                    });
                  }
                }}
                className={`w-full h-[52px] rounded-[12px] font-bold text-base transition-all flex items-center justify-center ${
                  canSearchRides
                    ? 'bg-black text-white hover:bg-neutral-800 active:scale-[0.99] cursor-pointer shadow-md'
                    : 'bg-[#CCCCCC] text-[#6B6B6B] cursor-not-allowed'
                }`}
                aria-label="Search Rides"
              >
                Search Rides
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BottomSheet;
