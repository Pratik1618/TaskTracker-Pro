import { getLocalDateValue } from '@/lib/date';
import { clampProgress, normalizeTaskStatus } from '@/lib/task-state';
import { Priority, Status, TaskDraft } from '@/lib/types';

type ParsedRow = Record<string, unknown>;

const PRIORITY_ALIASES: Record<string, Priority> = {
  normal: 'normal',
  low: 'normal',
  medium: 'medium',
  critical: 'critical',
  high: 'critical',
  urgent: 'critical',
};

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
  title: ['task', 'tasktitle', 'task title', 'taskname', 'task name', 'title'],
  priority: ['priority'],
  expectedEndDate: ['expectedenddate', 'expected end date', 'enddate', 'end date', 'duedate', 'due date'],
  progress: ['progress', 'progresspercentage', 'progress percentage', 'completion', 'completion percentage'],
  status: ['status', 'taskstatus', 'task status'],
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getCellValue(row: ParsedRow, aliases: string[]): unknown {
  for (const [header, value] of Object.entries(row)) {
    if (aliases.includes(normalizeHeader(header))) {
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

function parseNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const cleaned = String(value ?? '').trim().replace(/%/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePriorityValue(value: unknown): Priority {
  const normalized = normalizeHeader(String(value ?? ''));
  return PRIORITY_ALIASES[normalized] ?? 'normal';
}

function parseStatusValue(value: unknown): Status | null {
  const normalized = normalizeHeader(String(value ?? ''));
  return STATUS_ALIASES[normalized] ?? null;
}

export interface TaskImportResult {
  drafts: TaskDraft[];
  errors: string[];
}

export function parseTaskImportRows(rows: ParsedRow[]): TaskImportResult {
  const drafts: TaskDraft[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const title = String(getCellValue(row, HEADER_ALIASES.title) ?? '').trim();
    const expectedEndDate = parseDateValue(getCellValue(row, HEADER_ALIASES.expectedEndDate));
    const progress = clampProgress(parseNumberValue(getCellValue(row, HEADER_ALIASES.progress), 0));
    const rawStatus = parseStatusValue(getCellValue(row, HEADER_ALIASES.status));

    if (!title) {
      errors.push(`Row ${rowNumber}: task title is missing.`);
      return;
    }

    if (!expectedEndDate) {
      errors.push(`Row ${rowNumber}: expected end date is missing or invalid.`);
      return;
    }

    const status = normalizeTaskStatus(rawStatus ?? 'pending', progress);

    drafts.push({
      title,
      priority: parsePriorityValue(getCellValue(row, HEADER_ALIASES.priority)),
      expectedEndDate: expectedEndDate || getLocalDateValue(),
      progress,
      status,
    });
  });

  return { drafts, errors };
}
