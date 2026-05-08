'use client';

import { useEffect, useMemo, useState } from 'react';

import { getLocalDateValue } from '@/lib/date';
import { clampProgress } from '@/lib/task-state';
import { Status, Task, WorkLogEntry, WorkLogEntryDraft } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface WorkLogFormModalProps {
  open: boolean;
  entry?: WorkLogEntry | null;
  tasks: Task[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: WorkLogEntryDraft) => void;
}

const DEFAULT_ENTRY_DRAFT: WorkLogEntryDraft = {
  taskId: '',
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  breakDuration: 0,
  remarks: '',
  progressPercentage: 0,
  progressNotes: '',
  statusUpdate: 'pending',
};

export function WorkLogFormModal({
  open,
  entry,
  tasks,
  onOpenChange,
  onSubmit,
}: WorkLogFormModalProps) {
  const [draft, setDraft] = useState<WorkLogEntryDraft>(DEFAULT_ENTRY_DRAFT);

  const modalTitle = useMemo(() => (entry ? 'Edit Work Log Entry' : 'Add Work Log Entry'), [entry]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (entry) {
      setDraft({
        taskId: entry.taskId,
        date: entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        breakDuration: entry.breakDuration,
        remarks: entry.remarks,
        progressPercentage: entry.progressPercentage,
        progressNotes: entry.progressNotes,
        statusUpdate: entry.statusUpdate,
      });
      return;
    }

    setDraft({
      ...DEFAULT_ENTRY_DRAFT,
      taskId: tasks[0]?.id ?? '',
      date: getLocalDateValue(),
      statusUpdate: tasks[0]?.status ?? 'pending',
      progressPercentage: tasks[0]?.progress ?? 0,
    });
  }, [entry, open, tasks]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.taskId || !draft.date || !draft.startTime || !draft.endTime) {
      return;
    }

    const progressPercentage = clampProgress(draft.progressPercentage);
    const statusUpdate: Status =
      progressPercentage === 100 && draft.statusUpdate !== 'cancelled'
        ? 'completed'
        : draft.statusUpdate;

    onSubmit({
      ...draft,
      breakDuration: Math.max(0, draft.breakDuration),
      progressPercentage,
      statusUpdate,
      remarks: draft.remarks.trim(),
      progressNotes: draft.progressNotes.trim(),
    });
    onOpenChange(false);
  };

  const hasTasks = tasks.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-200 bg-white text-slate-900 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            Log the date, time window, and progress update attached to a task.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Task</label>
              <Select
                disabled={!hasTasks}
                value={draft.taskId}
                onValueChange={(value) => setDraft((current) => ({ ...current, taskId: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date</label>
              <Input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Start Time</label>
              <Input
                type="time"
                value={draft.startTime}
                onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">End Time</label>
              <Input
                type="time"
                value={draft.endTime}
                onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Break (Minutes)</label>
              <Input
                type="number"
                min="0"
                value={draft.breakDuration}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    breakDuration: Math.max(0, Number(event.target.value)),
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status Update</label>
              <Select
                value={draft.statusUpdate}
                onValueChange={(value) => setDraft((current) => ({ ...current, statusUpdate: value as Status }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Progress Percentage</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={draft.progressPercentage}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    progressPercentage: clampProgress(Number(event.target.value)),
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Progress Notes</label>
            <Textarea
              value={draft.progressNotes}
              onChange={(event) => setDraft((current) => ({ ...current, progressNotes: event.target.value }))}
              placeholder="Describe what was completed and what remains."
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Remarks</label>
            <Textarea
              value={draft.remarks}
              onChange={(event) => setDraft((current) => ({ ...current, remarks: event.target.value }))}
              placeholder="Add blockers, context, or follow-up notes."
              className="min-h-20"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={!hasTasks} type="submit">
              {entry ? 'Save Entry' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
