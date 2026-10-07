import React from 'react';

/**
 * Uber Go Vehicle Graphic (Compact White Hatchback)
 */
export const UberGoIcon = ({ className = 'w-16 h-12' }) => (
  <svg
    viewBox="0 0 120 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Shadow */}
    <ellipse cx="60" cy="62" rx="48" ry="6" fill="#D1D5DB" opacity="0.6" />
    
    {/* Body */}
    <path
      d="M18 48C18 48 16 38 24 33C32 28 42 20 54 18C66 16 86 16 94 24C102 32 106 38 106 48L18 48Z"
      fill="#F3F4F6"
      stroke="#111827"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Roof & Windshield */}
    <path
      d="M38 32L46 22H78L88 32H38Z"
      fill="#1F2937"
      stroke="#111827"
      strokeWidth="2"
    />
    <path
      d="M48 23L42 31H60V23H48Z"
      fill="#9CA3AF"
      opacity="0.5"
    />
    <path
      d="M64 23V31H84L76 23H64Z"
      fill="#9CA3AF"
      opacity="0.5"
    />
    {/* Lower bumper */}
    <rect x="14" y="44" width="94" height="10" rx="4" fill="#E5E7EB" stroke="#111827" strokeWidth="2" />
    
    {/* Headlights */}
    <circle cx="101" cy="46" r="3" fill="#FBBF24" />
    <circle cx="19" cy="46" r="2.5" fill="#EF4444" />
    
    {/* Wheels */}
    <circle cx="34" cy="54" r="9" fill="#111827" />
    <circle cx="34" cy="54" r="4.5" fill="#9CA3AF" />
    <circle cx="86" cy="54" r="9" fill="#111827" />
    <circle cx="86" cy="54" r="4.5" fill="#9CA3AF" />
  </svg>
);

/**
 * Uber Premier Vehicle Graphic (Luxury Sedan with Sparkles)
 */
export const UberPremierIcon = ({ className = 'w-16 h-12' }) => (
  <svg
    viewBox="0 0 130 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Shadow */}
    <ellipse cx="65" cy="62" rx="54" ry="6" fill="#CBD5E1" opacity="0.6" />
    
    {/* Sleek Body */}
    <path
      d="M14 47C14 47 16 38 26 34C36 30 46 22 62 20C78 18 96 20 106 28C116 36 120 42 120 47L14 47Z"
      fill="#F8FAFC"
      stroke="#0F172A"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    
    {/* Tinted Windows */}
    <path
      d="M42 32L52 23H84L96 32H42Z"
      fill="#0F172A"
      stroke="#0F172A"
      strokeWidth="2"
    />
    <path
      d="M54 24L46 31H66V24H54Z"
      fill="#64748B"
      opacity="0.4"
    />
    <path
      d="M70 24V31H92L82 24H70Z"
      fill="#64748B"
      opacity="0.4"
    />
    
    {/* Chrome trim */}
    <path d="M24 45L110 45" stroke="#94A3B8" strokeWidth="1.5" />
    
    {/* Lower bumper */}
    <rect x="10" y="44" width="108" height="10" rx="4" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
    
    {/* Headlight & Taillight */}
    <path d="M112 44L118 47L112 50Z" fill="#38BDF8" />
    <rect x="11" y="45" width="4" height="4" rx="1" fill="#EF4444" />
    
    {/* Wheels */}
    <circle cx="32" cy="54" r="9.5" fill="#0F172A" />
    <circle cx="32" cy="54" r="5" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
    <circle cx="96" cy="54" r="9.5" fill="#0F172A" />
    <circle cx="96" cy="54" r="5" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />

    {/* Sparkle badge */}
    <path
      d="M112 16L114 21L119 23L114 25L112 30L110 25L105 23L110 21L112 16Z"
      fill="#F59E0B"
    />
  </svg>
);

/**
 * Uber Auto Vehicle Graphic (Green & Yellow Rickshaw)
 */
export const UberAutoIcon = ({ className = 'w-16 h-12' }) => (
  <svg
    viewBox="0 0 110 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Shadow */}
    <ellipse cx="55" cy="62" rx="42" ry="5.5" fill="#CBD5E1" opacity="0.6" />
    
    {/* Yellow Canopy Roof */}
    <path
      d="M26 22C26 17 34 14 55 14C76 14 84 17 84 22L84 32H26V22Z"
      fill="#EAB308"
      stroke="#111827"
      strokeWidth="2.5"
    />
    
    {/* Green Body Base */}
    <path
      d="M24 32H86L88 48C88 51 86 54 82 54H28C24 54 22 51 22 48L24 32Z"
      fill="#16A34A"
      stroke="#111827"
      strokeWidth="2.5"
    />
    
    {/* Windshield & Cabin opening */}
    <path
      d="M70 24L80 32H64L62 24H70Z"
      fill="#38BDF8"
      opacity="0.4"
      stroke="#111827"
      strokeWidth="1.5"
    />
    <rect x="36" y="24" width="22" height="16" rx="2" fill="#FEF08A" stroke="#111827" strokeWidth="1.5" />

    {/* Headlamp */}
    <circle cx="86" cy="40" r="3.5" fill="#FACC15" stroke="#111827" strokeWidth="1.5" />
    
    {/* 3 Wheels: 1 front, 2 rear */}
    <circle cx="34" cy="56" r="8" fill="#111827" />
    <circle cx="34" cy="56" r="3.5" fill="#9CA3AF" />
    
    <circle cx="76" cy="56" r="8" fill="#111827" />
    <circle cx="76" cy="56" r="3.5" fill="#9CA3AF" />
  </svg>
);

/**
 * Go Rentals Vehicle Graphic (Car Key Fob)
 */
export const GoRentalsIcon = ({ className = 'w-16 h-12' }) => (
  <svg
    viewBox="0 0 100 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Shadow */}
    <ellipse cx="50" cy="60" rx="30" ry="5" fill="#CBD5E1" opacity="0.5" />
    
    {/* Key Fob Body */}
    <rect
      x="32"
      y="18"
      width="36"
      height="44"
      rx="12"
      fill="#1E293B"
      stroke="#0F172A"
      strokeWidth="2.5"
    />
    
    {/* Metal Loop */}
    <path
      d="M44 18V12C44 9.5 46.5 7 50 7C53.5 7 56 9.5 56 12V18"
      stroke="#94A3B8"
      strokeWidth="3"
      strokeLinecap="round"
    />
    
    {/* Buttons on Fob */}
    <rect x="42" y="26" width="16" height="8" rx="3" fill="#334155" />
    <circle cx="50" cy="30" r="1.5" fill="#38BDF8" />

    <rect x="42" y="38" width="16" height="8" rx="3" fill="#334155" />
    <circle cx="50" cy="42" r="1.5" fill="#E2E8F0" />
    
    <rect x="42" y="50" width="16" height="5" rx="2" fill="#EF4444" opacity="0.8" />
  </svg>
);
