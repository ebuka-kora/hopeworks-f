import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { UserRole } from '../types';

interface RoleGateProps {
  allowedRoles: UserRole[];
  userRoles: UserRole[];
  children: React.ReactNode;
  message?: string;
  compact?: boolean;
}

export function RoleGate({
  allowedRoles,
  userRoles,
  children,
  message,
  compact = false,
}: RoleGateProps) {
  const allowed = allowedRoles.some((r) => userRoles.includes(r));

  if (allowed) return <>{children}</>;

  const defaultMessage = `This area requires one of these roles: ${allowedRoles.join(', ')}.`;

  if (compact) {
    return (
      <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        {message || defaultMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="p-3 rounded-xl bg-orange-50 text-[#B24724] mb-3">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-800">Access restricted</p>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{message || defaultMessage}</p>
    </div>
  );
}
