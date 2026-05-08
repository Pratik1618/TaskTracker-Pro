'use client';

import { useMemo, useState } from 'react';
import { addDays } from 'date-fns';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getLocalDateValue, isDateWithinRange } from '@/lib/date';
import { summarizeTaskStatuses } from '@/lib/task-state';
import {
  AppView,
  DashboardSummary,
  DateRange,
  Task,
  TaskDraft,
  TaskFilter,
  UserProfile,
  WorkLogEntry,
  WorkLogEntryDraft,
  WorkLogFilter,
} from '@/lib/types';
import { DashboardScreen } from '@/components/DashboardScreen';
import { SidebarNav } from '@/components/SidebarNav';
import { TaskListScreen } from '@/components/TaskListScreen';
import { WorkLogScreen } from '@/components/WorkLogScreen';

interface DashboardLayoutProps {
  tasks: Task[];
  workLogEntries: WorkLogEntry[];
  userProfile: UserProfile;
  onUpdateUserProfile: (updates: Partial<UserProfile>) => void;
  onAddTask: (draft: TaskDraft) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddWorkLogEntry: (draft: WorkLogEntryDraft) => void;
  onUpdateWorkLogEntry: (id: string, updates: Partial<WorkLogEntryDraft>) => void;
  onDeleteWorkLogEntry: (id: string) => void;
  calculateTotalHours: (startTime: string, endTime: string, breakDuration: number) => number;
  getOverdueTasks: () => Task[];
}

type DeleteDialogState =
  | {
      type: 'none';
    }
  | {
      type: 'task-blocked';
      taskId: string;
    }
  | {
      type: 'task-delete';
      taskId: string;
    }
  | {
      type: 'entry-delete';
      entryId: string;
    };

