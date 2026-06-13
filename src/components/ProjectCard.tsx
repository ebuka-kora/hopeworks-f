import React from 'react';
import { Project } from '../types';
import { SDGBadge } from './SDGBadge';
import { Users, Target, User, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { defaultViewport, springBouncy } from '../lib/motion';
import { ResponsiveImage } from './ResponsiveImage';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  key?: any;
}

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200';

const CARD_CLASS =
  'bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between group h-full';

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const percentRaised = Math.min(100, Math.round((project.fundingRaised / project.fundingTarget) * 100));
  const coverSrc = project.coverUrl || FALLBACK_COVER;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={springBouncy}
      onClick={onClick}
      className={CARD_CLASS}
    >
      <div>
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          <ResponsiveImage
            src={coverSrc}
            alt={project.title}
            sizes="(min-width: 1536px) 320px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            aspectRatio="16/9"
            referrerPolicy="no-referrer"
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.02]"
          />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1 pr-6 hover:opacity-90">
            {project.sdgs.slice(0, 2).map((num) => (
              <SDGBadge key={num} sdgNumber={num} size="sm" showText={false} />
            ))}
          </div>

          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-caption font-mono font-semibold text-slate-800 shadow-xs border border-white/50 tracking-wider">
            {project.volunteerCompensation === 'paid' ? 'Paid Work' : 'Volunteering'}
          </div>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-caption uppercase tracking-wider text-slate-400 font-sans font-bold">
              <User className="h-3 w-3 text-emerald-600" />
              <span>Created by {project.ownerName}</span>
            </div>

            <h3 className="font-serif font-semibold text-slate-900 group-hover:text-emerald-600 group-hover:italic transition-all text-lg leading-snug line-clamp-1 flex items-center justify-between gap-1">
              <span>{project.title}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-2">{project.summary}</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0 border-t border-slate-50 mt-auto space-y-4">
        <div className="space-y-1.5 pt-3.5">
          <div className="flex justify-between items-baseline font-mono text-caption text-slate-500">
            <span className="font-semibold text-emerald-700">${project.fundingRaised.toLocaleString()} raised</span>
            <span>of ${project.fundingTarget.toLocaleString()} goal ({percentRaised}%)</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${percentRaised}%` }}
              viewport={defaultViewport}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-caption border-t border-slate-100/50 pt-2.5 font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Target: ${project.fundingTarget.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{project.volunteersFilled}/{project.volunteerSlots} volunteers</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
