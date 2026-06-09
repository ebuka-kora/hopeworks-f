import React from 'react';
import logoImage from '@/assets/logo1.png';

interface PulseBeatLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function PulseBeatLoader({
  message = 'Loading...',
  fullScreen = true,
}: PulseBeatLoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? 'fixed inset-0 z-[350] flex items-center justify-center'
          : 'relative flex min-h-[40vh] w-full items-center justify-center py-24'
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="absolute inset-0 bg-slate-50/75 backdrop-blur-xl" />

      <div className="relative flex flex-col items-center gap-5 select-none">
        <div className="relative flex items-center justify-center">
          <span
            className="absolute h-28 w-28 rounded-full bg-[#B24724]/10 hopeworks-pulse-ring"
            aria-hidden="true"
          />
          <img
            src={logoImage}
            alt="HopeWorks"
            className="relative h-20 w-20 object-contain hopeworks-pulse-beat drop-shadow-sm"
            draggable={false}
          />
        </div>

        {message && (
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
