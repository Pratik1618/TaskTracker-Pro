import { format, parse } from 'date-fns';

import { DateRange } from '@/lib/types';

const DATE_PATTERN = 'yyyy-MM-dd';

export function getLocalDateValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateValue: string): Date {
  return parse(dateValue, DATE_PATTERN, new Date());
}

export function formatDateValue(dateValue: string, pattern = 'MMM dd, yyyy'): string {
  return format(parseLocalDate(dateValue), pattern);
}

export function isDateWithinRange(dateValue: string, range: DateRange): boolean {
  return dateValue >= range.fromDate && dateValue <= range.toDate;
}

export function getDateRangeLabel(range: DateRange): string {
  if (range.fromDate === range.toDate) {
    return formatDateValue(range.fromDate, 'MMMM dd, yyyy');
  }

  return `${formatDateValue(range.fromDate, 'MMM dd')} - ${formatDateValue(range.toDate, 'MMM dd, yyyy')}`;
}
