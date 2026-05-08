import {
  Status,
  StatusSummary,
  Task,
  TaskDraft,
  TaskUpdateSource,
  WorkLogEntry,
  WorkLogEntryDraft,
} from '@/lib/types';

export const DEFAULT_STATUS_SUMMARY: StatusSummary = {
  pending: 0,
  'in-progress': 0,
  'on-hold': 0,
  completed: 0,
  cancelled: 0,
};

export function clampProgress(progress: number): number {
  if (Number.isNaN(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
}

export function normalizeTaskStatus(status: Status, progress: number): Status {
  if (status === 'completed') {
    return 'completed';
  }

  if (progress >= 100) {
    return 'completed';
  }

  if (status === 'pending' && progress > 0) {
    return 'in-progress';
  }

  return status;
}

export function applyTaskRules(
  currentTask: Task | null,
  updates: Partial<Task>,
  source: TaskUpdateSource,
  timestamp: string,
  lastSyncedEntryId?: string | null
): Task {
  const nextProgress = clampProgress(updates.progress ?? currentTask?.progress ?? 0);
  const nextStatus = normalizeTaskStatus(
    updates.status ?? currentTask?.status ?? 'pending',
    nextProgress
  );

  return {
    id: currentTask?.id ?? timestamp,
    title: updates.title ?? currentTask?.title ?? '',
    priority: updates.priority ?? currentTask?.priority ?? 'normal',
    expectedEndDate: updates.expectedEndDate ?? currentTask?.expectedEndDate ?? '',
    progress: nextStatus === 'completed' ? 100 : nextProgress,
    status: nextStatus,
    createdAt: currentTask?.createdAt ?? timestamp,
    updatedAt: timestamp,
    archived: updates.archived ?? currentTask?.archived ?? false,
    lastUpdatedSource: source,
    lastSyncedEntryId:
      source === 'worklog'
        ? lastSyncedEntryId ?? currentTask?.lastSyncedEntryId ?? null
        : currentTask?.lastSyncedEntryId ?? null,
  };
}

export function normalizeTask(task: Partial<Task>): Task {
  const createdAt = task.createdAt ?? new Date().toISOString();
  const updatedAt = task.updatedAt ?? createdAt;

  return applyTaskRules(
    {
      id: task.id ?? createdAt,
      title: task.title ?? '',
      priority: task.priority ?? 'normal',
      expectedEndDate: task.expectedEndDate ?? '',
      progress: clampProgress(task.progress ?? 0),
      status: task.status ?? 'pending',
      createdAt,
      updatedAt,
      archived: task.archived ?? false,
      lastUpdatedSource: task.lastUpdatedSource ?? 'task',
      lastSyncedEntryId: task.lastSyncedEntryId ?? null,
    },
    {
      title: task.title ?? '',
      priority: task.priority ?? 'normal',
      expectedEndDate: task.expectedEndDate ?? '',
      progress: task.progress ?? 0,
      status: task.status ?? 'pending',
    },
    task.lastUpdatedSource ?? 'task',
    updatedAt,
    task.lastSyncedEntryId ?? null
  );
}

export function normalizeWorkLogEntry(entry: Partial<WorkLogEntry>): WorkLogEntry {
  const createdAt = entry.createdAt ?? new Date().toISOString();
  const updatedAt = entry.updatedAt ?? createdAt;

  return {
    id: entry.id ?? createdAt,
    taskId: entry.taskId ?? '',
    startTime: entry.startTime ?? '09:00',
    endTime: entry.endTime ?? '10:00',
    breakDuration: Math.max(0, entry.breakDuration ?? 0),
    remarks: entry.remarks ?? '',
    progressPercentage: clampProgress(entry.progressPercentage ?? 0),
    progressNotes: entry.progressNotes ?? '',
    statusUpdate: entry.statusUpdate ?? 'pending',
    date: entry.date ?? '',
    createdAt,
    updatedAt,
  };
}

export function buildWorkLogEntry(
  draft: WorkLogEntryDraft,
  existingEntry?: WorkLogEntry
): WorkLogEntry {
  const timestamp = new Date().toISOString();

  return normalizeWorkLogEntry({
    ...existingEntry,
    ...draft,
    id: existingEntry?.id ?? timestamp,
    createdAt: existingEntry?.createdAt ?? timestamp,
    updatedAt: timestamp,
  });
}

export function getLatestWorkLogEntry(entries: WorkLogEntry[], taskId: string): WorkLogEntry | null {
  const taskEntries = entries.filter((entry) => entry.taskId === taskId);

  if (taskEntries.length === 0) {
    return null;
  }

  return [...taskEntries].sort((left, right) => {
    const rightValue = right.updatedAt ?? right.createdAt;
    const leftValue = left.updatedAt ?? left.createdAt;
    return rightValue.localeCompare(leftValue);
  })[0];
}

export function summarizeTaskStatuses(tasks: Task[]): StatusSummary {
  return tasks.reduce<StatusSummary>((summary, task) => {
    summary[task.status] += 1;
    return summary;
  }, { ...DEFAULT_STATUS_SUMMARY });
}
