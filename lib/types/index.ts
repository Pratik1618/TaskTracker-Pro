export type Priority = 'normal' | 'medium' | 'critical';
export type Status = 'pending' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
export type AppView = 'dashboard' | 'tasks' | 'worklog';
export type TaskFilter = 'all' | 'active' | 'completed' | 'archived' | 'overdue' | Status;
export type TaskUpdateSource = 'task' | 'worklog';

export interface DateRange {
  fromDate: string;
  toDate: string;
}

export interface WorkLogFilter extends DateRange {
  taskId: string;
  status: Status | 'all';
}

export interface StatusSummary {
  pending: number;
  'in-progress': number;
  'on-hold': number;
  completed: number;
  cancelled: number;
}

export interface DashboardSummary {
  totalHours: number;
  taskCount: number;
  activeTaskCount: number;
  overdueCount: number;
  statusSummary: StatusSummary;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  avatar: string;
  managerName: string;
  managerEmail: string;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  expectedEndDate: string;
  progress: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  lastUpdatedSource?: TaskUpdateSource;
  lastSyncedEntryId?: string | null;
}

export interface WorkLogEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  remarks: string;
  progressPercentage: number;
  progressNotes: string;
  statusUpdate: Status;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDraft {
  title: string;
  priority: Priority;
  expectedEndDate: string;
  progress: number;
  status: Status;
}

export interface WorkLogEntryDraft {
  taskId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  remarks: string;
  progressPercentage: number;
  progressNotes: string;
  statusUpdate: Status;
}
