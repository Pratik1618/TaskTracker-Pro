import { addDays } from 'date-fns';

import { getLocalDateValue } from '@/lib/date';
import { normalizeTask, normalizeWorkLogEntry } from '@/lib/task-state';
import { Task, WorkLogEntry } from '@/lib/types';

function getShiftedDate(days: number): string {
  return getLocalDateValue(addDays(new Date(), days));
}

export function createSeedTasks(): Task[] {
  return [
    normalizeTask({
      id: 'seed-task-1',
      title: 'Review pending approvals',
      priority: 'critical',
      expectedEndDate: getShiftedDate(0),
      progress: 65,
      status: 'in-progress',
      createdAt: `${getShiftedDate(-3)}T09:00:00.000Z`,
      updatedAt: `${getShiftedDate(0)}T11:30:00.000Z`,
      archived: false,
    }),
    normalizeTask({
      id: 'seed-task-2',
      title: 'Monthly reconciliation checklist',
      priority: 'medium',
      expectedEndDate: getShiftedDate(2),
      progress: 30,
      status: 'on-hold',
      createdAt: `${getShiftedDate(-5)}T08:30:00.000Z`,
      updatedAt: `${getShiftedDate(-1)}T15:15:00.000Z`,
      archived: false,
    }),
    normalizeTask({
      id: 'seed-task-3',
      title: 'Vendor payment follow-up',
      priority: 'normal',
      expectedEndDate: getShiftedDate(-1),
      progress: 100,
      status: 'completed',
      createdAt: `${getShiftedDate(-4)}T10:00:00.000Z`,
      updatedAt: `${getShiftedDate(-1)}T17:45:00.000Z`,
      archived: false,
    }),
    normalizeTask({
      id: 'seed-task-4',
      title: 'Policy acknowledgment tracker',
      priority: 'normal',
      expectedEndDate: getShiftedDate(4),
      progress: 0,
      status: 'pending',
      createdAt: `${getShiftedDate(-2)}T09:15:00.000Z`,
      updatedAt: `${getShiftedDate(-2)}T09:15:00.000Z`,
      archived: false,
    }),
  ];
}

export function createSeedEntries(): WorkLogEntry[] {
  return [
    normalizeWorkLogEntry({
      id: 'seed-entry-1',
      taskId: 'seed-task-1',
      date: getShiftedDate(-2),
      startTime: '09:00',
      endTime: '11:00',
      breakDuration: 10,
      remarks: 'Collected pending approvals from team leads.',
      progressPercentage: 40,
      progressNotes: 'Validated most pending records and flagged exceptions.',
      statusUpdate: 'in-progress',
      createdAt: `${getShiftedDate(-2)}T11:00:00.000Z`,
      updatedAt: `${getShiftedDate(-2)}T11:00:00.000Z`,
    }),
    normalizeWorkLogEntry({
      id: 'seed-entry-2',
      taskId: 'seed-task-1',
      date: getShiftedDate(0),
      startTime: '10:30',
      endTime: '12:30',
      breakDuration: 15,
      remarks: 'Followed up on unresolved approvals.',
      progressPercentage: 65,
      progressNotes: 'Escalated remaining blockers and prepared final review notes.',
      statusUpdate: 'in-progress',
      createdAt: `${getShiftedDate(0)}T12:30:00.000Z`,
      updatedAt: `${getShiftedDate(0)}T12:30:00.000Z`,
    }),
    normalizeWorkLogEntry({
      id: 'seed-entry-3',
      taskId: 'seed-task-2',
      date: getShiftedDate(-1),
      startTime: '14:00',
      endTime: '16:00',
      breakDuration: 0,
      remarks: 'Blocked waiting for statement confirmation.',
      progressPercentage: 30,
      progressNotes: 'Completed first pass of line-item validation.',
      statusUpdate: 'on-hold',
      createdAt: `${getShiftedDate(-1)}T16:00:00.000Z`,
      updatedAt: `${getShiftedDate(-1)}T16:00:00.000Z`,
    }),
    normalizeWorkLogEntry({
      id: 'seed-entry-4',
      taskId: 'seed-task-3',
      date: getShiftedDate(-1),
      startTime: '11:00',
      endTime: '12:00',
      breakDuration: 0,
      remarks: 'Confirmed settlement and closed follow-up.',
      progressPercentage: 100,
      progressNotes: 'Payment status verified and final update shared.',
      statusUpdate: 'completed',
      createdAt: `${getShiftedDate(-1)}T12:00:00.000Z`,
      updatedAt: `${getShiftedDate(-1)}T12:00:00.000Z`,
    }),
  ];
}
