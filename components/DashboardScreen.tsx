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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">
            Dashboard
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Daily task overview
          </h2>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Monitor workload, recent updates, and delivery pressure across the selected date range.
          </p>
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm md:grid-cols-2 transition-colors duration-200">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              From
            </label>
            <input
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-50 transition-colors duration-200"
              type="date"
              value={dateRange.fromDate}
              onChange={(event) =>
                onDateRangeChange({ ...dateRange, fromDate: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              To
            </label>
            <input
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-50 transition-colors duration-200"
              type="date"
              value={dateRange.toDate}
              onChange={(event) =>
                onDateRangeChange({ ...dateRange, toDate: event.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">
              {getDateRangeLabel(dateRange)}
            </div>
          </div>
        </div>
      </div>

      <SummaryPanel summary={summary} rangeLabel={getDateRangeLabel(dateRange)} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm transition-colors duration-200">
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
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-6 text-sm text-slate-500 dark:text-slate-400">
                No work log activity in this range yet.
              </div>
            ) : (
              recentEntries.map((entry) => {
                const task = tasks.find((item) => item.id === entry.taskId);
                const totalHours = calculateTotalHours(entry.startTime, entry.endTime, entry.breakDuration);

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 transition-colors duration-200"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-slate-50">{task?.title ?? 'Archived task'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDateValue(entry.date)} | {entry.startTime} - {entry.endTime} | {totalHours.toFixed(2)}h
                        </p>
                      </div>
                      <StatusBadge status={entry.statusUpdate} />
                    </div>
                    <div className="mt-3">
                      <ProgressBar progress={entry.progressPercentage} />
                    </div>
                    {entry.progressNotes ? (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{entry.progressNotes}</p>
                    ) : null}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm transition-colors duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <OctagonAlert className="h-4 w-4 text-rose-600" />
                Overdue Tasks
              </CardTitle>
              <CardDescription>Tasks past expected end date and not completed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueTasks.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-4 text-sm text-slate-500 dark:text-slate-400">
                  No overdue work right now.
                </p>
              ) : (
                overdueTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-4 transition-colors duration-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">{task.title}</p>
                        <p className="text-sm text-rose-700 dark:text-rose-400">
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

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm transition-colors duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-4 w-4 text-sky-700" />
                Focus Snapshot
              </CardTitle>
              <CardDescription>High-level view of the current task book.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 transition-colors duration-200">
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Tasks In Range</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">{summary.activeTaskCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 transition-colors duration-200">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tasks With Activity</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">{summary.taskCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 transition-colors duration-200">
                <p className="text-sm text-slate-500 dark:text-slate-400">Overdue In Range</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">{summary.overdueCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
