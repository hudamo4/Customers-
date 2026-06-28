import React from 'react';

interface IramoWaxSealProps {
  className?: string;
  size?: number;
}

export default function IramoWaxSeal({ className = '', size = 110 }: IramoWaxSealProps) {
  return (
    <div 
      className={`relative select-none pointer-events-none filter drop-shadow-[0_4px_12px_rgba(202,124,128,0.35)] ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Real 3D Wax Shadow */}
          <filter id="wax-depth" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#8e4a49" floodOpacity="0.3" />
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#ffe4e6" floodOpacity="0.7" input="SourceGraphic" />
          </filter>

          {/* 3D Emboss Filter */}
          <filter id="emboss-effect">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#fff5f5" surfaceScale="2" result="light">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" in2="light" />
          </filter>

          {/* Blush Pink Wax Body Gradient */}
          <radialGradient id="wax-grad" cx="50%" cy="47%" r="50%">
            <stop offset="0%" stopColor="#fff1f2" />       {/* Center highlight */}
            <stop offset="40%" stopColor="#fecdd3" />      {/* Soft blush pink */}
            <stop offset="75%" stopColor="#fda4af" />      {/* Rich pink */}
            <stop offset="92%" stopColor="#e11d48" stopOpacity="0.85" /> {/* Melted edge shade */}
            <stop offset="100%" stopColor="#9f1239" />     {/* Dark rim */}
          </radialGradient>

          {/* Rose Gold Metallic Text Gradient */}
          <linearGradient id="rose-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />       {/* Champagne Gold */}
            <stop offset="30%" stopColor="#fbcfe8" />      {/* Soft rose */}
            <stop offset="50%" stopColor="#fda4af" />      {/* Bright Rose Gold */}
            <stop offset="70%" stopColor="#e11d48" />      {/* Deep Rose Gold */}
            <stop offset="100%" stopColor="#fef08a" />     {/* Highlight */}
          </linearGradient>

          {/* Champagne Gold Accent Gradient */}
          <linearGradient id="champagne-grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Circular paths for text mapping */}
          {/* Upper Text Path */}
          <path 
            id="text-path-upper" 
            d="M 32,100 A 68,68 0 1,1 168,100" 
            fill="none" 
          />
          {/* Lower Text Path */}
          <path 
            id="text-path-lower" 
            d="M 168,100 A 68,68 0 0,1 32,100" 
            fill="none" 
          />
        </defs>

        {/* Outer Organic Melted Wax Base with 3D Depth */}
        <path 
          d="M 100,6 
             C 125,4 145,12 165,22 
             C 185,32 196,52 193,78 
             C 190,104 202,128 191,152 
             C 180,176 156,188 132,192 
             C 108,196 84,204 60,192 
             C 36,180 18,162 10,136 
             C 2,110 8,86 12,62 
             C 16,38 42,16 68,10 
             C 80,7 90,8 100,6 Z" 
          fill="url(#wax-grad)" 
          filter="url(#wax-depth)"
        />

        {/* Nested Inner Elegant Border */}
        <circle 
          cx="100" 
          cy="100" 
          r="78" 
          fill="none" 
          stroke="url(#rose-gold-grad)" 
          strokeWidth="2.5" 
          strokeDasharray="120 4 2 4"
          opacity="0.8"
        />
        <circle 
          cx="100" 
          cy="100" 
          r="74" 
          fill="none" 
          stroke="url(#rose-gold-grad)" 
          strokeWidth="1" 
          opacity="0.9"
        />

        {/* Elegant Inner Beaded Border */}
        <circle 
          cx="100" 
          cy="100" 
          r="58" 
          fill="none" 
          stroke="url(#champagne-grad)" 
          strokeWidth="1.5" 
          strokeDasharray="1 4" 
          opacity="0.85"
        />

        {/* Circular text upper - "IRAMO STORE" */}
        <text fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="12" fill="url(#rose-gold-grad)" letterSpacing="3.5" opacity="0.95">
          <textPath href="#text-path-upper" startOffset="50%" textAnchor="middle">
            IRAMO STORE
          </textPath>
        </text>

        {/* Circular text lower - "LUXURY BOUTIQUE" */}
        <text fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="9" fill="url(#rose-gold-grad)" letterSpacing="2.5" opacity="0.9">
          <textPath href="#text-path-lower" startOffset="50%" textAnchor="middle">
            LUXURY BOUTIQUE
          </textPath>
        </text>

        {/* Center Monogram Circular Area with Matte Texture */}
        <circle 
          cx="100" 
          cy="100" 
          r="50" 
          fill="url(#wax-grad)" 
          opacity="0.95"
          filter="url(#wax-depth)"
        />

        {/* Elegant Flourish Pattern background in center */}
        <path 
          d="M 85,90 C 85,80 115,80 115,90 C 115,100 85,100 85,110 C 85,120 115,120 115,110" 
          fill="none" 
          stroke="url(#champagne-grad)" 
          strokeWidth="0.8" 
          opacity="0.25"
        />

        {/* Calligraphic Royal Monogram Letter "I" */}
        <g transform="translate(100, 100) scale(1.15) translate(-100, -100)">
          {/* Main vertical stroke of 'I' with flourish curves */}
          <path 
            d="M 98,68 
               C 102,68 106,72 104,80 
               C 102,88 97,105 95,115 
               C 93,125 96,132 102,132 
               C 106,132 110,128 111,124" 
            fill="none" 
            stroke="url(#rose-gold-grad)" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          {/* Top serif serif scroll */}
          <path 
            d="M 82,72 C 90,72 102,64 114,68 C 122,70 120,78 110,78 C 100,78 92,72 82,72 Z" 
            fill="url(#rose-gold-grad)" 
          />
          {/* Bottom flourish tail */}
          <path 
            d="M 86,128 C 94,128 102,136 112,134 C 116,133 118,128 112,126" 
            fill="none" 
            stroke="url(#rose-gold-grad)" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </g>

        {/* Integrated tiny Ribbon Bow under monogram */}
        <g transform="translate(100, 142) scale(0.65) translate(-100, -100)">
          {/* Left loop */}
          <path d="M 100,100 C 85,90 75,105 100,100 Z" fill="url(#rose-gold-grad)" />
          {/* Right loop */}
          <path d="M 100,100 C 115,90 125,105 100,100 Z" fill="url(#rose-gold-grad)" />
          {/* Left ribbon tail */}
          <path d="M 97,102 C 90,115 82,120 85,122" fill="none" stroke="url(#rose-gold-grad)" strokeWidth="1.5" strokeLinecap="round" />
          {/* Right ribbon tail */}
          <path d="M 103,102 C 110,115 118,120 115,122" fill="none" stroke="url(#rose-gold-grad)" strokeWidth="1.5" strokeLinecap="round" />
          {/* Center knot */}
          <circle cx="100" cy="100" r="2.5" fill="url(#champagne-grad)" />
        </g>

        {/* 2 Tiny Embossed Butterflies */}
        {/* Left butterfly */}
        <path 
          d="M 66,90 C 64,88 64,92 66,93 C 68,94 67,91 66,90 Z" 
          fill="url(#champagne-grad)" 
          opacity="0.6"
        />
        {/* Right butterfly */}
        <path 
          d="M 134,106 C 136,104 136,108 134,109 C 132,110 133,107 134,106 Z" 
          fill="url(#champagne-grad)" 
          opacity="0.6"
        />

        {/* Sparkle Diamonds (small star polygons) */}
        <polygon points="100,52 102,55 105,55 103,57 104,60 100,58 96,60 97,57 95,55 98,55" fill="url(#champagne-grad)" />
        <polygon points="135,76 136,78 138,78 136,79 137,81 135,80 133,81 134,79 132,78 134,78" fill="url(#champagne-grad)" />

        {/* Inscribed signature text: "Huda Mohammed" & "Official Collection" inside inner ring */}
        <text 
          x="100" 
          y="114" 
          fontFamily="'Aref Ruqaa', serif" 
          fontWeight="bold" 
          fontSize="7.5" 
          fill="url(#champagne-grad)" 
          textAnchor="middle"
          letterSpacing="0.5"
          opacity="0.9"
        >
          Huda Mohammed
        </text>
        <text 
          x="100" 
          y="122" 
          fontFamily="'Inter', sans-serif" 
          fontWeight="bold" 
          fontSize="5" 
          fill="url(#rose-gold-grad)" 
          textAnchor="middle"
          letterSpacing="1"
          opacity="0.75"
        >
          OFFICIAL COLLECTION
        </text>
      </svg>
    </div>
  );
}
