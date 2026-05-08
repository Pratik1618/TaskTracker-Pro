'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useTasks } from '@/lib/hooks/useTasks';
import { useWorkLog } from '@/lib/hooks/useWorkLog';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useAuth } from '@/lib/hooks/useAuth';
import { getLatestWorkLogEntry } from '@/lib/task-state';
import { Task, TaskDraft, WorkLogEntryDraft } from '@/lib/types';
import { LoginScreen } from '@/components/LoginScreen';

export default function Dashboard() {
  const {
    tasks,
    isLoaded: tasksLoaded,
    addTask,
    updateTask,
    deleteTask,
    getOverdueTasks,
  } = useTasks();

  const {
    entries: workLogEntries,
    isLoaded: workLogLoaded,
    addEntry,
    updateEntry,
    deleteEntry,
    calculateTotalHours,
  } = useWorkLog();

  const {
    profile: userProfile,
    updateProfile,
    isLoaded: profileLoaded,
  } = useUserProfile();

  const { isAuthenticated, isAuthLoaded, login, logout } = useAuth();

  const handleAddTask = (draft: TaskDraft) => {
    addTask(draft);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates, 'task');
  };

  const reconcileTaskAfterEntryRemoval = (
    taskId: string,
    removedEntryId: string,
    taskSnapshot?: Task
  ) => {
    const task = taskSnapshot ?? tasks.find((item) => item.id === taskId);
    if (!task || task.lastUpdatedSource !== 'worklog' || task.lastSyncedEntryId !== removedEntryId) {
      return;
    }

    const remainingEntries = workLogEntries.filter(
      (entry) => entry.id !== removedEntryId && entry.taskId === taskId
    );
    const nextEntry = getLatestWorkLogEntry(remainingEntries, taskId);

    if (nextEntry) {
      updateTask(
        taskId,
        {
          progress: nextEntry.progressPercentage,
          status: nextEntry.statusUpdate,
          lastSyncedEntryId: nextEntry.id,
        },
        'worklog'
      );
      return;
    }

    updateTask(
      taskId,
      {
        progress: 0,
        status: 'pending',
        lastSyncedEntryId: null,
      },
      'worklog'
    );
  };

  const handleAddWorkLogEntry = (draft: WorkLogEntryDraft) => {
    const entry = addEntry(draft);
    updateTask(
      draft.taskId,
      {
        progress: entry.progressPercentage,
        status: entry.statusUpdate,
        lastSyncedEntryId: entry.id,
      },
      'worklog'
    );
  };

  const handleUpdateWorkLogEntry = (id: string, updates: Partial<WorkLogEntryDraft>) => {
    const existingEntry = workLogEntries.find((entry) => entry.id === id);
    if (!existingEntry) {
      return;
    }

    const updatedEntry = updateEntry(id, updates);
    if (!updatedEntry) {
      return;
    }

    if (existingEntry.taskId !== updatedEntry.taskId) {
      reconcileTaskAfterEntryRemoval(existingEntry.taskId, existingEntry.id);
    }

    updateTask(
      updatedEntry.taskId,
      {
        progress: updatedEntry.progressPercentage,
        status: updatedEntry.statusUpdate,
        lastSyncedEntryId: updatedEntry.id,
      },
      'worklog'
    );
  };

  const handleDeleteWorkLogEntry = (id: string) => {
    const existingEntry = workLogEntries.find((entry) => entry.id === id);
    if (!existingEntry) {
      return;
    }

    deleteEntry(id);
    reconcileTaskAfterEntryRemoval(existingEntry.taskId, existingEntry.id);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  if (!tasksLoaded || !workLogLoaded || !profileLoaded || !isAuthLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Loading workspace
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <DashboardLayout
      tasks={tasks}
      workLogEntries={workLogEntries}
      userProfile={userProfile}
      onUpdateUserProfile={updateProfile}
      onAddTask={handleAddTask}
      onUpdateTask={handleUpdateTask}
      onDeleteTask={handleDeleteTask}
      onAddWorkLogEntry={handleAddWorkLogEntry}
      onUpdateWorkLogEntry={handleUpdateWorkLogEntry}
      onDeleteWorkLogEntry={handleDeleteWorkLogEntry}
      calculateTotalHours={calculateTotalHours}
      getOverdueTasks={getOverdueTasks}
      onLogout={logout}
    />
  );
}
