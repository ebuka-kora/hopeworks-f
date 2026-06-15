import React from 'react';
import { Check, Circle } from 'lucide-react';
import { getPasswordChecklist } from '../lib/passwordPolicy';

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className = '' }: PasswordRequirementsProps) {
  const checklist = getPasswordChecklist(password);
  const showStatus = password.length > 0;

  return (
    <ul className={`space-y-1 ${className}`} aria-live="polite">
      {checklist.map(({ id, label, passed }) => (
        <li
          key={id}
          className={`flex items-start gap-2 text-[10px] leading-snug ${
            !showStatus
              ? 'text-slate-400'
              : passed
                ? 'text-emerald-700'
                : 'text-slate-500'
          }`}
        >
          {showStatus ? (
            passed ? (
              <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" aria-hidden />
            ) : (
              <Circle className="h-3 w-3 shrink-0 mt-0.5 text-slate-300" aria-hidden />
            )
          ) : (
            <span className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-300" aria-hidden>
              •
            </span>
          )}
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
