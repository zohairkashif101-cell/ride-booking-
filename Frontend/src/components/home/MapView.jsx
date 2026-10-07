import { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_COORDS } from '../../data/homeData';

/* ─────────────────────────────────────────────────────────────
   ICONS — all plain DivIcons (no default Leaflet marker image)
──────────────────────────────────────────────────────────── */

/** Pulsing blue dot – user's live position */
const userLocationIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
      <span class="uber-pulse-ring"></span>
      <span style="position:relative;width:14px;height:14px;border-radius:50%;background:#276EF1;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(39,110,241,.5);"></span>
    </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/** Black square pin – chosen destination */
const destinationIcon = L.divIcon({
  className: '',
  html: `
    <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:#000;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,.45);border:2px solid #fff;">
      <div style="width:9px;height:9px;background:#fff;border-radius:2px;"></div>
    </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/** Black circular car marker – nearby driver */
const createCarIcon = (heading = 0) =>
  L.divIcon({
    className: '',
    html: `
      <div style="transform:rotate(${heading}deg);width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:#111;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,.4);border:2px solid #fff;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
        </svg>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

/* ─────────────────────────────────────────────────────────────
   MapViewController — inner component: pans / fits route
──────────────────────────────────────────────────────────── */
const MapViewController = ({ center, routeCoords, followUser }) => {
  const map = useMap();
  const didInit = useRef(false);

  /* Fix grey tiles on first mount */
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [map]);

  /* When route is drawn → fit its bounds */
  useEffect(() => {
    if (routeCoords && routeCoords.length > 1) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, {
        paddingTopLeft: [60, 60],
        paddingBottomRight: [60, window.innerWidth < 768 ? 380 : 180],
        maxZoom: 16,
        animate: true,
      });
      didInit.current = true;
    }
  }, [map, routeCoords]);

  /* Smooth follow – only when no route is shown and followUser mode is on */
  useEffect(() => {
    if (routeCoords && routeCoords.length > 1) return; // route takes priority
    if (!center?.lat || !center?.lng) return;
    if (!didInit.current) {
      map.setView([center.lat, center.lng], 15, { animate: false });
      didInit.current = true;
    } else if (followUser) {
      map.panTo([center.lat, center.lng], { animate: true, duration: 0.8 });
    }
  }, [map, center, followUser, routeCoords]);

  return null;
};

/* ─────────────────────────────────────────────────────────────
   MapView (main export)
──────────────────────────────────────────────────────────── */
const MapView = ({
  userCoords = DEFAULT_COORDS,
  destinationCoords = null,
  nearbyCars = [],
  followUser = true,          // live-tracking follow mode
  accuracy = null,            // GPS accuracy radius in metres
}) => {
  const [routeCoords, setRouteCoords] = useState([]);

  /* Fetch OSRM route when destination changes */
  useEffect(() => {
    if (!destinationCoords?.lat || !destinationCoords?.lng) return;

    let cancelled = false;
    const { lat: sLat, lng: sLng } = userCoords;
    const { lat: eLat, lng: eLng } = destinationCoords;

    (async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM failed');
        const data = await res.json();
        if (!cancelled && data.routes?.length) {
          setRouteCoords(data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]));
        }
      } catch {
        if (!cancelled) setRouteCoords([[sLat, sLng], [eLat, eLng]]);
      }
    })();

    return () => { cancelled = true; };
  }, [userCoords, destinationCoords]);

  /* Clear route when destination removed */
  const activeRoute = destinationCoords ? routeCoords : [];

  /* Memoize car icons */
  const carMarkers = useMemo(
    () => nearbyCars.map(car => ({ ...car, icon: createCarIcon(car.heading || 0) })),
    [nearbyCars]
  );

  const mapCenter = [userCoords.lat ?? DEFAULT_COORDS.lat, userCoords.lng ?? DEFAULT_COORDS.lng];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      {/* Global styles for pulse ring and Leaflet reset */}
      <style>{`
        @keyframes uberPulse {
          0%   { transform: scale(0.7); opacity: 0.9; }
          70%  { transform: scale(2.4); opacity: 0;   }
          100% { transform: scale(0.7); opacity: 0;   }
        }
        .uber-pulse-ring {
          position: absolute;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: rgba(39,110,241,0.35);
          animation: uberPulse 2s ease-out infinite;
        }
        .leaflet-container { width:100%; height:100%; background:#e8e0d8; }
        /* hide default Leaflet attribution (logo still required by OSM ToS — keep text) */
        .leaflet-control-attribution { font-size: 10px !important; opacity:0.6; }
      `}</style>

      <MapContainer
        center={mapCenter}
        zoom={15}
        zoomControl={false}
        className="w-full h-full"
        style={{ height: '100vh', width: '100vw' }}
      >
        {/*
          ── FREE Map Tiles ──────────────────────────────────────────
          CartoDB "light_all" shows "API KEY REQUIRED" without an account.
          OpenStreetMap standard tiles are completely free & require no key.
          Voyager (Stamen / Carto) free variant also works without a key:
        */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
          subdomains="abc"
        />

        <MapViewController
          center={userCoords}
          routeCoords={activeRoute}
          followUser={followUser}
        />

        {/* ── Live user dot + accuracy ring ── */}
        {userCoords?.lat && userCoords?.lng && (
          <>
            {accuracy && accuracy < 500 && (
              <Circle
                center={[userCoords.lat, userCoords.lng]}
                radius={accuracy}
                pathOptions={{ color: '#276EF1', fillColor: '#276EF1', fillOpacity: 0.08, weight: 1 }}
              />
            )}
            <Marker
              position={[userCoords.lat, userCoords.lng]}
              icon={userLocationIcon}
              zIndexOffset={1000}
            />
          </>
        )}

        {/* ── Nearby demo car markers ── */}
        {carMarkers.map(car => (
          <Marker key={car.id} position={[car.lat, car.lng]} icon={car.icon} />
        ))}

        {/* ── Destination pin ── */}
        {destinationCoords?.lat && destinationCoords?.lng && (
          <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon} />
        )}

        {/* ── OSRM route polyline (solid black) ── */}
        {activeRoute.length > 1 && (
          <>
            {/* White halo beneath */}
            <Polyline
              positions={activeRoute}
              pathOptions={{ color: '#fff', weight: 8, opacity: 0.6, lineCap: 'round', lineJoin: 'round' }}
            />
            {/* Black route on top */}
            <Polyline
              positions={activeRoute}
              pathOptions={{ color: '#000', weight: 4.5, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
