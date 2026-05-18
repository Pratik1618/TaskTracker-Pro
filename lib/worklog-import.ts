import { WorkLogEntryDraft, Task, Status } from '@/lib/types';
import { clampProgress } from '@/lib/task-state';

type ParsedRow = Record<string, unknown>;

const STATUS_ALIASES: Record<string, Status> = {
  pending: 'pending',
  'in progress': 'in-progress',
  inprogress: 'in-progress',
  'in-progress': 'in-progress',
  hold: 'on-hold',
  'on hold': 'on-hold',
  onhold: 'on-hold',
  'on-hold': 'on-hold',
  complete: 'completed',
  completed: 'completed',
  cancel: 'cancelled',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

const HEADER_ALIASES: Record<string, string[]> = {
  taskId: ['taskid', 'task id'],
  taskTitle: ['task', 'tasktitle', 'task title', 'taskname', 'task name', 'title'],
  date: ['date', 'workdate', 'work date', 'logdate', 'log date'],
  startTime: ['starttime', 'start time', 'from', 'fromtime', 'from time'],
  endTime: ['endtime', 'end time', 'to', 'totime', 'to time'],
  breakDuration: ['break', 'breakduration', 'break duration', 'breakminutes', 'break minutes'],
  progressPercentage: ['progress', 'progresspercentage', 'progress percentage', 'completion', 'completion percentage'],
  statusUpdate: ['status', 'statusupdate', 'status update'],
  progressNotes: ['progressnotes', 'progress notes', 'update', 'updates'],
  remarks: ['remarks', 'remark', 'comments', 'comment', 'notes'],
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getCellValue(row: ParsedRow, aliases: string[]): unknown {
  const entries = Object.entries(row);

  for (const [header, value] of entries) {
    const normalizedHeader = normalizeHeader(header);
    if (aliases.includes(normalizedHeader)) {
      return value;
    }
  }

  return '';
}

function excelDateToIso(value: number): string {
  const utcDays = Math.floor(value - 25569);
  const utcMilliseconds = utcDays * 86400 * 1000;
  return new Date(utcMilliseconds).toISOString().slice(0, 10);
}

function parseDateValue(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return excelDateToIso(value);
  }

  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function parseTimeValue(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}`;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const totalMinutes = Math.round((value % 1) * 24 * 60);
    return formatMinutes(totalMinutes);
  }

  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }

  if (/^\d{1,2}:\d{2}$/.test(text)) {
    const [hours, minutes] = text.split(':').map(Number);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  const normalized = text.replace('.', ':').toUpperCase();
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) {
    return '';
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? '0');
  const meridiem = match[3];

  if (minutes < 0 || minutes > 59) {
    return '';
  }

  if (meridiem) {
    if (hours < 1 || hours > 12) {
      return '';
    }

    if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    } else if (meridiem === 'PM' && hours !== 12) {
      hours += 12;
    }
  }

  if (hours < 0 || hours > 23) {
    return '';
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function parseNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const cleaned = String(value ?? '')
    .trim()
    .replace(/%/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseStatusValue(value: unknown): Status | null {
  const normalized = normalizeHeader(String(value ?? ''));
  return STATUS_ALIASES[normalized] ?? null;
}

function resolveTaskId(row: ParsedRow, tasks: Task[]): string {
  const rawTaskId = String(getCellValue(row, HEADER_ALIASES.taskId) ?? '').trim();
  if (rawTaskId) {
    const matchedById = tasks.find((task) => task.id === rawTaskId);
    if (matchedById) {
      return matchedById.id;
    }
  }

  const rawTaskTitle = String(getCellValue(row, HEADER_ALIASES.taskTitle) ?? '').trim();
  if (!rawTaskTitle) {
    return '';
  }

  const normalizedTaskTitle = rawTaskTitle.toLowerCase();
  const matchedByTitle = tasks.find((task) => task.title.trim().toLowerCase() === normalizedTaskTitle);
  return matchedByTitle?.id ?? '';
}

export interface WorkLogImportResult {
  drafts: WorkLogEntryDraft[];
  errors: string[];
}

export function parseWorkLogImportRows(rows: ParsedRow[], tasks: Task[]): WorkLogImportResult {
  const drafts: WorkLogEntryDraft[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const taskId = resolveTaskId(row, tasks);
    const date = parseDateValue(getCellValue(row, HEADER_ALIASES.date));
    const startTime = parseTimeValue(getCellValue(row, HEADER_ALIASES.startTime));
    const endTime = parseTimeValue(getCellValue(row, HEADER_ALIASES.endTime));
    const statusUpdate = parseStatusValue(getCellValue(row, HEADER_ALIASES.statusUpdate));

    if (!taskId) {
      errors.push(`Row ${rowNumber}: task was not matched to an existing task.`);
      return;
    }

    if (!date) {
      errors.push(`Row ${rowNumber}: date is missing or invalid.`);
      return;
    }

    if (!startTime || !endTime) {
      errors.push(`Row ${rowNumber}: start time or end time is missing or invalid.`);
      return;
    }

    if (!statusUpdate) {
      errors.push(`Row ${rowNumber}: status is missing or invalid.`);
      return;
    }

    drafts.push({
      taskId,
      date,
      startTime,
      endTime,
      breakDuration: Math.max(0, parseNumberValue(getCellValue(row, HEADER_ALIASES.breakDuration), 0)),
      remarks: String(getCellValue(row, HEADER_ALIASES.remarks) ?? '').trim(),
      progressPercentage: clampProgress(
        parseNumberValue(getCellValue(row, HEADER_ALIASES.progressPercentage), 0)
      ),
      progressNotes: String(getCellValue(row, HEADER_ALIASES.progressNotes) ?? '').trim(),
      statusUpdate,
    });
  });

  return { drafts, errors };
}
