import React from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { useProjectsStore } from '../hooks/useProjectsStore';
import { useDonationsStore } from '../hooks/useDonationsStore';
import { useApplicationsStore } from '../hooks/useApplicationsStore';
import { ProjectCard } from '../components/ProjectCard';
import { SDGBadge } from '../components/SDGBadge';
import { SDG_GOALS } from '../lib/sdg-data';
import { CircularGallery } from '../components/CircularGallery';
import RotatingText from '../components/RotatingText';
import { PillButton } from '../components/PillButton';
import { BigNumbers } from '../components/landing/BigNumbers';
import { LedgerStream } from '../components/landing/LedgerStream';
import { TrustMark } from '../components/landing/TrustMark';
import { Heart, Activity, Globe, Shield, CheckCircle2, UserCheck, ArrowRight, ShieldCheck, HeartHandshake, MoveLeft, MoveRight, LogOut } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Reveal } from '../components/motion/Reveal';
import { StaggerChildren } from '../components/motion/StaggerChildren';
import {
  timelineContainerVariants,
  timelineCardVariants,
  timelineLineVariants,
  springBouncy,
  defaultViewport,
} from '../lib/motion';
// @ts-ignore
import regeneratedImage from '../assets/images/regenerated_image_1780915883348.png';
// @ts-ignore
import sdgDarkBgImage from '../assets/images/sdg_dark_bg_1780919495584.png';
// @ts-ignore
import rolesDarkBgImage from '../assets/images/roles_dark_bg_1780920135502.png';
// @ts-ignore
import communityAboutImage from '../assets/images/community_about_image_1780924952669.png';

const SDG_UNSPLASH_IMAGES: { [key: number]: string } = {
  1: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600",
  2: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600",
  3: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
  4: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600",
  5: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=600",
  6: "https://images.unsplash.com/photo-1518081461904-9d8f136351c2?auto=format&fit=crop&q=80&w=600",
  7: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=600",
  8: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600",
  9: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
  10: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=600",
  11: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=600",
  12: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600",
  13: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600",
  14: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600",
  15: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600",
  16: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=600",
  17: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600"
};

interface IndexProps {
  onNavigate: (view: string, id?: string) => void;
}

