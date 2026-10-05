// Default fallback coordinates (Karachi, Pakistan as per specification)
export const DEFAULT_COORDS = {
  lat: 24.8607,
  lng: 67.0011,
  address: 'Karachi, Pakistan',
};

// Generate 4-5 demo car markers positioned around a center coordinate
export const getNearbyCars = (centerLat = DEFAULT_COORDS.lat, centerLng = DEFAULT_COORDS.lng) => [
  {
    id: 'car-1',
    lat: centerLat + 0.0032,
    lng: centerLng + 0.0028,
    heading: 45,
  },
  {
    id: 'car-2',
    lat: centerLat - 0.0026,
    lng: centerLng + 0.0035,
    heading: 130,
  },
  {
    id: 'car-3',
    lat: centerLat + 0.0018,
    lng: centerLng - 0.0034,
    heading: 280,
  },
  {
    id: 'car-4',
    lat: centerLat - 0.0035,
    lng: centerLng - 0.0022,
    heading: 210,
  },
  {
    id: 'car-5',
    lat: centerLat + 0.0041,
    lng: centerLng - 0.0011,
    heading: 15,
  },
];

// Initial Saved Places (Home and Work)
export const initialSavedPlaces = [
  {
    id: 'home',
    type: 'Home',
    title: 'Home',
    address: '', // empty by default -> displays "Add"
    lat: null,
    lng: null,
  },
  {
    id: 'work',
    type: 'Work',
    title: 'Work',
    address: '', // empty by default -> displays "Add"
    lat: null,
    lng: null,
  },
];

// Initial Recent Places (3 realistic destinations with coordinates)
export const initialRecentPlaces = [
  {
    id: 'recent-1',
    title: 'Dolmen Mall Clifton',
    address: 'Marine Drive, Block 4 Clifton, Karachi',
    lat: 24.8026,
    lng: 67.0287,
  },
  {
    id: 'recent-2',
    title: 'Jinnah International Airport',
    address: 'Airport Road, Faisal Cantonment, Karachi',
    lat: 24.9073,
    lng: 67.1610,
  },
  {
    id: 'recent-3',
    title: 'Lucky One Mall',
    address: 'Rashid Minhas Rd, Federal B Area, Karachi',
    lat: 24.9422,
    lng: 67.0787,
  },
];

// Side drawer navigation options
export const drawerMenuItems = [
  { id: 'profile', label: 'Profile', icon: 'User', path: '#' },
  { id: 'trips', label: 'Your trips', icon: 'Clock', path: '#' },
  { id: 'wallet', label: 'Wallet', icon: 'Briefcase', path: '#' },
  { id: 'settings', label: 'Settings', icon: 'Menu', path: '#' },
  { id: 'logout', label: 'Logout', icon: 'X', path: '/user/logout' },
];
