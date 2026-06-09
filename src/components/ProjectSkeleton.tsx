import React from 'react';
import { motion } from 'motion/react';

interface ProjectSkeletonProps {
  count?: number;
}

export function ProjectSkeleton({ count = 3 }: ProjectSkeletonProps) {
  // Array of placeholder cards to render
  const placeholders = Array.from({ length: count });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs flex flex-col justify-between h-full"
        >
          <div>
            {/* Aspect Ratio Image Container */}
            <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
              <motion.div
                animate={{
                  background: [
                    'rgba(241, 245, 249, 1)',
                    'rgba(226, 232, 240, 1)',
                    'rgba(241, 245, 249, 1)',
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
                className="w-full h-full"
              />
              {/* SDG badges placeholder */}
              <div className="absolute top-3 left-3 flex gap-1">
                <div className="h-6 w-14 bg-slate-200/80 rounded-lg animate-pulse" />
                <div className="h-6 w-14 bg-slate-200/80 rounded-lg animate-pulse" />
              </div>
              {/* Compensation tag placeholder */}
              <div className="absolute bottom-3 right-3 h-6 w-20 bg-slate-200/80 rounded-lg animate-pulse" />
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-3.5">
              <div className="space-y-2.5">
                {/* Creator info */}
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                </div>

                {/* Title */}
                <div className="h-5 w-4/5 bg-slate-200 rounded animate-pulse" />

                {/* Summary Lines */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <div className="px-5 pb-5 pt-0 border-t border-slate-50 mt-auto space-y-4">
            {/* Progress Gauge */}
            <div className="space-y-2 pt-3.5">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div
                  animate={{
                    left: ['-100%', '100%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: 'linear',
                  }}
                  className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-slate-200 to-transparent"
                />
              </div>
            </div>

            {/* Targets / Volunteers */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100/50 pt-2.5">
              <div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
