import { useState } from 'react';
import { LocateFixed, X, Loader2 } from 'lucide-react';

/**
 * TripCard: ONE container (#F3F3F3, radius 12px).
 * Left: route graphic (black dot, thin gray line, black square).
 * Right: two inputs with a thin divider.
 * Focus style: white background + 2px black border.
 */
const TripCard = ({
  pickupValue = '',
  destinationValue = '',
  onPickupChange,
  onDestinationChange,
  onLocateClick,
  onClearDestination,
  onFocusDestination,
  onFocusPickup,
  isLocating = false,
}) => {
  const [pickupFocused, setPickupFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);

  return (
    <div className="w-full bg-[#F3F3F3] rounded-[12px] p-2 sm:p-2.5 flex items-stretch">
      {/* Left: Route Graphic (black dot -> thin gray line -> black square) */}
      <div className="flex flex-col items-center justify-between py-3.5 px-2 select-none shrink-0" aria-hidden="true">
        {/* Origin: Black dot */}
        <div className="w-2 h-2 rounded-full bg-black shrink-0" />
        {/* Connecting line */}
        <div className="w-[1.5px] flex-1 my-1 bg-[#6B6B6B]" />
        {/* Destination: Black square */}
        <div className="w-2 h-2 bg-black shrink-0" />
      </div>

      {/* Right: Two inputs separated by a thin horizontal divider */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Pickup Row */}
        <div
          className={`flex items-center min-h-[46px] px-3 rounded-lg border-2 transition-colors duration-150 ${
            pickupFocused
              ? 'bg-white border-black shadow-sm'
              : 'bg-transparent border-transparent hover:bg-black/5'
          }`}
        >
          <input
            type="text"
            value={pickupValue}
            onChange={(e) => onPickupChange && onPickupChange(e.target.value)}
            onFocus={() => {
              setPickupFocused(true);
              onFocusPickup && onFocusPickup();
            }}
            onBlur={() => setPickupFocused(false)}
            placeholder="Current location"
            aria-label="Pickup location"
            className="flex-1 bg-transparent text-sm font-medium text-black placeholder-[#6B6B6B] outline-none min-w-0 truncate"
          />

          {/* LocateFixed button */}
          <button
            type="button"
            onClick={onLocateClick}
            disabled={isLocating}
            className="w-10 h-10 -mr-1 flex items-center justify-center rounded-full text-black hover:bg-[#E5E5E5] active:bg-[#CCCCCC] transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            aria-label="Locate me using GPS"
            title="Locate me"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <LocateFixed className="w-4 h-4 text-black" />
            )}
          </button>
        </div>

        {/* Thin divider */}
        <div className="h-[1px] bg-[#E5E5E5] mx-2 my-0.5" />

        {/* Destination Row */}
        <div
          className={`flex items-center min-h-[46px] px-3 rounded-lg border-2 transition-colors duration-150 ${
            destFocused
              ? 'bg-white border-black shadow-sm'
              : 'bg-transparent border-transparent hover:bg-black/5'
          }`}
        >
          <input
            type="text"
            value={destinationValue}
            onChange={(e) => onDestinationChange && onDestinationChange(e.target.value)}
            onFocus={() => {
              setDestFocused(true);
              onFocusDestination && onFocusDestination();
            }}
            onBlur={() => setDestFocused(false)}
            placeholder="Enter destination"
            aria-label="Destination location"
            className="flex-1 bg-transparent text-base font-bold text-black placeholder-[#6B6B6B] outline-none min-w-0 truncate"
          />

          {/* Clear button when destination is entered */}
          {destinationValue ? (
            <button
              type="button"
              onClick={onClearDestination}
              className="w-10 h-10 -mr-1 flex items-center justify-center rounded-full text-black hover:bg-[#E5E5E5] active:bg-[#CCCCCC] transition-colors shrink-0 cursor-pointer"
              aria-label="Clear destination"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
