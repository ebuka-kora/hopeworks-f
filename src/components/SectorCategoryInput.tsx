import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

export const SECTOR_CATEGORY_SUGGESTIONS = [
  'Water & Sanitation',
  'Solar Energy',
  'Education Kits',
  'Conservation',
  'Healthcare',
  'Education',
  'Environment',
  'Community Development',
  'Agriculture & Food',
  'Renewable Energy',
  'Emergency Relief',
  'Faith & Outreach',
  'Creative Arts',
  'Sports & Recreation',
  'Technology & Innovation',
  'Housing & Shelter',
  'Women & Youth',
  'Animal Welfare',
  'Marine & Ocean',
  'Public Health',
] as const;

interface SectorCategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SectorCategoryInput({
  value,
  onChange,
  placeholder = 'Type your sector or pick a suggestion',
}: SectorCategoryInputProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = value.trim();
  const query = value.toLowerCase();

  const matches = useMemo(() => {
    if (!query) return [...SECTOR_CATEGORY_SUGGESTIONS];
    return SECTOR_CATEGORY_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [query]);

  const showCustomOption =
    trimmed.length > 0 &&
    !SECTOR_CATEGORY_SUGGESTIONS.some((item) => item.toLowerCase() === query);

  const options = showCustomOption
    ? [`Use "${trimmed}" as custom sector`, ...matches]
    : matches;

  useEffect(() => {
    setHighlightIndex(0);
  }, [value, open]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const selectOption = (option: string) => {
    if (option.startsWith('Use "') && option.endsWith('" as custom sector')) {
      onChange(trimmed);
    } else {
      onChange(option);
    }
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter' && options.length > 0) {
      event.preventDefault();
      selectOption(options[highlightIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-3 py-2.5 pr-10 border border-slate-200 outline-none rounded-xl font-sans text-sm bg-white focus:border-[#B24724] focus:ring-2 focus:ring-[#B24724]/15 transition-colors"
        />
        <button
          type="button"
          aria-label="Show sector suggestions"
          onClick={() => {
            setOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-[#B24724] hover:bg-[#B24724]/5 cursor-pointer transition-colors"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Suggestions · or type your own
            </p>
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {options.length === 0 ? (
              <li className="px-3 py-2.5 text-xs text-slate-500 font-sans">
                No matches — your typed sector will be saved as custom.
              </li>
            ) : (
              options.map((option, index) => {
                const isCustom = option.startsWith('Use "');
                const isActive = index === highlightIndex;

                return (
                  <li key={option}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectOption(option)}
                      className={`w-full text-left px-3 py-2.5 text-sm font-sans flex items-center gap-2 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#B24724]/8 text-[#9A3412]'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isCustom && <Plus className="h-3.5 w-3.5 shrink-0 text-[#B24724]" />}
                      <span className={isCustom ? 'font-medium' : ''}>{option}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
