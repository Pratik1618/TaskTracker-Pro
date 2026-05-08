'use client';

import { useMemo, useState } from 'react';
import { Archive, PencilLine, Plus, Trash2 } from 'lucide-react';

import { formatDateValue } from '@/lib/date';
import { Task, TaskDraft, TaskFilter } from '@/lib/types';
import { ProgressBar } from '@/components/ProgressBar';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { TaskFormModal } from '@/components/TaskFormModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskListScreenProps {
  tasks: Task[];
  currentFilter: TaskFilter;
  overdueTaskIds: Set<string>;
  onFilterChange: (filter: TaskFilter) => void;
  onAddTask: (draft: TaskDraft) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onArchiveTask: (id: string, archived: boolean) => void;
  onDeleteTask: (id: string) => void;
  getTaskEntryCount: (taskId: string) => number;
}

const filterOptions: TaskFilter[] = [
  'all',
  'active',
  'pending',
  'in-progress',
  'on-hold',
  'completed',
  'cancelled',
  'overdue',
  'archived',
];

export function TaskListScreen({
  tasks,
  currentFilter,
  overdueTaskIds,
  onFilterChange,
  onAddTask,
  onUpdateTask,
  onArchiveTask,
  onDeleteTask,
  getTaskEntryCount,
}: TaskListScreenProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const emptyStateText = useMemo(() => {
    if (currentFilter === 'archived') {
      return 'No archived tasks yet.';
    }

    return 'No tasks match the current filter.';
  }, [currentFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            Task Registry
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Keep task state explicit before backend workflows arrive
          </h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Track deadlines, progress, and archive state without letting work-log history orphan tasks.
          </p>
        </div>

        <Button className="gap-2 self-start xl:self-auto" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((filter) => (
          <Button
            key={filter}
            variant={currentFilter === filter ? 'default' : 'outline'}
            className="capitalize"
            onClick={() => onFilterChange(filter)}
          >
            {filter.replace('-', ' ')}
          </Button>
        ))}
      </div>

      <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">{emptyStateText}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">End Date</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Entries</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const entryCount = getTaskEntryCount(task.id);
                    const isOverdue = overdueTaskIds.has(task.id);
                    const canDelete = entryCount === 0;

                    return (
                      <tr
                        key={task.id}
                        className={`border-t border-slate-200 ${
                          isOverdue ? 'bg-rose-50' : 'bg-transparent'
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900">{task.title}</p>
                              {task.archived ? (
                                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  Archived
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-slate-500">
                              Updated {new Date(task.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {formatDateValue(task.expectedEndDate)}
                        </td>
                        <td className="px-6 py-5">
                          <ProgressBar progress={task.progress} />
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">{entryCount}</td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTask(task)}
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onArchiveTask(task.id, !task.archived)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canDelete}
                              onClick={() => onDeleteTask(task.id)}
                              title={
                                canDelete
                                  ? 'Delete task'
                                  : 'Tasks with work log history must be archived instead'
                              }
                            >
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

      <TaskFormModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={onAddTask}
      />

      <TaskFormModal
        open={!!editingTask}
        task={editingTask}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null);
          }
        }}
        onSubmit={(draft) => {
          if (!editingTask) {
            return;
          }

          onUpdateTask(editingTask.id, draft);
          setEditingTask(null);
        }}
      />
    </div>
  );
}
