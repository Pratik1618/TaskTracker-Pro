'use client';

import { Clock3, ListChecks, PauseCircle, PlayCircle, Slash, Target } from 'lucide-react';

import { DashboardSummary } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryPanelProps {
  summary: DashboardSummary;
  rangeLabel: string;
}

const cardStyles = [
  {
    label: 'Hours Logged',
    accent: 'from-sky-100 to-transparent',
    icon: Clock3,
    suffix: 'h',
    getValue: (summary: DashboardSummary) => summary.totalHours.toFixed(2),
  },
  {
    label: 'Pending',
    accent: 'from-slate-100 to-transparent',
    icon: Target,
    getValue: (summary: DashboardSummary) => `${summary.statusSummary.pending}`,
  },
  {
    label: 'In Progress',
    accent: 'from-blue-100 to-transparent',
    icon: PlayCircle,
    getValue: (summary: DashboardSummary) => `${summary.statusSummary['in-progress']}`,
  },
  {
    label: 'On Hold',
    accent: 'from-amber-100 to-transparent',
    icon: PauseCircle,
    getValue: (summary: DashboardSummary) => `${summary.statusSummary['on-hold']}`,
  },
  {
    label: 'Completed',
    accent: 'from-emerald-100 to-transparent',
    icon: ListChecks,
    getValue: (summary: DashboardSummary) => `${summary.statusSummary.completed}`,
  },
  {
    label: 'Cancelled',
    accent: 'from-rose-100 to-transparent',
    icon: Slash,
    getValue: (summary: DashboardSummary) => `${summary.statusSummary.cancelled}`,
  },
] as const;

export function SummaryPanel({ summary, rangeLabel }: SummaryPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {cardStyles.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.label}
            className="overflow-hidden border-slate-200 bg-white text-slate-900 shadow-sm"
          >
            <CardContent className="relative p-5">
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${item.accent}`} />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </p>
                  <Icon className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-3xl font-semibold text-slate-900">
                    {item.getValue(summary)}
                    {'suffix' in item ? item.suffix : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{rangeLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
