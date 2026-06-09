import React from 'react';

interface MarkProps {
  className?: string;
  size?: number;
}

export function EscrowMark({ className = "", size = 48 }: MarkProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none text-[#B24724] ${className}`}
    >
      {/* Structural security badge container */}
      <rect x="20" y="25" width="60" height="58" rx="8" stroke="currentColor" strokeWidth="2.5" />
      
      {/* Escrow vault arch hook */}
      <path 
        d="M36 25 V18 C36 10 64 10 64 18 V25" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      
      {/* Central ledger / lock mechanism */}
      <circle cx="50" cy="54" r="12" stroke="currentColor" strokeWidth="2" />
      <path d="M50 48 V60 M44 54 H56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      
      {/* Radiating security trust beams */}
      <path d="M12 40 H16 M12 50 H16 M12 60 H16 M84 40 H88 M84 50 H88 M84 60 H88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      
      {/* Status label */}
      <text x="50" y="93" fill="currentColor" fontSize="6.5" fontWeight="bold" letterSpacing="0.1em" textAnchor="middle" className="font-mono">
        ESCROW SECURE
      </text>
    </svg>
  );
}
