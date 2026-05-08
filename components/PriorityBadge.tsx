'use client';

import { Priority } from '@/lib/types';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'normal':
        return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'medium':
        return 'border border-amber-200 bg-amber-50 text-amber-700';
      case 'critical':
        return 'border border-rose-200 bg-rose-50 text-rose-700';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'normal':
        return 'Normal';
      case 'medium':
        return 'Medium';
      case 'critical':
        return 'Critical';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getPriorityColor(priority)}`}
    >
      {getPriorityLabel(priority)}
    </span>
  );
}
