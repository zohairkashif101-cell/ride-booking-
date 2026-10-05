import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Briefcase, Settings, LogOut, X } from 'lucide-react';

/**
 * SideDrawer component slides in from the left when the floating menu button is clicked.
 * Includes user profile summary, quick links, and Logout navigating to /user/logout.
 */
const SideDrawer = ({ isOpen, onClose, user }) => {
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
  const fullName =
    user?.fullname
      ? `${user.fullname.firstname || ''} ${user.fullname.lastname || ''}`.trim()
      : user?.name || firstName;
  const initial = firstName.charAt(0).toUpperCase() || 'U';

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User, action: () => onClose() },
    { id: 'trips', label: 'Your trips', icon: Clock, action: () => onClose() },
    { id: 'wallet', label: 'Wallet', icon: Briefcase, action: () => onClose() },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => onClose() },
    {
      id: 'logout',
      label: 'Logout',
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
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer Panel */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 bottom-0 left-0 w-[300px] max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation drawer"
        aria-hidden={!isOpen}
        role="dialog"
      >
        {/* Top Section */}
        <div className="p-6">
          {/* Header Row: Close button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 rounded-full flex items-center justify-center text-black hover:bg-[#F3F3F3] active:bg-[#E5E5E5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* User Profile Header Card */}
          <div className="flex items-center gap-3.5 pb-6 border-b border-[#E5E5E5]">
            <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-black truncate">{fullName}</h2>
              <p className="text-xs text-[#6B6B6B] truncate">{user?.email || 'uber rider'}</p>
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-black bg-[#F3F3F3] w-fit px-2 py-0.5 rounded-full">
                <span>★</span>
                <span>5.0</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 flex flex-col space-y-1">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className={`flex items-center gap-4 w-full min-h-[48px] px-3 py-2 rounded-xl text-left transition-colors font-medium text-base cursor-pointer ${
                    item.isLogout
                      ? 'text-black hover:bg-neutral-100 active:bg-neutral-200 mt-4 border-t border-[#E5E5E5] pt-4'
                      : 'text-black hover:bg-[#F3F3F3] active:bg-[#E5E5E5]'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-black`}
                  aria-label={item.label}
                >
                  <IconComp className="w-5 h-5 text-black shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-[#E5E5E5] text-xs text-[#6B6B6B]">
          <p className="font-semibold text-black">Uber Clone</p>
          <p className="mt-0.5">v1.0 • Designed for Riders</p>
        </div>
      </aside>
    </>
  );
};

export default SideDrawer;
