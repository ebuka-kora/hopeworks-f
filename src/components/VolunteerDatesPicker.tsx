import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

type PickerMode = 'dates' | 'range';

interface VolunteerDatesPickerProps {
  value: string[];
  onChange: (dates: string[]) => void;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

function expandRange(startIso: string, endIso: string): string[] {
  const start = parseIso(startIso);
  const end = parseIso(endIso);
  const [from, to] = start <= end ? [start, end] : [end, start];
  const dates: string[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    dates.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function formatDisplay(iso: string): string {
  return parseIso(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function groupConsecutiveDates(dates: string[]): Array<{ label: string; dates: string[] }> {
  if (dates.length === 0) return [];
  const sorted = [...dates].sort();
  const groups: Array<{ label: string; dates: string[] }> = [];
  let run: string[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = parseIso(sorted[i - 1]);
    const cur = parseIso(sorted[i]);
    const diffDays = (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      run.push(sorted[i]);
    } else {
      groups.push({
        dates: run,
        label:
          run.length > 1
            ? `${formatDisplay(run[0])} – ${formatDisplay(run[run.length - 1])}`
            : formatDisplay(run[0]),
      });
      run = [sorted[i]];
    }
  }

  groups.push({
    dates: run,
    label:
      run.length > 1
        ? `${formatDisplay(run[0])} – ${formatDisplay(run[run.length - 1])}`
        : formatDisplay(run[0]),
  });

  return groups;
}

export function VolunteerDatesPicker({ value, onChange }: VolunteerDatesPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [mode, setMode] = useState<PickerMode>('dates');
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(value), [value]);
  const grouped = useMemo(() => groupConsecutiveDates(value), [value]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setRangeStart(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];
    for (let i = 0; i < startOffset; i += 1) {
      const d = new Date(year, month, -startOffset + i + 1);
      cells.push({ iso: toIsoDate(d), day: d.getDate(), inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(year, month, day);
      cells.push({ iso: toIsoDate(d), day, inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const d = new Date(year, month + 1, cells.length - startOffset - daysInMonth + 1);
      cells.push({ iso: toIsoDate(d), day: d.getDate(), inMonth: false });
    }
    return cells;
  }, [viewMonth]);

  const mergeDates = (incoming: string[]) => {
    const merged = new Set([...value, ...incoming]);
    onChange([...merged].sort());
  };

  const removeGroup = (dates: string[]) => {
    const remove = new Set(dates);
    onChange(value.filter((d) => !remove.has(d)));
  };

  const handleDayClick = (iso: string) => {
    if (mode === 'dates') {
      if (selectedSet.has(iso)) {
        onChange(value.filter((d) => d !== iso));
      } else {
        mergeDates([iso]);
      }
      return;
    }

    if (!rangeStart) {
      setRangeStart(iso);
      return;
    }

    mergeDates(expandRange(rangeStart, iso));
    setRangeStart(null);
  };

  const isInPendingRange = (iso: string) => {
    if (!rangeStart || mode !== 'range') return false;
    return iso === rangeStart;
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-left flex items-center justify-between gap-3 hover:border-[#B24724]/40 focus:outline-none focus:border-[#B24724] focus:ring-2 focus:ring-[#B24724]/15 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-[#B24724] shrink-0" />
          <span className="text-sm font-sans text-slate-700 truncate">
            {value.length > 0
              ? `${value.length} date${value.length === 1 ? '' : 's'} selected`
              : 'Open calendar to pick dates or ranges'}
          </span>
        </div>
        <ChevronRight className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(['dates', 'range'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab);
                  setRangeStart(null);
                }}
                className={`flex-1 py-2.5 text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                  mode === tab
                    ? 'bg-[#B24724]/8 text-[#9A3412] font-bold'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab === 'dates' ? 'Single dates' : 'Date range'}
              </button>
            ))}
          </div>

          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-semibold text-slate-800 font-sans">{monthLabel}</p>
              <button
                type="button"
                onClick={() =>
                  setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {mode === 'range' && (
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                {rangeStart
                  ? `Start: ${formatDisplay(rangeStart)} — now tap the end date`
                  : 'Tap a start date, then tap an end date to add the full range.'}
              </p>
            )}

            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-[10px] font-mono text-slate-400 py-1">
                  {day}
                </div>
              ))}
              {calendarDays.map((cell) => {
                const selected = selectedSet.has(cell.iso);
                const pending = isInPendingRange(cell.iso);
                return (
                  <button
                    key={`${cell.iso}-${cell.inMonth}`}
                    type="button"
                    onClick={() => cell.inMonth && handleDayClick(cell.iso)}
                    disabled={!cell.inMonth}
                    className={`h-9 rounded-lg text-xs font-sans transition-colors cursor-pointer ${
                      !cell.inMonth
                        ? 'text-slate-300 cursor-default'
                        : selected
                          ? 'bg-[#B24724] text-white font-semibold'
                          : pending
                            ? 'bg-[#B24724]/20 text-[#9A3412] font-semibold ring-2 ring-[#B24724]/40'
                            : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {grouped.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {grouped.map((group) => (
            <span
              key={group.label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-900"
            >
              <Calendar className="h-3 w-3 shrink-0" />
              {group.label}
              <button
                type="button"
                onClick={() => removeGroup(group.dates)}
                className="p-0.5 rounded-full hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                aria-label={`Remove ${group.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
