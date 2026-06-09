import React from 'react';
import { SDG_GOALS } from '../lib/sdg-data';

interface SDGBadgeProps {
  sdgNumber: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  key?: any;
}

export function SDGBadge({ sdgNumber, size = 'sm', showText = true }: SDGBadgeProps) {
  const goal = SDG_GOALS.find(s => s.number === sdgNumber);
  if (!goal) return null;

  const fontSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm'
  };

  const badgeSizes = {
    sm: 'h-5 w-5 text-[9px]',
    md: 'h-6 w-6 text-xs',
    lg: 'h-8 w-8 text-sm'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md p-1 border border-transparent ${goal.bgColor} ${fontSizes[size]}`}>
      {/* Box */}
      <div 
        className={`flex items-center justify-center font-mono font-bold text-white rounded shrink-0 ${badgeSizes[size]}`}
        style={{ backgroundColor: goal.color }}
      >
        {goal.number}
      </div>
      {showText && (
        <span className="font-medium pr-1 text-gray-700 tracking-tight leading-none font-mono">
          {goal.name}
        </span>
      )}
    </div>
  );
}
