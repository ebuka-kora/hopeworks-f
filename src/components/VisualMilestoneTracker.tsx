import React from 'react';
import { motion } from 'motion/react';
import { Project, Milestone, ProjectAssignment } from '../types';
import { 
  CheckCircle2, 
  HelpCircle, 
  Lock, 
  Unlock, 
  Hourglass, 
  AlertCircle, 
  User, 
  TrendingUp, 
  Coins, 
  FileCheck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface VisualMilestoneTrackerProps {
  project: Project;
  assignment: ProjectAssignment | null;
}

export function VisualMilestoneTracker({ project, assignment }: VisualMilestoneTrackerProps) {
  const { milestones, fundingTarget, fundingRaised } = project;

  // Calculates general overview stats
  const totalMilestones = milestones.length;
  const approvedMilestones = milestones.filter(m => m.status === 'approved').length;
  const pendingReviewMilestones = milestones.filter(m => m.status === 'submitted').length;
  const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;

  const totalCostOfMilestones = milestones.reduce((acc, m) => acc + m.cost, 0);
  const totalFundsUnlocked = milestones
    .filter(m => m.status === 'approved')
    .reduce((acc, m) => acc + m.cost, 0);

  const fundingPercent = Math.min(100, Math.round((fundingRaised / fundingTarget) * 100));
  const escrowPercent = totalCostOfMilestones > 0 
    ? Math.min(100, Math.round((totalFundsUnlocked / totalCostOfMilestones) * 100))
    : 0;

  // Get status color parameters
  const getMilestoneConfig = (status: Milestone['status']) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50/80',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-600 text-white',
          label: 'Verified & Released',
          lockIcon: Unlock,
          shimmer: false
        };
      case 'submitted':
        return {
          icon: RefreshCw,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50/80',
          border: 'border-indigo-300',
          badgeBg: 'bg-indigo-600 text-white animate-pulse',
          label: 'Under Active Audit',
          lockIcon: Lock,
          shimmer: true
        };
      case 'in_progress':
        return {
          icon: Hourglass,
          color: 'text-amber-600',
          bg: 'bg-amber-50/70',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-500 text-white',
          label: 'In Progress',
          lockIcon: Lock,
          shimmer: false
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-rose-600',
          bg: 'bg-rose-50/80',
          border: 'border-rose-300',
          badgeBg: 'bg-rose-600 text-white',
          label: 'Requires Revision',
          lockIcon: Lock,
          shimmer: false
        };
      default:
        return {
          icon: HelpCircle,
          color: 'text-slate-400',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          badgeBg: 'bg-slate-200 text-slate-500',
          label: 'Locked in Escrow',
          lockIcon: Lock,
          shimmer: false
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xs select-none selection:bg-[#B24724]/10">
      
      {/* Header section with Verification Auditor metadata */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="font-serif font-bold text-slate-900 text-xl tracking-tight leading-none">
            Live Trust & Milestone Analytics
          </h3>
          <p className="text-slate-500 text-xs mt-1.5 font-sans leading-relaxed">
            Real-time synchronization of civic escrow funding targets and independent auditing milestone statuses.
          </p>
        </div>

        {/* PM Status Card */}
        {assignment ? (
          <div className="flex items-center gap-3 px-4 py-2 bg-[#FAF9F6] border border-[#B24724]/10 rounded-2xl">
            <div className="h-8 w-8 rounded-full bg-[#B24724]/5 border border-[#B24724]/10 flex items-center justify-center text-[#B24724]">
              <User className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 text-left font-sans">
              <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 block uppercase leading-none">
                Authorized Regulatory PM
              </span>
              <span className="text-xs font-bold text-slate-800 block">
                {assignment.pmName}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-medium text-slate-400">
            <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
            <span>Independent PM Assigned Pending</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Financial Goal Progress */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Funding Goal</span>
            <TrendingUp className="h-4 w-4 text-[#B24724]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-slate-950">${fundingRaised.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400 font-sans">raised</span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans leading-none">
              Target: ${fundingTarget.toLocaleString()}
            </div>
          </div>
          {/* Progress Mini Bar */}
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${fundingPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <span className="text-[9px] font-mono text-emerald-600 block text-right font-bold">{fundingPercent}% Pledged</span>
          </div>
        </div>

        {/* Metric 2: Escrow Disbursed Progress */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Escrow Payout</span>
            <Coins className="h-4 w-4 text-[#B24724]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-slate-950">${totalFundsUnlocked.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400 font-sans">released</span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans leading-none">
              Milestones Pool: ${totalCostOfMilestones.toLocaleString()}
            </div>
          </div>
          {/* Progress Mini Bar */}
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${escrowPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-slate-900 rounded-full"
              />
            </div>
            <span className="text-[9px] font-mono text-slate-700 block text-right font-bold">{escrowPercent}% Disbursed</span>
          </div>
        </div>

        {/* Metric 3: Audit Check-offs */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Audit Completion</span>
            <FileCheck className="h-4.5 w-4.5 text-indigo-500" />
          </div>
          <div className="pb-1">
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-2xl font-bold font-mono text-slate-950">{approvedMilestones}</span>
              <span className="text-slate-400 font-sans text-xs">/ {totalMilestones} cleared</span>
            </div>
            <p className="text-[10px] text-slate-405 text-slate-400 mt-1 pb-1">
              {pendingReviewMilestones > 0 ? (
                <span className="text-indigo-600 font-semibold font-mono animate-pulse">{pendingReviewMilestones} pending active review</span>
              ) : inProgressMilestones > 0 ? (
                <span>{inProgressMilestones} actively underway on site</span>
              ) : (
                <span>All actions verified compliant</span>
              )}
            </p>
          </div>
        </div>

        {/* Metric 4: General Security Health */}
        <div className="p-5 border border-slate-101 border-slate-100 rounded-2xl bg-[#B24724]/[0.02] space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Verification Grade</span>
            <ShieldCheck className="h-4.5 w-4.5 text-[#B24724]" />
          </div>
          <div className="pb-1 space-y-1">
            <span className="text-base font-bold font-mono text-slate-950 uppercase tracking-tight block">
              {approvedMilestones === totalMilestones && totalMilestones > 0
                ? "Grade AAA Cleared"
                : approvedMilestones > 0
                ? "Active Verification"
                : "Secured Escrow"}
            </span>
            <span className="text-[10px] text-slate-400 leading-snug font-sans block">
              Direct telemetry auditing locks and releases coordinates dynamically.
            </span>
          </div>
        </div>

      </div>

      {/* Sequenced Horizontal Interactive Timeline Trace */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-extrabold block">
            Milestone Audit Status Map
          </span>
          <span className="text-[10px] font-sans text-slate-405 text-slate-500 italic block">
            Approved steps unlock funds in sequence
          </span>
        </div>

        {/* Horizontally scrolling visually stunning node stack */}
        <div className="relative overflow-x-auto pb-2 pt-3 px-1 scrollbar-thin">
          <div className="flex items-stretch gap-4 min-w-max py-1">
            {milestones.map((milestone, idx) => {
              const config = getMilestoneConfig(milestone.status);
              const IconComponent = config.icon;
              const LockComponent = config.lockIcon;
              const isLast = idx === milestones.length - 1;

              return (
                <div key={milestone.id} className="flex items-center">
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    className={`w-[248px] shrink-0 p-4 pt-5 border rounded-2xl bg-white ${config.border} transition-all duration-200 relative cursor-default ${
                      milestone.status === 'submitted'
                        ? 'shadow-md shadow-indigo-100'
                        : 'hover:shadow-md hover:border-slate-300'
                    }`}
                  >
                    <span className={`absolute -top-2.5 left-3 h-6 w-6 text-[10px] font-mono font-black ${config.badgeBg} rounded-lg flex items-center justify-center shadow-sm border border-white`}>
                      {idx + 1}
                    </span>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 pr-1">
                        <div className={`h-10 w-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
                          <IconComponent className={`h-5 w-5 ${config.shimmer ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {milestone.title}
                          </h4>
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-wide mt-1 block ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-slate-100 text-[10px] font-mono">
                        <span className="font-semibold text-slate-800">${milestone.cost.toLocaleString()} Payout</span>
                        <div className="flex items-center gap-1 text-slate-400 shrink-0">
                          <LockComponent className="h-3 w-3" />
                          <span>{milestone.status === 'approved' ? 'Unlocked' : 'Locked'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {!isLast && (
                    <div className="w-8 flex items-center justify-center shrink-0 self-center">
                      <div className={`h-0.5 w-full transition-colors duration-300 ${
                        milestone.status === 'approved' ? 'bg-slate-900' : 'bg-slate-200'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
