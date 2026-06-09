import React from 'react';

interface MilestoneRailProps {
  className?: string;
  steps?: { title: string; status: 'completed' | 'active' | 'pending' }[];
}

export function MilestoneRail({ className = "", steps }: MilestoneRailProps) {
  const defaultSteps = steps || [
    { title: 'Fundraising', status: 'completed' as const },
    { title: 'Escrow Lock', status: 'completed' as const },
    { title: 'Execution', status: 'active' as const },
    { title: 'Audit / Release', status: 'pending' as const }
  ];

  return (
    <div className={`flex flex-col gap-3 select-none w-full ${className}`}>
      <div className="flex items-center justify-between relative w-full mb-1">
        {/* Progress Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
        
        {/* Dynamic completed progress fill */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-[#B24724] -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(defaultSteps.filter(s => s.status === 'completed').length / (defaultSteps.length - 1)) * 100}%` }}
        />

        {defaultSteps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          
          return (
            <div key={idx} className="flex flex-col items-center z-10 relative">
              {/* Dot visualizer */}
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-350 ${
                  isCompleted 
                    ? 'bg-[#B24724] border-[#B24724] text-white shadow-sm' 
                    : isActive 
                    ? 'bg-white border-[#B24724] text-[#B24724] scale-110 shadow-sm font-bold ring-4 ring-slate-100' 
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-mono">{idx + 1}</span>
                )}
              </div>
              
              {/* Title tag label */}
              <span className={`text-[9px] font-mono whitespace-nowrap mt-2 uppercase tracking-wider ${
                isActive ? 'text-[#B24724] font-bold' : isCompleted ? 'text-slate-800 font-medium' : 'text-slate-400'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
