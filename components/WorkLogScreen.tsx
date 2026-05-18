'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { FileSpreadsheet, Mail, PencilLine, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { formatDateValue } from '@/lib/date';
import { parseWorkLogImportRows } from '@/lib/worklog-import';
import { Status, Task, UserProfile, WorkLogEntry, WorkLogEntryDraft, WorkLogFilter } from '@/lib/types';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusBadge } from '@/components/StatusBadge';
import { WorkLogFormModal } from '@/components/WorkLogFormModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkLogScreenProps {
  entries: WorkLogEntry[];
  tasks: Task[];
  filters: WorkLogFilter;
  totalHours: number;
  onFilterChange: (filters: WorkLogFilter) => void;
  onAddEntry: (draft: WorkLogEntryDraft) => void;
  onImportEntries: (drafts: WorkLogEntryDraft[]) => void;
  onUpdateEntry: (id: string, updates: Partial<WorkLogEntryDraft>) => void;
  onDeleteEntry: (id: string) => void;
  onCalculateHours: (startTime: string, endTime: string, breakDuration: number) => number;
  userProfile: UserProfile;
}

export function WorkLogScreen({
  entries,
  tasks,
  filters,
  totalHours,
  onFilterChange,
  onAddEntry,
  onImportEntries,
  onUpdateEntry,
  onDeleteEntry,
  onCalculateHours,
  userProfile,
}: WorkLogScreenProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkLogEntry | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeTasks = useMemo(() => tasks.filter((task) => !task.archived), [tasks]);

  const generateEmail = () => {
    const recipient = userProfile.managerEmail?.trim();
    const ccRecipient = ''; // Add your CC email address here, e.g. 'team-lead@example.com'
    const subject = 'Work Log Report';
    let body = '';
    if (userProfile.managerName) {
      body += `Hi ${userProfile.managerName},\n\n`;
    }
    body += 'Please find the latest work log below.\n\n';

    entries.forEach((entry) => {
      const task = tasks.find((t) => t.id === entry.taskId);
      const hours = onCalculateHours(entry.startTime, entry.endTime, entry.breakDuration).toFixed(2);
      const notes = [entry.progressNotes, entry.remarks].filter(Boolean).join(' | ');

      body += `Date:   ${formatDateValue(entry.date)}\n`;
      body += `Task:   ${task?.title ?? 'Archived task'}\n`;
      body += `Time:   ${entry.startTime} - ${entry.endTime} (${hours}h)\n`;
      body += `Status: ${entry.statusUpdate.replace('-', ' ')} (${entry.progressPercentage}%)\n`;
      if (notes) {
        body += `Notes:  ${notes}\n`;
      }
      body += `----------------------------------------\n\n`;
    });

    body += `Total Hours: ${totalHours.toFixed(2)}h\n\n`;
    body += 'Regards,\n';
    body += `${userProfile.fullName || 'Team Member'}\n`;

    const toValue = recipient ? `mailto:${encodeURIComponent(recipient)}` : 'mailto:';
    const ccValue = ccRecipient ? `&cc=${encodeURIComponent(ccRecipient)}` : '';
    const mailto = `${toValue}?subject=${encodeURIComponent(subject)}${ccValue}&body=${encodeURIComponent(body)}`;
    window.open(mailto);
  };

  const statusOptions: Array<Status | 'all'> = [
    'all',
    'pending',
    'in-progress',
    'on-hold',
    'completed',
    'cancelled',
  ];

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (tasks.length === 0) {
      toast.error('Create at least one task before importing work logs.');
      return;
    }

    setIsImporting(true);

    try {
      const buffer = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];

      if (!firstSheet) {
        toast.error('The selected file does not contain a readable worksheet.');
        return;
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
        defval: '',
      });

      if (rows.length === 0) {
        toast.error('The selected file is empty.');
        return;
      }

      const { drafts, errors } = parseWorkLogImportRows(rows, tasks);

      if (drafts.length > 0) {
        onImportEntries(drafts);
      }

      if (drafts.length > 0 && errors.length === 0) {
        toast.success(`Imported ${drafts.length} work log entr${drafts.length === 1 ? 'y' : 'ies'}.`);
        return;
      }

      if (drafts.length > 0) {
        toast.warning(
          `Imported ${drafts.length} entr${drafts.length === 1 ? 'y' : 'ies'}. ${errors.length} row${errors.length === 1 ? '' : 's'} were skipped.`
        );
        return;
      }

      toast.error(errors[0] ?? 'No valid work log rows were found in the file.');
    } catch (error) {
      console.error('Failed to import work log file:', error);
      toast.error('The file could not be imported. Check the Excel format and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            Work Log
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Work log history
          </h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Filter history, update task progress from entries, and keep a realistic local audit trail.
          </p>
        </div>

        <div className="flex flex-col gap-2 self-start xl:items-end xl:self-auto">
          <div className="flex gap-2">
            <Button className="gap-2" disabled={activeTasks.length === 0} onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
            <Button
              className="gap-2"
              variant="outline"
              disabled={tasks.length === 0 || isImporting}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Upload Excel'}
            </Button>
            <Button
              className="gap-2"
              variant="outline"
              disabled={!userProfile.managerEmail?.trim()}
              onClick={generateEmail}
            >
              <Mail className="h-4 w-4" />
              Send to Outlook
            </Button>
          </div>
          {!userProfile.managerEmail?.trim() ? (
            <p className="text-xs text-slate-500">
              Set a manager email in your profile so this button can auto-fill the recipient.
            </p>
          ) : null}
            <p className="max-w-[44rem] text-xs text-slate-500 xl:text-right">
              Excel import supports headers like Task or Task ID, Date, Start Time, End Time, Break, Progress, Status, Progress Notes, and Remarks.
            </p>
          <input
            ref={fileInputRef}
            hidden
            accept=".xlsx,.xls,.csv"
            type="file"
            onChange={handleImportFile}
          />
        </div>
      </div>

      <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              From
            </label>
            <input
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              type="date"
              value={filters.fromDate}
              onChange={(event) => onFilterChange({ ...filters, fromDate: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              To
            </label>
            <input
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              type="date"
              value={filters.toDate}
              onChange={(event) => onFilterChange({ ...filters, toDate: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Task
            </label>
            <Select
              value={filters.taskId}
              onValueChange={(value) => onFilterChange({ ...filters, taskId: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange({ ...filters, status: value as Status | 'all' })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg">Entries</CardTitle>
            <p className="text-sm text-slate-500">Total hours in view: {totalHours.toFixed(2)}h</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              {tasks.length === 0
                ? 'Create a task first, then log work against it.'
                : 'No work log entries match the selected filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-280">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Break</th>
                    <th className="px-6 py-4">Hours</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Notes</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const task = tasks.find((item) => item.id === entry.taskId);
                    const totalHoursForEntry = onCalculateHours(
                      entry.startTime,
                      entry.endTime,
                      entry.breakDuration
                    );

                    return (
                      <tr key={entry.id} className="border-t border-slate-200 align-top">
                        <td className="px-6 py-5 text-sm text-slate-600">{formatDateValue(entry.date)}</td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{task?.title ?? 'Archived task'}</p>
                            <p className="text-xs text-slate-500">
                              Updated {new Date(entry.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {entry.startTime} - {entry.endTime}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">{entry.breakDuration} min</td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {totalHoursForEntry.toFixed(2)}h
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={entry.statusUpdate} />
                        </td>
                        <td className="px-6 py-5 min-w-56">
                          <ProgressBar progress={entry.progressPercentage} />
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          <div className="max-w-xs space-y-2">
                            {entry.progressNotes ? <p>{entry.progressNotes}</p> : null}
                            {entry.remarks ? <p className="text-slate-500">{entry.remarks}</p> : null}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingEntry(entry)}>
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onDeleteEntry(entry.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <WorkLogFormModal
        open={isCreateOpen}
        tasks={activeTasks}
        onOpenChange={setIsCreateOpen}
        onSubmit={onAddEntry}
      />

      <WorkLogFormModal
        open={!!editingEntry}
        entry={editingEntry}
        tasks={tasks}
        onOpenChange={(open) => {
          if (!open) {
            setEditingEntry(null);
          }
        }}
        onSubmit={(draft) => {
          if (!editingEntry) {
            return;
          }

          onUpdateEntry(editingEntry.id, draft);
          setEditingEntry(null);
        }}
      />
    </div>
  );
}
