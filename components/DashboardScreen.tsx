'use client';

import { Clock3, OctagonAlert, Sparkles } from 'lucide-react';

import { formatDateValue, getDateRangeLabel } from '@/lib/date';
import { DashboardSummary, DateRange, Task, WorkLogEntry } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { SummaryPanel } from '@/components/SummaryPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ProgressBar';

interface DashboardScreenProps {
  summary: DashboardSummary;
  dateRange: DateRange;
  overdueTasks: Task[];
  recentEntries: WorkLogEntry[];
  tasks: Task[];
  onDateRangeChange: (range: DateRange) => void;
  calculateTotalHours: (startTime: string, endTime: string, breakDuration: number) => number;
}

export function DashboardScreen({
  summary,
  dateRange,
  overdueTasks,
  recentEntries,
  tasks,
  onDateRangeChange,
  calculateTotalHours,
}: DashboardScreenProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            Dashboard
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Daily task overview
          </h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Monitor workload, recent updates, and delivery pressure across the selected date range.
          </p>
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              From
            </label>
            <input
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              type="date"
              value={dateRange.fromDate}
              onChange={(event) =>
                onDateRangeChange({ ...dateRange, fromDate: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              To
            </label>
            <input
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              type="date"
              value={dateRange.toDate}
              onChange={(event) =>
                onDateRangeChange({ ...dateRange, toDate: event.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {getDateRangeLabel(dateRange)}
            </div>
          </div>
        </div>
      </div>

      <SummaryPanel summary={summary} rangeLabel={getDateRangeLabel(dateRange)} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock3 className="h-4 w-4 text-sky-700" />
              Recent Work Log Entries
            </CardTitle>
            <CardDescription>
              Latest updates within {getDateRangeLabel(dateRange)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEntries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No work log activity in this range yet.
              </div>
            ) : (
              recentEntries.map((entry) => {
                const task = tasks.find((item) => item.id === entry.taskId);
                const totalHours = calculateTotalHours(entry.startTime, entry.endTime, entry.breakDuration);

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{task?.title ?? 'Archived task'}</p>
                        <p className="text-sm text-slate-500">
                          {formatDateValue(entry.date)} | {entry.startTime} - {entry.endTime} | {totalHours.toFixed(2)}h
                        </p>
                      </div>
                      <StatusBadge status={entry.statusUpdate} />
                    </div>
                    <div className="mt-3">
                      <ProgressBar progress={entry.progressPercentage} />
                    </div>
                    {entry.progressNotes ? (
                      <p className="mt-3 text-sm text-slate-600">{entry.progressNotes}</p>
                    ) : null}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <OctagonAlert className="h-4 w-4 text-rose-600" />
                Overdue Tasks
              </CardTitle>
              <CardDescription>Tasks past expected end date and not completed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueTasks.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No overdue work right now.
                </p>
              ) : (
                overdueTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{task.title}</p>
                        <p className="text-sm text-rose-700">
                          Due {formatDateValue(task.expectedEndDate)}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-4 w-4 text-sky-700" />
                Focus Snapshot
              </CardTitle>
              <CardDescription>High-level view of the current task book.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Active Tasks In Range</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.activeTaskCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Tasks With Activity</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.taskCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Overdue In Range</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.overdueCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
