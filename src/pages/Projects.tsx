import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useProjectsStore } from '../hooks/useProjectsStore';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectSkeleton } from '../components/ProjectSkeleton';
import { Reveal } from '../components/motion/Reveal';
import { StaggerChildren } from '../components/motion/StaggerChildren';
import { springBouncy } from '../lib/motion';
import { SDG_GOALS } from '../lib/sdg-data';
import { Search, SlidersHorizontal, ArrowDownAZ, HelpCircle, X, Shield, Goal, RefreshCw } from 'lucide-react';
import { PillButton } from '../components/PillButton';

interface ProjectsProps {
  onNavigate: (view: string, id?: string) => void;
}

const SDG_SLIDESHOW_IMAGES = [
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400", // Construction/Sanitation
  "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=400", // Coral / Marine Life
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400", // Inclusive Literacy
  "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400", // Communities / Cities
  "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?auto=format&fit=crop&q=80&w=400", // Well water filtration
  "https://images.unsplash.com/photo-1559027615-cd96e95224e5?auto=format&fit=crop&q=80&w=400"  // Active volunteering field
];

const LIVE_ACTIVITIES = [
  "Pledge Lock Action: $350 successfully escrow-certified for Water Treatment Node (SDG 6).",
  "Auditor Verification: Auditor verified physical telemetry photo for Rain Harvester Grid.",
  "New Volunteer Assigned: Harrison Eldo reserved 12 sweat equity shifts to SDG 4 initiative.",
  "Milestone Verified: Milestone #1 for SDG 14 Restored Coral Nurseries approved by Phil.",
  "Pledge Lock Action: $1,250 securely locked in escrow by Alice Greenfield for study lanterns.",
  "Regulator Audit Checklist: Legal credentials cleared for Municipal Sanitation Campaign.",
  "Sweat Equity Logged: Volunteer logged 4.5h hours of certified offshore coral prop action."
];

