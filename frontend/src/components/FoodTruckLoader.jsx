import React from 'react'
import './FoodTruckLoader.css'

/**
 * FoodTruckLoader: A delightful, dynamic loading animation (NO boring spinner/symbol).
 * Features an animated driving food truck, spinning wheels, road motion,
 * exhaust steam puffs, floating food aromas, and glowing progress bar.
 */
export default function FoodTruckLoader({
  message = 'Rolling in the flavors…',
  subtext = 'Hold tight, getting everything fresh for you',
  fullPage = false,
  compact = false,
}) {
  return (
    <div
      className={`ftl-container ${fullPage ? 'is-fullpage' : ''} ${compact ? 'is-compact' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="ftl-scene">
        {/* Floating aroma/food items */}
        <span className="ftl-flavor-float ftl-flavor-1" aria-hidden="true">🍔</span>
        <span className="ftl-flavor-float ftl-flavor-2" aria-hidden="true">🍕</span>
        <span className="ftl-flavor-float ftl-flavor-3" aria-hidden="true">🌮</span>

        {/* Speed lines behind the truck */}
        <div className="ftl-speed-lines" aria-hidden="true">
          <div className="ftl-speed-line" />
          <div className="ftl-speed-line" />
          <div className="ftl-speed-line" />
        </div>

        {/* Animated truck rig */}
        <div className="ftl-truck-rig">
          <svg
            className="ftl-svg"
            viewBox="0 0 170 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Smoke puffs from exhaust pipe */}
            <g className="ftl-smoke">
              <circle cx="12" cy="72" r="4" fill="#cbd5e1" />
              <circle cx="8" cy="68" r="5" fill="#e2e8f0" />
              <circle cx="3" cy="63" r="6" fill="#f1f5f9" />
            </g>

            {/* Exhaust pipe */}
            <path d="M16 76 L22 76" stroke="#475569" strokeWidth="4" strokeLinecap="round" />

            {/* Truck shadow */}
            <ellipse cx="85" cy="85" rx="65" ry="5" fill="rgba(0,0,0,0.12)" />

            {/* Truck Main Body (Kitchen Box) */}
            <rect x="22" y="24" width="88" height="52" rx="7" fill="#ea580c" />

            {/* Cab Section */}
            <path
              d="M110 38 L134 38 Q144 38 147 48 L152 64 Q154 70 148 76 L110 76 Z"
              fill="#c2410c"
            />

            {/* Windshield */}
            <path
              d="M115 42 L133 42 Q139 42 142 49 L145 58 L115 58 Z"
              fill="#bae6fd"
            />
            {/* Windshield glare */}
            <path d="M120 44 L130 44 L126 56 L118 56 Z" fill="rgba(255,255,255,0.6)" />

            {/* Cab Door Line */}
            <line x1="126" y1="58" x2="126" y2="75" stroke="#9a3412" strokeWidth="1.5" />

            {/* Headlight */}
            <rect x="151" y="65" width="4" height="6" rx="2" fill="#fef08a" />
            {/* Headlight beam */}
            <path d="M155 65 L170 60 L170 76 L155 71 Z" fill="url(#headlight-glow)" opacity="0.45" />

            {/* Serving Window Hatch */}
            <rect x="34" y="36" width="56" height="30" rx="4" fill="#1e293b" />
            {/* Warm kitchen glow inside window */}
            <rect x="36" y="38" width="52" height="26" rx="3" fill="#fed7aa" />

            {/* Chef silhouette inside */}
            <circle cx="54" cy="48" r="5" fill="#ea580c" />
            <path d="M47 53 Q54 48 61 53 L61 64 L47 64 Z" fill="#ea580c" />
            {/* Mini Chef Hat */}
            <ellipse cx="54" cy="43" rx="4" ry="2" fill="#ffffff" />
            <path d="M51 43 C51 39 57 39 57 43 Z" fill="#ffffff" />

            {/* Service Counter & Cups */}
            <rect x="32" y="65" width="60" height="3.5" rx="1.5" fill="#f8fafc" />
            <rect x="74" y="58" width="5" height="7" rx="1" fill="#f97316" />
            <rect x="81" y="60" width="6" height="5" rx="1" fill="#fbbf24" />

            {/* Awning (Striped Roof over window) */}
            <g>
              <path d="M30 35 L94 35 L90 28 L34 28 Z" fill="#f97316" />
              {/* Awning stripes */}
              <path d="M30 35 L40 35 L38 28 L34 28 Z" fill="#ffffff" />
              <path d="M48 35 L58 35 L56 28 L50 28 Z" fill="#ffffff" />
              <path d="M66 35 L76 35 L74 28 L68 28 Z" fill="#ffffff" />
              <path d="M84 35 L94 35 L90 28 L86 28 Z" fill="#ffffff" />
              {/* Awning bottom scallops */}
              <circle cx="35" cy="35" r="2.5" fill="#f97316" />
              <circle cx="45" cy="35" r="2.5" fill="#ffffff" />
              <circle cx="55" cy="35" r="2.5" fill="#f97316" />
              <circle cx="65" cy="35" r="2.5" fill="#ffffff" />
              <circle cx="75" cy="35" r="2.5" fill="#f97316" />
              <circle cx="85" cy="35" r="2.5" fill="#ffffff" />
            </g>

            {/* Wheel Arch Cutouts */}
            <path d="M40 76 A 14 14 0 0 1 68 76 Z" fill="#0f172a" />
            <path d="M118 76 A 14 14 0 0 1 146 76 Z" fill="#0f172a" />

            {/* Rear Wheel (Spinning) */}
            <g className="ftl-wheel-rotate" style={{ transformOrigin: '54px 76px' }}>
              <circle cx="54" cy="76" r="11" fill="#1e293b" />
              <circle cx="54" cy="76" r="6.5" fill="#e2e8f0" />
              <circle cx="54" cy="76" r="3" fill="#ea580c" />
              {/* Wheel Spokes for spin effect */}
              <line x1="54" y1="70" x2="54" y2="82" stroke="#64748b" strokeWidth="1.5" />
              <line x1="48" y1="76" x2="60" y2="76" stroke="#64748b" strokeWidth="1.5" />
            </g>

            {/* Front Wheel (Spinning) */}
            <g className="ftl-wheel-rotate" style={{ transformOrigin: '132px 76px' }}>
              <circle cx="132" cy="76" r="11" fill="#1e293b" />
              <circle cx="132" cy="76" r="6.5" fill="#e2e8f0" />
              <circle cx="132" cy="76" r="3" fill="#ea580c" />
              {/* Wheel Spokes for spin effect */}
              <line x1="132" y1="70" x2="132" y2="82" stroke="#64748b" strokeWidth="1.5" />
              <line x1="126" y1="76" x2="138" y2="76" stroke="#64748b" strokeWidth="1.5" />
            </g>

            {/* Gradient definition for headlight */}
            <defs>
              <linearGradient id="headlight-glow" x1="155" y1="68" x2="170" y2="68" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="1" stopColor="#fef08a" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Road Track underneath with sliding dashed lines */}
        <div className="ftl-road-track" aria-hidden="true">
          <div className="ftl-road-lines" />
        </div>
      </div>

      {/* Text & Shimmer Bar */}
      <div className="ftl-text-wrap">
        <h4 className="ftl-title">{message}</h4>
        {subtext && <p className="ftl-sub">{subtext}</p>}
        <div className="ftl-progress-track" aria-hidden="true">
          <div className="ftl-progress-bar" />
        </div>
      </div>
    </div>
  )
}