export function Index({ onNavigate }: IndexProps) {
  const { user, logout } = useAuth();
  const { projects } = useProjectsStore();
  const { donations } = useDonationsStore();
  const { applications } = useApplicationsStore();

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const heroImageRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const { scrollYProgress } = useScroll({
    target: heroImageRef,
    offset: ['start end', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCardHoverEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget.querySelector('.gsap-hover-image');
    if (target) {
      gsap.to(target, { scale: 1.05, duration: 0.5, ease: 'power2.out' });
    }
  };

  const handleCardHoverLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget.querySelector('.gsap-hover-image');
    if (target) {
      gsap.to(target, { scale: 1, duration: 0.5, ease: 'power2.out' });
    }
  };

  // Handle auto-scrolling of ledger timeline
  React.useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        // If there’s nothing/nearly nothing to scroll, do nothing
        if (maxScroll <= 0) return;

        if (container.scrollLeft >= maxScroll - 15) {
          // Wrap around safely to start
          container.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Scroll right by approximately one card width (320px item + 48px gap = 368px)
          container.scrollBy({
            left: 368,
            behavior: 'smooth'
          });
        }
      }
    }, 3800); // Trigger auto-scroll every 3.8 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  // Dynamic system-wide statistics
  const totalPledged = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalVolunteers = applications.filter(a => a.status === 'approved').length;
  
  // Total approved milestones across all projects
  const verifiedMilestonesCount = projects.reduce((count, p) => {
    return count + p.milestones.filter(m => m.status === 'approved').length;
  }, 0);

  const activeProjects = projects.filter(p => p.status === 'active');
  const featured = activeProjects.slice(0, 3);

  // Combine live activity stream: recent donations and applications
  const timelineItems = [
    ...donations.map(d => ({
      type: 'donation' as const,
      title: 'Escrow Deposit Confirmed 💰',
      desc: `${d.isAnonymous ? 'An anonymous donor' : d.donorName} pledged $${d.amount.toLocaleString()} for "${d.projectName}"`,
      time: d.createdAt,
    })),
    ...applications.map(a => ({
      type: 'application' as const,
      title: 'Volunteer Match Found 🤝',
      desc: `${a.volunteerName} applied with skills: ${a.skills.slice(0, 2).join(', ')} for "${a.projectName}"`,
      time: a.createdAt,
    })),
    ...projects.flatMap(p => p.milestones.map((m, i) => ({
      type: m.status,
      title: m.status === 'approved' ? 'Milestone Verified & Unlocked 🔓' : m.status === 'submitted' ? 'Milestone Submitted for Audit 🔍' : null,
      desc: `Milestone #${i + 1}: "${m.title}" of "${p.title}" is ${m.status.replace('_', ' ')}.`,
      time: m.approvedAt || p.createdAt,
    })))
  ]
  .filter(item => item.title !== null)
  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  .slice(0, 10);

  return (
    <div className="space-y-0 pb-32">
      
      {/* EMBEDDED HERO HEADER — fixed so it stays visible while scrolling */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#FAF9F6]/90 backdrop-blur-md border-b border-slate-200/30 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          {/* Left Side: Brand Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="cursor-pointer select-none shrink-0"
          >
            <Logo iconSize={32} />
          </div>

          {/* Right Side: Logged-in info & Authentication Buttons */}
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.16em]">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Profile details */}
                <div 
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 border border-slate-200/50 bg-[#FAF9F6]/50 backdrop-blur-md py-1.5 px-3.5 rounded-full cursor-pointer hover:bg-white hover:border-slate-300 transition-all font-mono"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-slate-800 text-white font-serif text-[10px] flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline-block text-[10px] text-slate-600 font-sans tracking-normal lowercase font-semibold">{user.name}</span>
                </div>

                {/* View Dashboard */}
                <PillButton
                  onClick={() => onNavigate('dashboard')}
                  className="py-2.5 px-6 text-[11.5px] font-sans"
                  textColor="#334155"
                  pillColor="#B24724"
                  baseColor="transparent"
                  hoveredTextColor="#ffffff"
                >
                  Dashboard
                </PillButton>

                {/* Log Out */}
                <button 
                  onClick={() => { logout(); onNavigate('home'); }}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0 cursor-pointer"
                  title="Log Out Session"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-bold">
                <PillButton
                  onClick={() => onNavigate('login')}
                  className="py-2.5 px-6 cursor-pointer border-black"
                  baseColor="transparent"
                  textColor="#000000"
                  pillColor="#B24724"
                  hoveredTextColor="#ffffff"
                >
                  Sign In
                </PillButton>
                <PillButton
                  onClick={() => onNavigate('register')}
                  className="py-2.5 px-6 shadow-sm cursor-pointer border-black"
                  baseColor="#000000"
                  textColor="#ffffff"
                  pillColor="#B24724"
                  hoveredTextColor="#ffffff"
                >
                  Sign Up
                </PillButton>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="overflow-x-clip pt-[4.5rem] sm:pt-[5rem]">
      {/* 1. HERO SECTION & VISUAL ENTRY */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 sm:pb-16 select-none max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.25em] border border-emerald-200/40"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Escrow-Protected Civic Crowdfunding</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-[#0f0e0e] tracking-tight leading-[1.1] -mt-1 sm:-mt-2"
          >
            <span className="block">Fund genuine impact.</span>
            <span className="block text-[#B24724] my-2 sm:my-3 overflow-hidden relative h-[1.15em]">
              <RotatingText
                texts={['Audit the evidence.', 'Trace every dollar.', 'Certify the work.', 'Build civic trust.']}
                mainClassName="text-[#B24724] italic font-normal"
                staggerFrom="first"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
                staggerDuration={0.035}
                splitLevelClassName=""
                transition={{ type: "spring", damping: 30, stiffness: 280 }}
                rotationInterval={3800}
              />
            </span>
            <span className="block">Uncap local solidarity.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-500 font-sans text-xs sm:text-sm leading-relaxed tracking-wide"
          >
            HopeWorks secures complete trust across boundaries. Pledged capital rests locked in an auditable escrow ledger. Appointed PM engineers verify physical proofs on the ground before any milestone funds disburse.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 font-sans text-[11px] uppercase tracking-[0.2em] font-bold"
          >
            <PillButton
              onClick={() => onNavigate('explore')}
              className="w-full sm:w-auto py-3.5 px-8 shadow-sm cursor-pointer border-black"
              baseColor="#000000"
              textColor="#ffffff"
              pillColor="#B24724"
              hoveredTextColor="#ffffff"
              Icon={ArrowRight}
            >
              Explore Goals
            </PillButton>
            <PillButton
              onClick={() => onNavigate('create_campaign')}
              className="w-full sm:w-auto py-3.5 px-8 cursor-pointer border-black"
              baseColor="transparent"
              textColor="#000000"
              pillColor="#B24724"
              hoveredTextColor="#ffffff"
            >
              + Create Campaign
            </PillButton>
          </motion.div>
        </div>

        <motion.div
          ref={heroImageRef}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springBouncy, delay: 0.4 }}
          className="max-w-7xl mx-auto mt-20 sm:mt-24 rounded-2xl overflow-hidden border border-slate-100 shadow-lg relative aspect-[21/9]"
        >
          <motion.img
            style={{ y: heroImageY }}
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1920"
            alt="Crowd with HopeWorks goals"
            referrerPolicy="no-referrer"
            className="object-cover w-full h-[110%] object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </motion.div>
      </section>

      {/* 2. DYNAMIC BROADCAST STATISTICS WITH LIVE LEDGER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none my-24 sm:my-32 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Reveal direction="up" className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#B24724]">Core Ledger Diagnostics</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-slate-950 tracking-tight">Active Platform Aggregate Ledger</h3>
            </Reveal>
            <BigNumbers />
          </div>
          <Reveal direction="right" delay={0.15} className="lg:col-span-1">
            <LedgerStream />
          </Reveal>
        </div>
      </section>

      {/* OUR COOPERATIVE ROLES MATRIX SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none my-24 sm:my-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative overflow-hidden bg-slate-950 p-8 sm:p-12 rounded-3xl border border-slate-900 shadow-2xl">
          {/* Background dark image */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-40">
            <img
              src={rolesDarkBgImage}
              alt="Cooperative dark backdrop"
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />
          </div>
          
          <Reveal direction="left" className="lg:col-span-5 space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-sans font-bold text-amber-500 uppercase tracking-[0.25em]">Civic Ecosystem</label>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-white tracking-tight leading-tight">
                Active Platform Cooperation Roles
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans tracking-wide">
              HopeWorks operates on clean, accountable synergy between five authorized community roles. Together, they mobilize secure funding, volunteer support, and robust physical milestone auditing to secure local hope.
            </p>

            <div className="pt-2">
              <PillButton
                variant="outline"
                onClick={() => onNavigate('how_it_works')}
                className="py-3 px-6 text-xs font-sans shadow-xs"
              >
                Learn How Escrow Works
                <ArrowRight className="h-4 w-4" />
              </PillButton>
            </div>
          </Reveal>

          <div className="lg:col-span-7 bg-slate-900/40 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-xs relative overflow-hidden backdrop-blur-xs z-10">
            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-4" stagger={0.08}>
              {[
                {
                  abbr: 'PO',
                  title: 'Project Owner',
                  desc: 'Runs accountable, milestone-based campaigns and recruits local volunteers recursively.',
                  responsibilities: ['Milestone Definition', 'Fund & Claim Delivery', 'Volunteer Liaison'],
                  colorBg: 'bg-[#0B4F35]',
                  colorLight: 'bg-[#0B4F35]/15 text-emerald-400 border-[#0B4F35]/30',
                  gradient: 'hover:bg-[#0B4F35]/10 hover:border-[#0B4F35]/40'
                },
                {
                  abbr: 'DO',
                  title: 'Donor / Sponsor',
                  desc: 'Funds local work they can physically verify, with a completely transparent ledger.',
                  responsibilities: ['Milestone Pledging', 'Proof Inspection', 'Escrow Verification'],
                  colorBg: 'bg-[#A9441B]',
                  colorLight: 'bg-[#A9441B]/15 text-orange-400 border-[#A9441B]/30',
                  gradient: 'hover:bg-[#A9441B]/10 hover:border-[#A9441B]/40'
                },
                {
                  abbr: 'VO',
                  title: 'Volunteer',
                  desc: 'Contributes specialized skills and time, signs in/out, and earns verified credentials.',
                  responsibilities: ['Sweat Equity Hours', 'Local Skill Sharing', 'Social Impact Mining'],
                  colorBg: 'bg-[#133863]',
                  colorLight: 'bg-[#133863]/15 text-sky-400 border-[#133863]/30',
                  gradient: 'hover:bg-[#133863]/10 hover:border-[#133863]/40'
                },
                {
                  abbr: 'PM',
                  title: 'Project Manager (Auditor)',
                  desc: 'An independent neutral professional who travels on-site to verify physically requested milestones.',
                  responsibilities: ['On-site Vetting', 'Proof Endorsement', 'Neutral Oversight'],
                  colorBg: 'bg-[#704A0E]',
                  colorLight: 'bg-[#704A0E]/15 text-amber-400 border-[#704A0E]/30',
                  gradient: 'hover:bg-[#704A0E]/10 hover:border-[#704A0E]/40'
                },
                {
                  abbr: 'AD',
                  title: 'Administrator',
                  desc: 'Provides central moderation, identity vetting, assigns verified PMs, and governs platform integrity.',
                  responsibilities: ['Legal Moderation', 'PM Matching', 'Dispute Resolution'],
                  colorBg: 'bg-[#7F1D1D]',
                  colorLight: 'bg-[#7F1D1D]/15 text-red-400 border-[#7F1D1D]/30',
                  gradient: 'hover:bg-[#7F1D1D]/10 hover:border-[#7F1D1D]/40',
                  spanFull: true
                }
              ].map((role) => (
                <motion.div 
                  key={role.abbr} 
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={springBouncy}
                  className={`bg-slate-900/80 border border-white/5 p-5 rounded-2xl transition-all duration-300 hover:shadow-md group/tile ${role.gradient} ${role.spanFull ? 'sm:col-span-2' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ rotate: [0, -6, 6, 0], scale: 1.1 }}
                      transition={{ duration: 0.35 }}
                      className={`${role.colorBg} w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs text-white shrink-0 shadow-sm select-none`}
                    >
                      {role.abbr}
                    </motion.div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-serif font-black text-white text-sm leading-tight truncate">
                          {role.title}
                        </h4>
                        <span className="text-[7.5px] font-mono tracking-wide uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-bold">
                          Core
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed tracking-wide">
                        {role.desc}
                      </p>

                      {/* Responsibilities pills */}
                      <div className="flex flex-wrap gap-1 pt-1.5 font-sans">
                        {role.responsibilities.map((resp, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={defaultViewport}
                            transition={{ ...springBouncy, delay: i * 0.05 }}
                            className={`px-1.5 py-0.5 rounded border text-[8px] font-mono font-semibold ${role.colorLight}`}
                          >
                            {resp}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>

        </div>
      </section>



      {/* PLATFORM TRUST & TRANSPARENCY PRINCIPLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none my-24">
        <TrustMark onNavigate={onNavigate} />
      </section>

      {/* 2.5 THE ESCROW & PROOF PIPELINE IN PICTURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 select-none my-28 sm:my-36">
        <Reveal direction="bouncy" className="text-center space-y-1.5 max-w-2xl mx-auto">
          <label className="text-[10px] font-sans font-bold text-emerald-600 uppercase tracking-[0.25em]">Audited Workflow</label>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-slate-900 tracking-tight">The Three Pillars of Securing Local Hope</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Standard crowdfunding ends at payment. HopeWorks secures the complete cycle of trust through escrow milestones, active volunteerism, and certified audits.
          </p>
        </Reveal>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.12}>
          <motion.div 
            onMouseEnter={handleCardHoverEnter}
            onMouseLeave={handleCardHoverLeave}
            className="relative group rounded-2xl overflow-hidden border border-slate-200/40 bg-white h-80 flex flex-col justify-end p-6 transition-all shadow-xs hover:shadow-lg"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=600"
                alt="Locked escrow capital mobilization"
                referrerPolicy="no-referrer"
                className="object-cover w-full h-full object-center gsap-hover-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />
            </div>
            
            <motion.div
              className="relative z-20 space-y-2 text-white"
              initial={{ y: 12, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={defaultViewport}
              transition={springBouncy}
            >
              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 bg-emerald-900/50 border border-emerald-900/30 px-2 py-0.5 rounded">Stage 01</span>
              <h4 className="font-serif font-semibold text-lg leading-tight text-white">Pledge & Lock Capital</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-light">
                Citizen pledges rest secured in an immutable local escrow contract. Your money remains untouched until concrete milestones are physically built.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            onMouseEnter={handleCardHoverEnter}
            onMouseLeave={handleCardHoverLeave}
            className="relative group rounded-2xl overflow-hidden border border-slate-200/40 bg-white h-80 flex flex-col justify-end p-6 transition-all shadow-xs hover:shadow-lg"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600"
                alt="Active community field work"
                referrerPolicy="no-referrer"
                className="object-cover w-full h-full object-center gsap-hover-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />
            </div>
            
            <motion.div
              className="relative z-20 space-y-2 text-white"
              initial={{ y: 12, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={defaultViewport}
              transition={springBouncy}
            >
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#38bdf8] bg-sky-950/50 border border-sky-950/30 px-2 py-0.5 rounded">Stage 02</span>
              <h4 className="font-serif font-semibold text-lg leading-tight text-white">Community & Field Labor</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-light">
                Active volunteers match with project coordinators to construct clean rain grids, assemble solar study lanterns, and multiply damaged coral nurseries.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            onMouseEnter={handleCardHoverEnter}
            onMouseLeave={handleCardHoverLeave}
            className="relative group rounded-2xl overflow-hidden border border-slate-200/40 bg-white h-80 flex flex-col justify-end p-6 transition-all shadow-xs hover:shadow-lg"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={regeneratedImage}
                alt="Independent engineering field audit"
                referrerPolicy="no-referrer"
                className="object-cover w-full h-full object-center gsap-hover-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />
            </div>
            
            <motion.div
              className="relative z-20 space-y-2 text-white"
              initial={{ y: 12, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={defaultViewport}
              transition={springBouncy}
            >
              <span className="font-mono text-[9px] uppercase tracking-widest text-indigo-400 bg-indigo-950/50 border border-indigo-950/30 px-2 py-0.5 rounded">Stage 03</span>
              <h4 className="font-serif font-semibold text-lg leading-tight text-white">PM Certified Evidence Auditing</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-light">
                Registered inspection managers assess physical proofs and photo telemetry on-site. Verified milestones automatically release funds to owners.
              </p>
            </motion.div>
          </motion.div>
        </StaggerChildren>
      </section>

      {/* 3. EXPLORE BY SDG TARGETS (Beautiful Circular 3D Gallery) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-28 sm:my-36">
        <div className="relative overflow-hidden bg-slate-950 p-8 sm:p-12 md:p-16 rounded-3xl border border-slate-900 shadow-2xl">
          {/* Background dark image */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-40">
            <img
              src={sdgDarkBgImage}
              alt="Dark structural backdrop"
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/90 to-[#020617]" />
          </div>

          <div className="relative z-10 space-y-10">
            <Reveal direction="up" className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-white/10 pb-5">
              <div className="text-center sm:text-left space-y-1.5">
                <label className="text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-[0.25em]">UN Alignment Matrix</label>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight">SDG Campaigns Mapping Matrix</h2>
                <p className="text-xs text-slate-400 max-w-lg leading-relaxed">Each HopeWorks campaign aligns with the 17 United Nations goals to focus civic energy.</p>
              </div>
            </Reveal>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={defaultViewport}
              transition={springBouncy}
              className="relative h-[480px] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-900 bg-linear-to-b from-[#020617] via-[#090d1f] to-[#020617] group"
            >
              
              {/* Circular gallery component mount */}
              <div className="absolute inset-0 z-10">
                <CircularGallery
                  items={SDG_GOALS.map((goal) => {
                    const count = projects.filter(p => p.sdgs.includes(goal.number)).length;
                    return {
                      image: SDG_UNSPLASH_IMAGES[goal.number] || "https://images.unsplash.com/photo-1518081461904-9d8f136351c2?auto=format&fit=crop&q=80&w=600",
                      text: `${goal.number}. ${goal.name.toUpperCase()}${count > 0 ? ` (${count})` : ''}`
                    };
                  })}
                  bend={1.2}
                  textColor="#FAF9F6"
                  borderRadius={0.05}
                  scrollEase={0.06}
                  font="bold 15px 'Uncut Sans', sans-serif"
                  scrollSpeed={2.5}
                />
              </div>

              {/* Glowing Gradients Framing for Ultimate Visual Polish */}
              <div className="absolute top-0 bottom-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none z-20" />
              <div className="absolute top-0 bottom-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none z-20" />
              
              {/* Subtle Ambient HUD overlay at the top */}
              <div className="absolute top-4 left-4 right-4 flex justify-end items-center z-20 pointer-events-none select-none">
                <PillButton
                  variant="outline"
                  caps={false}
                  onClick={() => onNavigate('explore')}
                  baseColor="rgba(2, 6, 23, 0.4)"
                  textColor="#34d399"
                  pillColor="#B24724"
                  hoveredTextColor="#ffffff"
                  className="pointer-events-auto text-[9px] font-mono px-3 py-1 border-emerald-900/50"
                >
                  Matrix Directory ↗
                </PillButton>
              </div>


            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. ACTIVE CAMPAIGNS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 my-28 sm:my-36">
        <Reveal direction="up" className="flex flex-col sm:flex-row justify-between items-baseline gap-2 pb-5 border-b border-slate-200/50">
          <div className="space-y-1.5">
            <label className="text-[10px] font-sans font-bold text-emerald-600 uppercase tracking-[0.25em]">Civic Campaigns</label>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-slate-900 tracking-tight">Featured Escrow-Driven Initiatives</h2>
          </div>
          <motion.button
            onClick={() => onNavigate('explore')}
            whileHover={{ x: 4 }}
            transition={springBouncy}
            className="text-[11px] uppercase tracking-[0.15em] text-slate-600 hover:text-slate-900 font-sans font-bold flex items-center gap-1.5 select-none shrink-0"
          >
            <span>See All Goal Projects</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </Reveal>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.1}>
          {featured.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onClick={() => onNavigate('project_detail', p.id)}
            />
          ))}
          {featured.length === 0 && (
            <div className="col-span-3 text-center py-10 font-mono text-xs text-slate-400">
              No active campaigns matching criteria. Launch your first now!
            </div>
          )}
        </StaggerChildren>
      </section>

      {/* NEW ABOUT HERO BANNER (Premium Dark / Golden Asset Accent) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-28 sm:my-36">
        <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 md:p-16 border border-slate-900 shadow-2xl relative overflow-hidden">
          {/* Background dark textured image */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-40">
            <img
              src={rolesDarkBgImage}
              alt="Luxury abstract dark backdrop"
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/60" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
            <Reveal direction="left" className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
              <div>
                <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3.5 py-1.5 rounded-[4px] font-sans font-black text-[11px] uppercase tracking-wider select-none">
                  Verified Trust & Escrow Guarantee
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-5xl lg:text-5.5xl font-serif font-black text-white tracking-tight leading-[1.1] max-w-xl">
                HopeWorks is a trusted leader in online fundraising.
              </h2>
              
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans font-light max-w-xl">
                Our transparent, <span className="text-amber-300 font-semibold">milestone-locked escrow protocol</span> guards every donation. Funds are only disbursed when real-world evidence is audited and verified, ensuring your generosity transforms communities with <span className="text-amber-300 font-semibold">absolute integrity</span>.
              </p>
            </Reveal>

            <Reveal direction="scale" className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src={communityAboutImage}
                  alt="Proud volunteers delivering drinking water to citizens"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[2rem] transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </Reveal>
          </div>

          {/* Golden glow visual pattern accents inside card */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* 5. LIVE CIVIC LEDGER STREAM (Premium Horizontal Chronological Timeline) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 my-32">
        <Reveal direction="up" className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/50 pb-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-slate-950 tracking-tight">
              Active Escrow & Audit Ledger
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Every dollar pledged remains locked under rigorous verification. Swipe or slide to track chronologically our live stream of community contributions, peer-to-peer audits, and milestones unlocked on the ground.
            </p>
          </div>

          {/* Navigation sliders */}
          <div className="flex items-center gap-2 shrink-0 self-end">
            <button 
              onClick={() => scrollTimeline('left')}
              className="p-2.5 rounded-full border border-slate-200 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all duration-300 active:scale-95 shadow-xs cursor-pointer"
              aria-label="Scroll left"
            >
              <MoveLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => scrollTimeline('right')}
              className="p-2.5 rounded-full border border-slate-200 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all duration-300 active:scale-95 shadow-xs cursor-pointer"
              aria-label="Scroll right"
            >
              <MoveRight className="h-4 w-4" />
            </button>
          </div>
        </Reveal>

        {/* Live Ledger Activity Horizontal Timeline Container */}
        <div className="relative">
          {/* Fading side gradients to indicate scrollability */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/10 to-transparent pointer-events-none z-10 opacity-0 group-hover/timeline:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/10 to-transparent pointer-events-none z-10 pointer-events-none" />

          <motion.div 
            ref={scrollContainerRef}
            variants={timelineContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            className="flex overflow-x-auto gap-12 pb-12 pt-4 px-1 scroll-smooth scrollbar-none snap-x snap-mandatory"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none'
            }}
          >
            {[...timelineItems].reverse().map((item, i, reversedArray) => {
              // Clean up titles and assign elegant icons & status labels
              let elegantTitle = item.title;
              let statusPill = "Activity";
              let colorTheme = {
                border: "border-[#B24724]",
                bg: "bg-[#FAF9F6]",
                text: "text-[#B24724]",
                iconBg: "bg-orange-50/40",
                accent: "#B24724"
              };
              let ActionIcon = Activity;

              if (item.type === 'donation') {
                elegantTitle = "Escrow Deposit Secured";
                statusPill = "Escrow Pledge";
                colorTheme = {
                  border: "border-[#B24724]",
                  bg: "bg-[#FAF9F6]",
                  text: "text-[#B24724]",
                  iconBg: "bg-[#FAF9F6]",
                  accent: "#B24724"
                };
                ActionIcon = Heart;
              } else if (item.type === 'application') {
                elegantTitle = "Field Coordinator Matched";
                statusPill = "Civic Labor";
                colorTheme = {
                  border: "border-sky-400",
                  bg: "bg-sky-50/50",
                  text: "text-sky-700",
                  iconBg: "bg-sky-50/60",
                  accent: "#38bdf8"
                };
                ActionIcon = HeartHandshake;
              } else if (item.type === 'approved') {
                elegantTitle = "Audit Approved & Unlocked";
                statusPill = "Verified Milestone";
                colorTheme = {
                  border: "border-emerald-500",
                  bg: "bg-emerald-50/30",
                  text: "text-emerald-700",
                  iconBg: "bg-emerald-50/60",
                  accent: "#10b981"
                };
                ActionIcon = ShieldCheck;
              } else if (item.type === 'submitted') {
                elegantTitle = "Milestone Under Field Review";
                statusPill = "Pending Audit";
                colorTheme = {
                  border: "border-amber-500",
                  bg: "bg-amber-50/30",
                  text: "text-amber-800",
                  iconBg: "bg-amber-50/60",
                  accent: "#f59e0b"
                };
                ActionIcon = CheckCircle2;
              }

              const isLast = i === reversedArray.length - 1;

              return (
                <motion.div 
                  key={i} 
                  variants={timelineCardVariants}
                  className="relative flex-none w-[280px] sm:w-[320px] snap-start group"
                >
                  {/* Connecting horizontal line segment with a cool progressive expand animation */}
                  {!isLast && (
                    <motion.div 
                      variants={timelineLineVariants}
                      className={`absolute top-[23px] left-6 w-[calc(100%+3rem)] h-[2px] z-0 origin-left transition-all duration-500 ${
                        item.type === 'approved' || item.type === 'donation'
                          ? 'bg-slate-900 opacity-100'
                          : 'bg-slate-200'
                      }`} 
                    />
                  )}

                  {/* Icon Box */}
                  <div className="relative z-10 flex mb-8">
                    <motion.div 
                      whileHover={{ scale: 1.12, rotate: [0, -3, 3, 0] }}
                      transition={{ duration: 0.3 }}
                      className={`w-12 h-12 rounded-xl border border-slate-200/80 bg-white flex items-center justify-center shadow-xs transition-all duration-300 group-hover:border-slate-400 group-hover:shadow-md ${colorTheme.text} ${colorTheme.iconBg}`}
                    >
                      <ActionIcon className="h-4.5 w-4.5" />
                    </motion.div>
                  </div>

                  {/* Details block */}
                  <div className="space-y-2.5 pr-4 select-text">
                    <p className="font-mono text-[10px] tracking-widest text-slate-400 font-bold block">
                      {new Date(item.time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block text-[9px] font-mono tracking-wider font-extrabold uppercase px-2 py-0.5 rounded-full border ${colorTheme.border} ${colorTheme.bg} ${colorTheme.text}`}>
                        {statusPill}
                      </span>
                    </div>

                    <h4 className="text-sm font-sans font-extrabold text-slate-950 tracking-tight leading-snug group-hover:text-[#B24724] transition-colors duration-300">
                      {elegantTitle}
                    </h4>
                    
                    <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-3">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {timelineItems.length === 0 && (
              <div className="w-full text-center py-16 bg-white rounded-3xl border border-slate-100 space-y-3 shadow-xs">
                <span className="text-2xl">🌱</span>
                <p className="text-xs font-mono font-bold text-slate-700">Verification Ledger Offline</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Connect your civic sandbox to register initial community escrow transactions.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      </div>
    </div>
  );
}
