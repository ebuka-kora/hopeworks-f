import React from 'react';

type StatusType = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'active' | 'completed' | 'none';

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let bg = 'bg-gray-100 text-gray-800 border-gray-200';
  let dot = 'bg-gray-400';
  let label = status.replace('_', ' ');

  switch (status) {
    case 'pending':
      bg = 'bg-orange-50 text-orange-850 border-orange-200/60';
      dot = 'bg-orange-500';
      label = 'Pending';
      break;
    case 'in_progress':
      bg = 'bg-blue-50 text-blue-800 border-blue-200/60';
      dot = 'bg-blue-500';
      label = 'In Progress';
      break;
    case 'submitted':
      bg = 'bg-purple-50 text-purple-800 border-purple-200/60';
      dot = 'bg-purple-500';
      label = 'Under Audit';
      break;
    case 'approved':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
      dot = 'bg-emerald-500';
      label = 'Verified & Released';
      break;
    case 'rejected':
      bg = 'bg-rose-50 text-rose-800 border-rose-200/60';
      dot = 'bg-rose-500';
      label = 'Revision Requested';
      break;
    case 'active':
      bg = 'bg-teal-50 text-teal-800 border-teal-200/60';
      dot = 'bg-teal-500';
      label = 'Active Campaign';
      break;
    case 'completed':
      bg = 'bg-indigo-50 text-indigo-800 border-indigo-200/60';
      dot = 'bg-indigo-500';
      label = 'Fully Completed';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border capitalize tracking-wider ${bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
