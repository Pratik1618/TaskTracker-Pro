'use client';

import { Status } from '@/lib/types';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'pending':
        return 'border border-slate-200 bg-slate-50 text-slate-700';
      case 'in-progress':
        return 'border border-blue-200 bg-blue-50 text-blue-700';
      case 'on-hold':
        return 'border border-amber-200 bg-amber-50 text-amber-700';
      case 'completed':
        return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'cancelled':
        return 'border border-rose-200 bg-rose-50 text-rose-700';
    }
  };

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'on-hold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
