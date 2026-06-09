import React from 'react';

interface MarkProps {
  className?: string;
  size?: number;
}

export function VerifiedStamp({ className = "", size = 48 }: MarkProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none text-[#B24724] ${className}`}
    >
      {/* Outer scalloped/notched stamp border */}
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 3" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" />
      
      {/* Inner stamp badge content */}
      <path 
        d="M35 52 L45 61 L65 39" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Curved circular stamp typography */}
      <path id="curve" d="M 22,50 A 28,28 0 1,1 78,50" fill="none" />
      <text fill="currentColor" fontSize="8" fontWeight="bold" letterSpacing="0.2em" className="font-mono">
        <textPath href="#curve" startOffset="50%" textAnchor="middle">
          VERIFIED BY PM
        </textPath>
      </text>
    </svg>
  );
}