export function Projects({ onNavigate }: ProjectsProps) {
  const { projects, loading: storeLoading } = useProjectsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSdg, setSelectedSdg] = useState<number | null>(null);
  const [compensationFilter, setCompensationFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'funding_raised' | 'funding_target'>('newest');
  const [loading, setLoading] = useState(true);

  // Trigger brief shimmer loading state when filters change for realistic perceived performance
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSdg, compensationFilter, sortOption]);

  // Live rotating stuff
  const [imageIdx1, setImageIdx1] = useState(0);
  const [imageIdx2, setImageIdx2] = useState(1);
  const [activityIdx, setActivityIdx] = useState(0);
  const [animateActivity, setAnimateActivity] = useState(true);

  useEffect(() => {
    const handle = setInterval(() => {
      setImageIdx1(prev => (prev + 2) % SDG_SLIDESHOW_IMAGES.length);
      setImageIdx2(prev => (prev + 2) % SDG_SLIDESHOW_IMAGES.length);
    }, 3800);
    return () => clearInterval(handle);
  }, []);

  useEffect(() => {
    const handle = setInterval(() => {
      setAnimateActivity(false);
      setTimeout(() => {
        setActivityIdx(prev => (prev + 1) % LIVE_ACTIVITIES.length);
        setAnimateActivity(true);
      }, 300);
    }, 4500);
    return () => clearInterval(handle);
  }, []);

  // Interactive filtered project list
  const filteredProjects = projects
    .filter((p) => {
      // Must be active (or completed) to see in public feed, but let's show all except pending (to match handover spec)
      const isPublic = p.status === 'active' || p.status === 'completed';
      if (!isPublic) return false;

      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        p.title.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.ownerName.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);

      // 2. SDG Goal Filter
      const matchesSdg = selectedSdg === null || p.sdgs.includes(selectedSdg);

      // 3. Volunteer Compensation
      const matchesComp = 
        compensationFilter === 'all' || 
        p.volunteerCompensation === compensationFilter;

      return matchesSearch && matchesSdg && matchesComp;
    })
    .sort((a, b) => {
      // 4. Sort routines
      if (sortOption === 'funding_raised') {
        return b.fundingRaised - a.fundingRaised;
      }
      if (sortOption === 'funding_target') {
        return b.fundingTarget - a.fundingTarget;
      }
      // default newest:
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <Reveal direction="up" className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center select-none border-b border-slate-200/50 pb-6">
        <div className="md:col-span-2 space-y-2.5">
          <label className="text-[10px] font-sans font-bold text-emerald-600 uppercase tracking-[0.25em] leading-none">Civic Directory</label>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-slate-900 tracking-tight">Explore SDG-Aligned Campaigns</h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Securely fund local infrastructure or apply to volunteer your skills directly. Use filters below to target Sustainable Development Goals.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100% Escrow Escorted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
              SDG Audited Channels
            </span>
          </div>
        </div>
        
        {/* Compact Right Side Carousel of Impact Images */}
        <div className="relative h-28 rounded-2xl overflow-hidden border border-slate-200/40 shadow-xs flex gap-1.5 bg-slate-100 p-1">
          <div className="flex-1 h-full rounded-xl overflow-hidden relative">
            <img
              key={`img-1-${imageIdx1}`}
              src={SDG_SLIDESHOW_IMAGES[imageIdx1]}
              alt="Community Action"
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full object-center hover:scale-105 transition-all duration-700 animate-fade-in"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div className="flex-1 h-full rounded-xl overflow-hidden relative">
            <img
              key={`img-2-${imageIdx2}`}
              src={SDG_SLIDESHOW_IMAGES[imageIdx2]}
              alt="SDG Active Focus"
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full object-center hover:scale-105 transition-all duration-700 animate-fade-in"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        </div>
      </Reveal>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={springBouncy}
        className="bg-[#FAF9F6]/90 backdrop-blur-md border border-slate-200/40 rounded-2xl px-5 py-3 shadow-xs flex items-center justify-between gap-4 select-none"
      >
        <div className="flex items-center gap-2 text-[10px] font-sans font-bold text-emerald-600 uppercase tracking-widest shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Civic Feed</span>
        </div>
        <div className="w-full h-6 overflow-hidden relative text-xs">
          <div className={`transition-all duration-300 transform font-mono text-slate-500 text-[10px] sm:text-[11px] flex items-center gap-2 ${
            animateActivity ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}>
            <span>{LIVE_ACTIVITIES[activityIdx]}</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
          <span className="hidden sm:inline">Real-time Sync</span>
        </div>
      </motion.div>

      <Reveal direction="down" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 select-none">
        
        {/* Row 1: Search + Hard Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search box */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by title, creator, sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 outline-none rounded-xl border border-slate-200 focus:border-slate-400 transition-colors text-xs font-mono"
            />
          </div>

          {/* Volunteer compensation Filter */}
          <div>
            <select
              value={compensationFilter}
              onChange={(e) => setCompensationFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 outline-none rounded-xl border border-slate-200 focus:border-slate-400 transition-colors text-xs font-mono bg-white"
            >
              <option value="all">Volunteering Opportunities (All)</option>
              <option value="unpaid">Unpaid / Gift Volunteering</option>
              <option value="paid">Paid Work Shifts</option>
            </select>
          </div>

          {/* Sort selection */}
          <div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="w-full px-3 py-2.5 outline-none rounded-xl border border-slate-200 focus:border-slate-400 transition-colors text-xs font-mono bg-white"
            >
              <option value="newest">Sort By: Newest Initiatives</option>
              <option value="funding_raised">Sort By: Highest Pledged ($)</option>
              <option value="funding_target">Sort By: Campaign Target ($)</option>
            </select>
          </div>

        </div>

        {/* Row 2: SDG Badges Horizontal Row Filter */}
        <div className="space-y-1 pb-1">
          <div className="flex justify-between items-baseline text-[10px] uppercase font-mono text-slate-400 font-semibold">
            <span>Filter by UN Sustainable Goal:</span>
            {selectedSdg !== null && (
              <PillButton
                variant="outline"
                caps={false}
                onClick={() => setSelectedSdg(null)}
                textColor="#059669"
                pillColor="#B24724"
                className="py-1 px-3 text-[11px] font-bold"
              >
                Clear SDG filter <X className="h-3 w-3" />
              </PillButton>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
            {SDG_GOALS.map((goal) => {
              const count = projects.filter(p => (p.status === 'active' || p.status === 'completed') && p.sdgs.includes(goal.number)).length;
              if (count === 0) return null; // Only show active goals

              const isSelected = selectedSdg === goal.number;

              return (
                <button
                  key={goal.number}
                  onClick={() => setSelectedSdg(isSelected ? null : goal.number)}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 shrink-0 transition-all ${
                    isSelected
                      ? 'text-white border-transparent shadow-xs font-semibold'
                      : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:border-slate-300'
                  }`}
                  style={isSelected ? { backgroundColor: goal.color } : {}}
                >
                  <span className={`h-4 w-4 rounded-full flex items-center justify-center font-bold text-[9px] ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-800'}`}>
                    {goal.number}
                  </span>
                  <span>{goal.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </Reveal>

      {/* CAMPAIGN LISTINGS CONTAINER */}
      <div className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2 select-none">
          <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
            {filteredProjects.length} matching campaign{filteredProjects.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {storeLoading || loading ? (
          <ProjectSkeleton count={6} />
        ) : (
          <>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.08}>
              {filteredProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => onNavigate('project_detail', p.id)}
                />
              ))}
            </StaggerChildren>

            {filteredProjects.length === 0 && (
              <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl p-8 space-y-3 max-w-md mx-auto shadow-2xs select-none">
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto text-sm">
                  <Goal className="h-5 w-5" />
                </div>
                <h3 className="font-serif font-semibold text-slate-800 text-base">No Matching Goals</h3>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  No active or completed campaigns matched your search or filters. Try checking different SGD indices or clear search queries.
                </p>
                <PillButton
                  variant="primary"
                  caps={false}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSdg(null);
                    setCompensationFilter('all');
                  }}
                  className="mt-3 py-1.5 px-4 text-xs font-mono shadow-2xs"
                >
                  Reset Directories
                </PillButton>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
