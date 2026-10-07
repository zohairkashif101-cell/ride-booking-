import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Briefcase, Settings, LogOut, X, Star, ShieldCheck } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

/**
 * SideDrawer component slides in from the left when the navigation button is clicked.
 * Provides user profile information, quick links, Trip History trigger, and Logout.
 */
const SideDrawer = ({ isOpen, onClose, user, onOpenTrips, onOpenProfile }) => {
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Extract display name and initial
  const firstName =
    user?.fullname?.firstname ||
    (user?.name ? user.name.split(' ')[0] : '') ||
    user?.firstname ||
    'Rider';

  const fullName = user?.fullname
    ? `${user.fullname.firstname || ''} ${user.fullname.lastname || ''}`.trim()
    : user?.name || firstName;

  const initial = firstName.charAt(0).toUpperCase() || 'R';

  const menuItems = [
    {
      id: 'trips',
      label: 'Your Trips',
      icon: Clock,
      badge: 'History',
      action: () => {
        onClose();
        if (onOpenTrips) onOpenTrips();
      },
    },
    {
      id: 'profile',
      label: 'Rider Profile',
      icon: User,
      action: () => {
        onClose();
        if (onOpenProfile) onOpenProfile();
      },
    },
    {
      id: 'wallet',
      label: 'Payment & Wallet',
      icon: Briefcase,
      action: () => {
        onClose();
      },
    },
    {
      id: 'settings',
      label: 'Settings & Safety',
      icon: Settings,
      action: () => {
        onClose();
      },
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      isLogout: true,
      action: () => {
        onClose();
        navigate('/user/logout');
      },
    },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer Panel */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 bottom-0 left-0 w-[320px] max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation drawer"
        aria-hidden={!isOpen}
        role="dialog"
      >
        {/* Top Section */}
        <div className="p-6 overflow-y-auto">
          {/* Header Row: Brand Logo + Close button */}
          <div className="flex items-center justify-between mb-6 pb-2">
            <BrandLogo showSubtitle textClassName="text-lg" />
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition focus:outline-none cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Header Card */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-neutral-900 text-white mb-6 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center text-lg font-black shrink-0 shadow-sm">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-extrabold text-white truncate">{fullName}</h2>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'rider@velox.com'}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400 bg-white/10 px-2 py-0.5 rounded-full">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  5.0
                </span>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className={`flex items-center justify-between w-full min-h-[48px] px-3.5 py-3 rounded-2xl text-left transition-all font-bold text-xs sm:text-sm cursor-pointer ${
                    item.isLogout
                      ? 'text-red-600 hover:bg-red-50 active:bg-red-100 mt-4 border-t border-gray-100 pt-4'
                      : 'text-neutral-800 hover:bg-gray-100 active:bg-gray-200'
                  } focus:outline-none`}
                  aria-label={item.label}
                >
                  <div className="flex items-center gap-3.5">
                    <IconComp className={`w-4 h-4 shrink-0 ${item.isLogout ? 'text-red-500' : 'text-gray-700'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-gray-100 text-xs text-gray-500 bg-gray-50/50">
          <p className="font-bold text-black">VELOX Mobility Platform</p>
          <p className="mt-0.5 text-[11px]">Next-Gen Smart Urban Transport</p>
        </div>
      </aside>
    </>
  );
};

export default SideDrawer;
