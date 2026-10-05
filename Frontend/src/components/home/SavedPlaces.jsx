import { Home, Briefcase } from 'lucide-react';

const iconMap = {
  Home: Home,
  Work: Briefcase,
};

/**
 * SavedPlaces component renders Home and Work rows with gray circular icons.
 * Shows "Add" if an address has not yet been configured.
 */
const SavedPlaces = ({ places = [], onSelectPlace, onAddPlace }) => {
  return (
    <div className="w-full flex flex-col space-y-1">
      {places.map((place) => {
        const IconComponent = iconMap[place.type] || Home;
        const hasAddress = Boolean(place.address && place.address.trim().length > 0);

        return (
          <button
            key={place.id}
            type="button"
            onClick={() => {
              if (hasAddress && onSelectPlace) {
                onSelectPlace(place);
              } else if (onAddPlace) {
                onAddPlace(place);
              }
            }}
            className="flex items-center w-full min-h-[52px] py-2 px-1 text-left rounded-xl hover:bg-[#F3F3F3] active:bg-[#E5E5E5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
            aria-label={hasAddress ? `${place.title}: ${place.address}` : `Add ${place.title} address`}
          >
            {/* Gray circular icon container */}
            <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mr-3 text-black">
              <IconComponent className="w-5 h-5 text-black" aria-hidden="true" />
            </div>

            {/* Place Details */}
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-base font-semibold text-black leading-tight">
                {place.title}
              </p>
              <p className="text-sm text-[#6B6B6B] truncate">
                {hasAddress ? place.address : 'Add ' + place.title.toLowerCase()}
              </p>
            </div>

            {/* Right Action Badge if empty */}
            {!hasAddress && (
              <span className="text-xs font-semibold text-black bg-[#E5E5E5] px-2.5 py-1 rounded-full shrink-0">
                Add
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SavedPlaces;
