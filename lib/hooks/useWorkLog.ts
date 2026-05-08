'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkLogEntry, WorkLogEntryDraft } from '@/lib/types';
import { createSeedEntries } from '@/lib/mock-data';
import { buildWorkLogEntry, normalizeWorkLogEntry } from '@/lib/task-state';

const STORAGE_KEY = 'work_log';

export function useWorkLog() {
  const [entries, setEntries] = useState<WorkLogEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedEntries = JSON.parse(saved) as Partial<WorkLogEntry>[];
        const normalizedEntries = parsedEntries.map((entry) => normalizeWorkLogEntry(entry));
        setEntries(normalizedEntries.length > 0 ? normalizedEntries : createSeedEntries());
      } catch (error) {
        console.error('Failed to load work log entries:', error);
        setEntries(createSeedEntries());
      }
    } else {
      setEntries(createSeedEntries());
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever entries change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const calculateTotalHours = useCallback(
    (startTime: string, endTime: string, breakDuration: number) => {
      if (!startTime || !endTime) return 0;

      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      let totalMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);

      if (totalMinutes < 0) {
        totalMinutes += 24 * 60; // Handle next day case
      }

      totalMinutes -= breakDuration;
      return Math.max(0, totalMinutes / 60);
    },
    []
  );

  const addEntry = useCallback(
    (draft: WorkLogEntryDraft) => {
      const newEntry = buildWorkLogEntry(draft);
      setEntries((prev) => [...prev, newEntry]);
      return newEntry;
    },
    []
  );

  const updateEntry = useCallback((id: string, updates: Partial<WorkLogEntryDraft>): WorkLogEntry | null => {
    let updatedEntry: WorkLogEntry | null = null;

    setEntries((prev) => {
      const existingEntry = prev.find((entry) => entry.id === id);
      if (!existingEntry) return prev;

      updatedEntry = buildWorkLogEntry({
        taskId: updates.taskId ?? existingEntry.taskId,
        date: updates.date ?? existingEntry.date,
        startTime: updates.startTime ?? existingEntry.startTime,
        endTime: updates.endTime ?? existingEntry.endTime,
        breakDuration: updates.breakDuration ?? existingEntry.breakDuration,
        remarks: updates.remarks ?? existingEntry.remarks,
        progressPercentage: updates.progressPercentage ?? existingEntry.progressPercentage,
        progressNotes: updates.progressNotes ?? existingEntry.progressNotes,
        statusUpdate: updates.statusUpdate ?? existingEntry.statusUpdate,
      }, existingEntry);

      return prev.map((entry) => (entry.id === id ? updatedEntry! : entry));
    });

    return updatedEntry;
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const getEntriesForDate = useCallback(
    (date: string) => {
      return entries.filter((entry) => entry.date === date);
    },
    [entries]
  );

  const getTotalHoursForDate = useCallback(
    (date: string) => {
      const dateEntries = getEntriesForDate(date);
      return dateEntries.reduce(
        (total, entry) =>
          total +
          calculateTotalHours(entry.startTime, entry.endTime, entry.breakDuration),
        0
      );
    },
    [getEntriesForDate, calculateTotalHours]
  );

  const getEntriesForTask = useCallback(
    (taskId: string) => {
      return entries.filter((entry) => entry.taskId === taskId);
    },
    [entries]
  );

  return {
    entries,
    isLoaded,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForDate,
    getTotalHoursForDate,
    getEntriesForTask,
    calculateTotalHours,
  };
}
