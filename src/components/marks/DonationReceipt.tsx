import React from 'react';

interface MarkProps {
  className?: string;
  size?: number;
}

export function DonationReceipt({ className = "", size = 48 }: MarkProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none text-[#B24724] ${className}`}
    >
      {/* Receipt background container with serrated bottom teeth */}
      <path 
        d="M22 12 H78 V83 L73.5 80 L69 83 L64.5 80 L60 83 L55.5 80 L51 83 L46.5 80 L42 83 L37.5 80 L33 83 L28.5 80 L24 83 V12 Z" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
      />
      
      {/* Decorative receipt lines */}
      <path d="M30 22 H70" stroke="currentColor" strokeWidth="2" strokeDasharray="1 3" />
      
      {/* Header barcode */}
      <path d="M30 30 H33 M37 30 H45 M49 30 H51 M55 30 H67 M70 30 H70" stroke="currentColor" strokeWidth="4" />
      
      {/* Main receipt ledger items */}
      <circle cx="34" cy="48" r="3" fill="currentColor" />
      <line x1="42" y1="48" x2="68" y2="48" stroke="currentColor" strokeWidth="2" />
      
      <circle cx="34" cy="58" r="3" fill="currentColor" />
      <line x1="42" y1="58" x2="68" y2="58" stroke="currentColor" strokeWidth="2" />

      {/* Verified transaction stamp signature */}
      <path d="M52 64 L58 74 L73 60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Disclosed pricing ledger text */}
      <text x="30" y="74" fill="currentColor" fontSize="6.5" fontWeight="bold" className="font-mono">
        +5% FEE TRANS.
      </text>
    </svg>
  );
}
