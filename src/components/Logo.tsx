import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  textColorClass?: string;
}

export function Logo({ 
  className = "", 
  iconSize = 38, 
  showText = true,
  textColorClass = "text-[#3C2D2B]"
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision stylized H/W vector emblem from uploaded prototype */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Left short vertical line */}
        <line
          x1="32"
          y1="32"
          x2="32"
          y2="56"
          stroke="#B24724"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Left tall vertical line */}
        <line
          x1="44"
          y1="14"
          x2="44"
          y2="80"
          stroke="#B24724"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Right tall vertical line */}
        <line
          x1="56"
          y1="14"
          x2="56"
          y2="80"
          stroke="#B24724"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Right short vertical line */}
        <line
          x1="68"
          y1="32"
          x2="68"
          y2="56"
          stroke="#B24724"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Connecting zig-zag diagonal path */}
        <path
          d="M32 56 L44 44 L50 36 L56 44 L68 56"
          stroke="#B24724"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span className="font-sans text-xl font-extrabold tracking-tight select-none">
          <span className="text-[#B24724]">Hope</span>
          <span className={textColorClass}>Works</span>
        </span>
      )}
    </div>
  );
}
