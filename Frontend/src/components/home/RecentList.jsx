import { Clock, MapPin } from 'lucide-react';

/**
 * RecentList displays recent trips or active autocomplete suggestions.
 * Shows 3 rows with icons, bold title, gray address, and subtle dividers.
 */
const RecentList = ({
  items = [],
  isLoading = false,
  isSearching = false,
  onSelectItem,
}) => {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col divide-y divide-[#E5E5E5] py-1" aria-busy="true" aria-label="Loading places">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center min-h-[54px] py-2.5 px-1 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-[#E5E5E5] shrink-0 mr-3" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#E5E5E5] rounded w-2/5" />
              <div className="h-3 bg-[#F3F3F3] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col divide-y divide-[#E5E5E5]" role="list">
      {items.map((item, idx) => {
        const IconComponent = isSearching ? MapPin : Clock;

        return (
          <button
            key={item.id || item.place_id || idx}
            type="button"
            onClick={() => onSelectItem && onSelectItem(item)}
            className="flex items-center w-full min-h-[54px] py-2.5 px-1 text-left hover:bg-[#F3F3F3] active:bg-[#E5E5E5] transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-black group cursor-pointer"
            aria-label={`${item.title || item.name}: ${item.address || item.display_name}`}
          >
            {/* Circular icon container */}
            <div className="w-9 h-9 rounded-full bg-[#F3F3F3] group-hover:bg-white flex items-center justify-center shrink-0 mr-3 text-black transition-colors">
              <IconComponent className="w-4 h-4 text-black" aria-hidden="true" />
            </div>

            {/* Name and Address */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-base font-bold text-black truncate leading-tight">
                {item.title || item.name}
              </p>
              <p className="text-sm text-[#6B6B6B] truncate mt-0.5">
                {item.address || item.display_name}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RecentList;
