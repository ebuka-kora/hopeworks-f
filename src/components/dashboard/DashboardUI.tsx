import React from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, ChevronDown, Plus } from 'lucide-react';
import { springDashboard } from '../../lib/motion';
import { PillButton } from '../PillButton';

export const HW = {
  brand: '#B24724',
  brandDark: '#9A3412',
  brandLight: '#FFEDD5',
  cream: '#FAF9F6',
  surface: '#FFFFFF',
  border: '#E6E4DD',
} as const;

export type DashboardStatus = 'active' | 'pending' | 'inactive' | 'completed';

const STATUS_STYLES: Record<DashboardStatus, { dot: string; text: string; label: string }> = {
  active: { dot: 'bg-[#B24724]', text: 'text-[#B24724]', label: 'On route' },
  pending: { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Waiting' },
  inactive: { dot: 'bg-slate-400', text: 'text-slate-500', label: 'Inactive' },
  completed: { dot: 'bg-[#C2410C]', text: 'text-[#9A3412]', label: 'Completed' },
};

export interface DashboardTab {
  id: string;
  label: string;
  count: number;
}

interface DashboardPageHeaderProps {
  title: string;
  count: number;
  countLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function DashboardPageHeader({
  title,
  count,
  countLabel = 'items',
  actionLabel,
  onAction,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
      <div>
        <h1 className="text-[1.1rem] font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className="font-semibold text-[#B24724]">{count}</span> {countLabel}
        </p>
      </div>
      {actionLabel && onAction && (
        <PillButton
          variant="brand"
          caps={false}
          onClick={onAction}
          Icon={Plus}
          className="px-3 py-1.5 text-xs shadow-sm shrink-0"
        >
          {actionLabel}
        </PillButton>
      )}
    </div>
  );
}

interface DashboardTabsProps {
  tabs: DashboardTab[];
  activeId: string;
  onChange: (id: string) => void;
}

export function DashboardTabs({ tabs, activeId, onChange }: DashboardTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-3 relative">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              isActive
                ? 'text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-[#B24724]/30 hover:text-slate-900'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="dashboard-tab-active"
                className="absolute inset-0 bg-[#B24724] rounded-full"
                transition={springDashboard}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            <span
              className={`relative z-10 text-xs font-bold px-2 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface DashboardToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

export function DashboardToolbar({
  search,
  onSearchChange,
  placeholder = 'Search...',
  children,
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-2 mb-3">
      <div className="relative flex-grow">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#B24724]/50 focus:ring-2 focus:ring-[#B24724]/10 transition-all"
        />
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <PillButton variant="muted" caps={false} className="px-3 py-2 text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          Filters
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </PillButton>
        <PillButton variant="muted" caps={false} className="px-3 py-2 text-xs">
          Time
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </PillButton>
        {children}
      </div>
    </div>
  );
}

interface TrackingCardProps {
  status: DashboardStatus;
  statusLabel?: string;
  timeLabel?: string;
  code: string;
  title: string;
  route: string;
  metrics: { label: string; value: string }[];
  timeline: string[];
  progress: number;
  onClick?: () => void;
  footer?: React.ReactNode;
}

export function TrackingCard({
  status,
  statusLabel,
  timeLabel,
  code,
  title,
  route,
  metrics,
  timeline,
  progress,
  onClick,
  footer,
}: TrackingCardProps) {
  const style = STATUS_STYLES[status];
  const label = statusLabel || style.label;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springDashboard}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2.5 transition-all hover:border-[#B24724]/25 hover:shadow-sm ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
          <span className={`text-xs font-semibold ${style.text}`}>{label}</span>
        </div>
        {timeLabel && (
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{timeLabel}</span>
        )}
      </div>

      <div>
        <p className="text-[11px] font-mono text-slate-400 tracking-wide uppercase">{code}</p>
        <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug line-clamp-2">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{route}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="text-[10px] text-slate-400">{m.label}</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-stretch min-h-[64px]">
        <div className="flex flex-col justify-between py-1 shrink-0">
          {timeline.map((stop, i) => (
            <div key={`${stop}-${i}`} className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  i === timeline.length - 1 ? 'bg-[#B24724]' : 'bg-slate-300'
                }`}
              />
              <span className="text-[10px] text-slate-500 leading-none truncate max-w-[72px]">{stop}</span>
            </div>
          ))}
        </div>

        <div className="flex-grow flex items-end justify-center pb-1">
          <MilestoneProgressVisual progress={progress} />
        </div>
      </div>

      {footer}
    </motion.article>
  );
}

function MilestoneProgressVisual({ progress }: { progress: number }) {
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className="relative w-full max-w-[110px] h-12 select-none" aria-hidden="true">
      <svg viewBox="0 0 140 64" className="w-full h-full" fill="none">
        <rect x="8" y="28" width="124" height="28" rx="6" fill="#F3F1EC" stroke="#E6E4DD" strokeWidth="1.5" />
        <rect x="8" y="28" width={124 * (pct / 100)} height="28" rx="6" fill="#B24724" opacity="0.9" />
        <path
          d="M0 36 L8 32 L8 52 L0 56 Z"
          fill="#E6E4DD"
          stroke="#D0CEBE"
          strokeWidth="1"
        />
        <rect x="12" y="34" width={Math.max(0, 116 * (pct / 100))} height="16" rx="3" fill="#FFEDD5" opacity="0.5" />
        <circle cx="118" cy="22" r="10" fill="#F3F1EC" stroke="#E6E4DD" strokeWidth="1.5" />
        <circle cx="118" cy="22" r="4" fill="#B24724" opacity="0.6" />
        <rect x="100" y="18" width="28" height="14" rx="4" fill="#FAF9F6" stroke="#E6E4DD" strokeWidth="1" />
      </svg>
      <span className="absolute bottom-0 right-0 text-[10px] font-bold text-[#B24724]">{pct}%</span>
    </div>
  );
}

interface DashboardCardGridProps {
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function DashboardCardGrid({ children, emptyMessage, isEmpty }: DashboardCardGridProps) {
  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springDashboard}
        className="col-span-full py-16 text-center text-slate-400 text-sm"
      >
        {emptyMessage || 'No items found.'}
      </motion.div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

export function projectStatusToDashboard(status: string): DashboardStatus {
  if (status === 'active') return 'active';
  if (status === 'pending') return 'pending';
  if (status === 'completed') return 'completed';
  return 'inactive';
}

export function formatProjectCode(id: string): string {
  return `HW-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}
