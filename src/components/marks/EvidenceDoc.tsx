import React from 'react';

interface MarkProps {
  className?: string;
  size?: number;
}

export function EvidenceDoc({ className = "", size = 48 }: MarkProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none text-[#B24724] ${className}`}
    >
      {/* Outer folded folder/manifest container */}
      <path 
        d="M24 15 H62 L78 31 V85 C78 88.3 75.3 91 72 91 H24 C20.7 91 18 88.3 18 85 V21 C18 17.7 20.7 15 24 15 Z" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
      />
      
      {/* Folded page corner */}
      <path 
        d="M62 15 V31 H78" 
        stroke="currentColor" 
        strokeWidth="2.2" 
        strokeLinejoin="round" 
      />
      
      {/* Dynamic scope rows / lines */}
      <line x1="28" y1="42" x2="68" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="52" x2="68" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="62" x2="52" y2="62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      
      {/* Verified stamp watermark mark in corner of page */}
      <circle cx="62" cy="68" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 1.5" />
      <path d="M57 68 L60 71 L67 64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Small document metadata tags */}
      <text x="28" y="78" fill="currentColor" fontSize="6" fontWeight="bold" letterSpacing="0.05em" className="font-mono">
        EVID.ID_9013Z
      </text>
    </svg>
  );
}
