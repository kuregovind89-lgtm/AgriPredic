import React from "react";

/* Hand-crafted isometric-style SVG illustrations (layered gradients +
   drop shadows simulate depth/3D since raster 3D renders aren't available
   here). Used across auth pages, empty states, and upload dropzone. */

export function FarmSceneIllustration({ style }) {
  return (
    <svg viewBox="0 0 480 420" style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCEFD1" />
          <stop offset="100%" stopColor="#F3FAEC" />
        </linearGradient>
        <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FCB6A" />
          <stop offset="100%" stopColor="#6BAE4C" />
        </linearGradient>
        <linearGradient id="fieldTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8DE8F" />
          <stop offset="100%" stopColor="#9ACB6C" />
        </linearGradient>
        <linearGradient id="fieldSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CB958" />
          <stop offset="100%" stopColor="#5D9B3E" />
        </linearGradient>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5FAE3E" />
          <stop offset="100%" stopColor="#3E7D28" />
        </linearGradient>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCE9A8" />
          <stop offset="100%" stopColor="#F4C542" />
        </radialGradient>
      </defs>

      <rect width="480" height="420" fill="url(#skyGrad)" />
      <circle cx="400" cy="70" r="46" fill="url(#sunGrad)" opacity="0.9" />
      <path d="M0 150 Q120 90 240 150 T480 150 V420 H0 Z" fill="url(#hillGrad)" opacity="0.55" />

      {/* isometric field plane */}
      <polygon points="40,280 240,190 440,280 240,370" fill="url(#fieldTop)" />
      <polygon points="40,280 240,370 240,410 40,320" fill="url(#fieldSide)" />
      <polygon points="440,280 240,370 240,410 440,320" fill="url(#fieldSide)" opacity="0.85" />

      {/* crop rows: little isometric leaf/plant clusters */}
      {[
        [130, 268], [170, 288], [210, 250], [250, 270], [290, 292],
        [330, 258], [190, 320], [250, 335], [310, 318], [150, 232],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse cx="0" cy="10" rx="14" ry="5" fill="#3E7D28" opacity="0.25" />
          <path d="M0 0 C -10 -4, -12 -16, -2 -24 C 4 -16, 4 -6, 0 0 Z" fill="url(#leafGrad)" />
          <path d="M0 0 C 10 -4, 12 -16, 2 -24 C -4 -16, -4 -6, 0 0 Z" fill="#4FA033" />
        </g>
      ))}

      {/* isometric barn */}
      <g transform="translate(340 150)">
        <polygon points="0,40 40,20 80,40 80,90 0,90" fill="#E7EFDD" />
        <polygon points="0,40 40,20 40,70 0,90" fill="#D3E2C4" />
        <polygon points="40,20 80,40 40,70 0,40" fill="#F4C542" opacity="0.9" />
        <rect x="30" y="55" width="18" height="30" fill="#8C5E3C" />
      </g>
    </svg>
  );
}

export function PlantGrowthIllustration({ style }) {
  return (
    <svg viewBox="0 0 300 300" style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="potGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B9764C" />
          <stop offset="100%" stopColor="#8C5E3C" />
        </linearGradient>
        <linearGradient id="leafGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6BC57F" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B8E6A0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#B8E6A0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="170" rx="130" ry="130" fill="url(#glow)" />

      {/* pot (isometric-ish) */}
      <polygon points="105,220 195,220 180,270 120,270" fill="url(#potGrad)" />
      <ellipse cx="150" cy="220" rx="45" ry="12" fill="#A56A44" />

      {/* stem */}
      <rect x="146" y="120" width="8" height="105" rx="4" fill="#4C8C34" />

      {/* layered leaves for depth */}
      <g>
        <path d="M150 150 C 100 140, 70 90, 90 50 C 130 60, 155 100, 150 150 Z" fill="url(#leafGrad2)" />
        <path d="M150 150 C 200 140, 230 90, 210 50 C 170 60, 145 100, 150 150 Z" fill="#4FA033" />
        <path d="M150 130 C 115 118, 100 85, 118 55 C 148 68, 158 100, 150 130 Z" fill="#3E7D28" opacity="0.7" />
        <path d="M150 130 C 185 118, 200 85, 182 55 C 152 68, 142 100, 150 130 Z" fill="#5FAE3E" opacity="0.7" />
      </g>
      <ellipse cx="150" cy="60" rx="10" ry="14" fill="#6BC57F" />
    </svg>
  );
}

export function LeafScanIllustration({ style }) {
  return (
    <svg viewBox="0 0 260 260" style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leafBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#79D48A" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
        <linearGradient id="scanBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4B942" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F4B942" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="130" cy="130" r="120" fill="#EAF6E4" />
      <path d="M130 40 C 190 55, 215 110, 195 165 C 175 215, 120 225, 90 195 C 55 160, 65 90, 130 40 Z" fill="url(#leafBody)" />
      <path d="M130 55 C 130 110, 130 165, 130 205" stroke="#1F5C22" strokeWidth="4" fill="none" opacity="0.5" />
      <path d="M130 90 C 110 100, 95 110, 85 120 M130 120 C 108 128, 95 138, 88 148 M130 150 C 112 158, 100 168, 92 176" stroke="#1F5C22" strokeWidth="3" fill="none" opacity="0.4" />
      {/* scanning beam + brackets to suggest AI detection */}
      <rect x="60" y="60" width="140" height="10" fill="url(#scanBeam)">
        <animate attributeName="y" values="55;200;55" dur="2.8s" repeatCount="indefinite" />
      </rect>
      <path d="M55 55 L55 40 L75 40 M205 55 L205 40 L185 40 M55 205 L55 220 L75 220 M205 205 L205 220 L185 220"
            stroke="#F4B942" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyStateIllustration({ style }) {
  return (
    <svg viewBox="0 0 260 200" style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8F2E0" />
        </linearGradient>
        <linearGradient id="emptyLeafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6BC57F" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
      <ellipse cx="130" cy="170" rx="90" ry="12" fill="#DCEBD1" />
      <g transform="translate(70 40)">
        <path d="M60 0 C 90 0, 110 25, 100 50 C 130 55, 130 90, 100 95 L20 95 C -10 95, -10 55, 20 50 C 10 20, 30 0, 60 0 Z" fill="url(#cloudGrad)" stroke="#CFE3C2" strokeWidth="2" />
      </g>
      <g transform="translate(115 75)">
        <path d="M15 60 C 5 50, 5 30, 15 20 C 25 10, 35 10, 40 20 C 45 10, 55 10, 60 20 C 65 30, 65 50, 45 60 Z" fill="url(#emptyLeafGrad)" />
      </g>
    </svg>
  );
}
