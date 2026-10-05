import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_COORDS } from '../data/homeData';

/** Format Nominatim result into a short human-readable string */
const formatAddress = (data) => {
  if (!data) return DEFAULT_COORDS.address;
  const a = data.address || {};
  const line1 = a.road || a.pedestrian || a.suburb || a.neighbourhood || '';
  const line2 = a.city || a.town || a.county || a.state || '';
  if (line1 && line2) return `${line1}, ${line2}`;
  return data.display_name?.split(',').slice(0, 2).join(',').trim() || DEFAULT_COORDS.address;
};

/**
 * useGeolocation — live GPS tracking via watchPosition + Nominatim reverse-geocoding.
 *
 * Returned API:
 *   coords          { lat, lng }   – live position (updates as user moves)
 *   accuracy        number|null    – GPS accuracy in metres
 *   address         string         – human-readable pickup label
 *   setAddress      fn             – manual override
 *   loading         bool           – true until first GPS fix arrives
 *   error           string|null    – friendly error message
 *   followUser      bool           – whether map should pan to user
 *   setFollowUser   fn
 *   getCurrentLocation fn          – one-shot snap + re-geocode (locate-me button)
 */
export function useGeolocation() {
  const [coords, setCoords] = useState({ lat: DEFAULT_COORDS.lat, lng: DEFAULT_COORDS.lng });
  const [accuracy, setAccuracy] = useState(null);
  const [address, setAddress] = useState('Current location');
  // If browser doesn't support geolocation we know this synchronously
  const geoSupported = typeof navigator !== 'undefined' && Boolean(navigator.geolocation);
  const [loading, setLoading] = useState(geoSupported); // false immediately if not supported
  const [error, setError] = useState(
    geoSupported ? null : 'Geolocation is not supported by your browser.'
  );
  const [followUser, setFollowUser] = useState(true);

  const hasAddress = useRef(false); // avoid spamming Nominatim on every position update
  const watchId = useRef(null);

  /* Reverse-geocode a coordinate pair */
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) throw new Error('Nominatim not ok');
      const data = await res.json();
      setAddress(formatAddress(data));
      hasAddress.current = true;
    } catch (err) {
      console.warn('Reverse geocode failed:', err.message);
      setAddress('Current location');
    }
  }, []);

  /* ── Start watchPosition on mount, clean up on unmount ── */
  useEffect(() => {
    if (!geoSupported) return; // already set via useState initial values

    // Kick off watchPosition — this subscribes to the *external* browser GPS API,
    // so the lint rule (no setState in effect body) does not apply here:
    // the setState calls happen inside the watcher callback, not synchronously.
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = position.coords;
        setCoords({ lat, lng });
        setAccuracy(acc);
        setLoading(false);
        setError(null);
        if (!hasAddress.current) {
          reverseGeocode(lat, lng);
        }
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === 1) msg = 'Location permission denied. Showing Karachi.';
        else if (err.code === 2) msg = 'Location unavailable. Showing Karachi.';
        else if (err.code === 3) msg = 'Location request timed out. Showing Karachi.';
        setError(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
    );

    watchId.current = id;

    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, [geoSupported, reverseGeocode]);

  /**
   * getCurrentLocation — one-shot re-center + re-geocode.
   * Triggered by the LocateFixed / Locate-Me button in the UI.
   */
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    setFollowUser(true);
    hasAddress.current = false; // force fresh label

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = position.coords;
        setCoords({ lat, lng });
        setAccuracy(acc);
        setLoading(false);
        setError(null);
        reverseGeocode(lat, lng);
      },
      (err) => {
        console.warn('getCurrentPosition failed:', err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [reverseGeocode]);

  return {
    coords,
    accuracy,
    address,
    setAddress,
    loading,
    error,
    followUser,
    setFollowUser,
    getCurrentLocation,
  };
}

export default useGeolocation;