export function DashboardLayout({
  tasks,
  workLogEntries,
  userProfile,
  onUpdateUserProfile,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddWorkLogEntry,
  onUpdateWorkLogEntry,
  onDeleteWorkLogEntry,
  calculateTotalHours,
  getOverdueTasks,
}: DashboardLayoutProps) {
  const today = getLocalDateValue();
  const defaultStartDate = getLocalDateValue(addDays(new Date(), -2));
  const normalizeDateRange = <T extends DateRange>(range: T): T => {
    if (range.fromDate && range.toDate && range.fromDate > range.toDate) {
      return {
        ...range,
        fromDate: range.toDate,
        toDate: range.fromDate,
      } as T;
    }

    return range;
  };
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('active');
  const [dashboardRange, setDashboardRange] = useState<DateRange>({
    fromDate: defaultStartDate,
    toDate: today,
  });
  const [workLogFilter, setWorkLogFilter] = useState<WorkLogFilter>({
    fromDate: defaultStartDate,
    toDate: today,
    taskId: 'all',
    status: 'all',
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ type: 'none' });

  const activeTasks = useMemo(() => tasks.filter((task) => !task.archived), [tasks]);
  const overdueTasks = useMemo(() => getOverdueTasks(), [getOverdueTasks]);
  const overdueTaskIds = useMemo(() => new Set(overdueTasks.map((task) => task.id)), [overdueTasks]);

  const filteredTasks = useMemo(() => {
    switch (taskFilter) {
      case 'all':
        return tasks;
      case 'active':
        return tasks.filter((task) => !task.archived);
      case 'archived':
        return tasks.filter((task) => task.archived);
      case 'overdue':
        return tasks.filter((task) => overdueTaskIds.has(task.id));
      case 'completed':
      case 'pending':
      case 'in-progress':
      case 'on-hold':
      case 'cancelled':
        return tasks.filter((task) => task.status === taskFilter && !task.archived);
      default:
        return tasks;
    }
  }, [overdueTaskIds, taskFilter, tasks]);

  const dashboardEntries = useMemo(
    () =>
      workLogEntries.filter((entry) =>
        isDateWithinRange(entry.date, dashboardRange)
      ),
    [dashboardRange, workLogEntries]
  );

  const dashboardTaskIds = useMemo(
    () => new Set(dashboardEntries.map((entry) => entry.taskId)),
    [dashboardEntries]
  );

  const dashboardTasks = useMemo(
    () => tasks.filter((task) => dashboardTaskIds.has(task.id)),
    [dashboardTaskIds, tasks]
  );

  const filteredWorkLogEntries = useMemo(
    () =>
      workLogEntries
        .filter((entry) => isDateWithinRange(entry.date, workLogFilter))
        .filter((entry) => workLogFilter.taskId === 'all' || entry.taskId === workLogFilter.taskId)
        .filter((entry) => workLogFilter.status === 'all' || entry.statusUpdate === workLogFilter.status)
        .sort((left, right) => {
          const rightKey = `${right.date}-${right.updatedAt}`;
          const leftKey = `${left.date}-${left.updatedAt}`;
          return rightKey.localeCompare(leftKey);
        }),
    [workLogEntries, workLogFilter]
  );

  const dashboardSummary = useMemo<DashboardSummary>(() => {
    const totalHours = dashboardEntries.reduce((total, entry) => {
      return total + calculateTotalHours(entry.startTime, entry.endTime, entry.breakDuration);
    }, 0);

    return {
      totalHours,
      taskCount: dashboardTasks.length,
      activeTaskCount: dashboardTasks.filter(
        (task) => task.status !== 'completed' && task.status !== 'cancelled'
      ).length,
      overdueCount: dashboardTasks.filter((task) => overdueTaskIds.has(task.id)).length,
      statusSummary: summarizeTaskStatuses(dashboardTasks),
    };
  }, [calculateTotalHours, dashboardEntries, dashboardTasks, overdueTaskIds]);

  const filteredWorkLogTotal = useMemo(
    () =>
      filteredWorkLogEntries.reduce(
        (total, entry) =>
          total + calculateTotalHours(entry.startTime, entry.endTime, entry.breakDuration),
        0
      ),
    [calculateTotalHours, filteredWorkLogEntries]
  );

  const recentEntries = useMemo(
    () =>
      [...dashboardEntries]
        .sort((left, right) => {
          const rightKey = `${right.date}-${right.updatedAt}`;
          const leftKey = `${left.date}-${left.updatedAt}`;
          return rightKey.localeCompare(leftKey);
        })
        .slice(0, 6),
    [dashboardEntries]
  );

  const getTaskEntryCount = (taskId: string) =>
    workLogEntries.filter((entry) => entry.taskId === taskId).length;

  const handleArchiveTask = (taskId: string, archived: boolean) => {
    onUpdateTask(taskId, { archived });
  };

  const handleDeleteTask = (taskId: string) => {
    if (getTaskEntryCount(taskId) > 0) {
      setDeleteDialog({ type: 'task-blocked', taskId });
      return;
    }

    setDeleteDialog({ type: 'task-delete', taskId });
  };

  const handleDeleteEntry = (entryId: string) => {
    setDeleteDialog({ type: 'entry-delete', entryId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ type: 'none' });
  };

  const confirmDeleteDialog = () => {
    if (deleteDialog.type === 'task-delete') {
      onDeleteTask(deleteDialog.taskId);
    }

    if (deleteDialog.type === 'entry-delete') {
      onDeleteWorkLogEntry(deleteDialog.entryId);
    }

    closeDeleteDialog();
  };

  const dialogTask =
    deleteDialog.type === 'task-delete' || deleteDialog.type === 'task-blocked'
      ? tasks.find((task) => task.id === deleteDialog.taskId)
      : null;

  const dialogEntry =
    deleteDialog.type === 'entry-delete'
      ? workLogEntries.find((entry) => entry.id === deleteDialog.entryId)
      : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f7f9fc,_#eef3f8)] text-slate-900 lg:flex">
      <SidebarNav
        activeView={activeView}
        onViewChange={setActiveView}
        userProfile={userProfile}
        onUpdateProfile={onUpdateUserProfile}
      />

      <main className="flex-1">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 p-5 lg:p-8">
          {activeView === 'dashboard' ? (
            <DashboardScreen
              summary={dashboardSummary}
              dateRange={dashboardRange}
              overdueTasks={dashboardTasks.filter((task) => overdueTaskIds.has(task.id))}
              recentEntries={recentEntries}
              tasks={tasks}
              onDateRangeChange={(range) => setDashboardRange(normalizeDateRange(range))}
              calculateTotalHours={calculateTotalHours}
            />
          ) : null}

          {activeView === 'tasks' ? (
            <TaskListScreen
              tasks={filteredTasks}
              currentFilter={taskFilter}
              overdueTaskIds={overdueTaskIds}
              onFilterChange={setTaskFilter}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
              onArchiveTask={handleArchiveTask}
              onDeleteTask={handleDeleteTask}
              getTaskEntryCount={getTaskEntryCount}
            />
          ) : null}

          {activeView === 'worklog' ? (
            <WorkLogScreen
              entries={filteredWorkLogEntries}
              tasks={tasks}
              filters={workLogFilter}
              totalHours={filteredWorkLogTotal}
              onFilterChange={(filters) => setWorkLogFilter(normalizeDateRange(filters))}
              onAddEntry={onAddWorkLogEntry}
              onUpdateEntry={onUpdateWorkLogEntry}
              onDeleteEntry={handleDeleteEntry}
              onCalculateHours={calculateTotalHours}
            />
          ) : null}
        </div>
      </main>

      <AlertDialog open={deleteDialog.type !== 'none'} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <AlertDialogContent className="border-slate-200 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.type === 'task-blocked' && 'Task cannot be deleted'}
              {deleteDialog.type === 'task-delete' && 'Delete task?'}
              {deleteDialog.type === 'entry-delete' && 'Delete work log entry?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'task-blocked' &&
                `"${
                  dialogTask?.title ?? 'This task'
                }" already has work log history. Archive it instead to preserve past entries.`}
              {deleteDialog.type === 'task-delete' &&
                `This will permanently remove "${dialogTask?.title ?? 'this task'}". This action cannot be undone.`}
              {deleteDialog.type === 'entry-delete' &&
                `This will permanently remove the work log entry for ${
                  dialogEntry ? `${dialogEntry.date} (${dialogEntry.startTime} - ${dialogEntry.endTime})` : 'the selected time entry'
                }.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {deleteDialog.type === 'task-blocked' ? (
              <AlertDialogAction onClick={closeDeleteDialog}>OK</AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-200"
                  onClick={confirmDeleteDialog}
                >
                  Delete
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
