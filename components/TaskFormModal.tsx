'use client';

import { useEffect, useMemo, useState } from 'react';

import { Priority, Status, Task, TaskDraft } from '@/lib/types';
import { clampProgress } from '@/lib/task-state';
import { getLocalDateValue } from '@/lib/date';
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

interface TaskFormModalProps {
  open: boolean;
  task?: Task | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: TaskDraft) => void;
}

const DEFAULT_DRAFT: TaskDraft = {
  title: '',
  priority: 'normal',
  expectedEndDate: '',
  progress: 0,
  status: 'pending',
};

export function TaskFormModal({ open, task, onOpenChange, onSubmit }: TaskFormModalProps) {
  const [draft, setDraft] = useState<TaskDraft>(DEFAULT_DRAFT);

  const modalTitle = useMemo(() => (task ? 'Edit Task' : 'Create Task'), [task]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (task) {
      setDraft({
        title: task.title,
        priority: task.priority,
        expectedEndDate: task.expectedEndDate,
        progress: task.progress,
        status: task.status,
      });
      return;
    }

    setDraft({
      ...DEFAULT_DRAFT,
      expectedEndDate: getLocalDateValue(),
    });
  }, [open, task]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.title.trim() || !draft.expectedEndDate) {
      return;
    }

    const progress = clampProgress(draft.progress);
    const status: Status = progress === 100 && draft.status !== 'cancelled' ? 'completed' : draft.status;

    onSubmit({
      ...draft,
      title: draft.title.trim(),
      progress,
      status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-200 bg-white text-slate-900 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            Maintain task ownership, delivery dates, and progress before backend integration.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Task Title</label>
            <Input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Enter a clear task title"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Priority</label>
              <Select
                value={draft.priority}
                onValueChange={(value) => setDraft((current) => ({ ...current, priority: value as Priority }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Expected End Date</label>
              <Input
                type="date"
                value={draft.expectedEndDate}
                onChange={(event) => setDraft((current) => ({ ...current, expectedEndDate: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Progress</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={draft.progress}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    progress: clampProgress(Number(event.target.value)),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select
                value={draft.status}
                onValueChange={(value) => setDraft((current) => ({ ...current, status: value as Status }))}
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{task ? 'Save Task' : 'Create Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
