import React from 'react';

export const BrandLogo = ({ className = 'h-8', textClassName = 'text-xl', showSubtitle = false, inverted = false }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Badge */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
        inverted ? 'bg-white text-black' : 'bg-black text-white'
      }`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          {/* Stylized route pin / mobility arrow */}
          <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 2L19 21L12 17L5 21L12 2Z" />
        </svg>
      </div>

      {/* Brand Name */}
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tight ${inverted ? 'text-white' : 'text-black'} ${textClassName}`}>
          VELOX
        </span>
        {showSubtitle && (
          <span className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 ${
            inverted ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Mobility
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
