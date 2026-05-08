'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, Status, TaskDraft } from '@/lib/types';
import { getLocalDateValue } from '@/lib/date';
import { createSeedTasks } from '@/lib/mock-data';
import { applyTaskRules, normalizeTask } from '@/lib/task-state';

const STORAGE_KEY = 'tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedTasks = JSON.parse(saved) as Partial<Task>[];
        const normalizedTasks = parsedTasks.map((task) => normalizeTask(task));
        setTasks(normalizedTasks.length > 0 ? normalizedTasks : createSeedTasks());
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks(createSeedTasks());
      }
    } else {
      setTasks(createSeedTasks());
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback(
    (draft: TaskDraft) => {
      const timestamp = new Date().toISOString();
      const newTask = applyTaskRules(null, draft, 'task', timestamp, null);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    []
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>, source: 'task' | 'worklog' = 'task') => {
    const timestamp = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) {
          return task;
        }

        return applyTaskRules(
          task,
          updates,
          source,
          timestamp,
          updates.lastSyncedEntryId ?? task.lastSyncedEntryId ?? null
        );
      })
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const getTasksByStatus = useCallback(
    (status: Status) => {
      return tasks.filter((task) => task.status === status);
    },
    [tasks]
  );

  const getOverdueTasks = useCallback(() => {
    const todayValue = getLocalDateValue();
    return tasks.filter(
      (task) =>
        !task.archived &&
        task.expectedEndDate < todayValue &&
        task.status !== 'completed' &&
        task.status !== 'cancelled'
    );
  }, [tasks]);

  const filterTasks = useCallback(
    (filterType: 'all' | 'pending' | 'completed' | 'overdue') => {
      switch (filterType) {
        case 'pending':
          return tasks.filter((task) => task.status === 'pending' && !task.archived);
        case 'completed':
          return tasks.filter((task) => task.status === 'completed' && !task.archived);
        case 'overdue':
          return getOverdueTasks();
        default:
          return tasks;
      }
    },
    [tasks, getOverdueTasks]
  );

  return {
    tasks,
    isLoaded,
    addTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getOverdueTasks,
    filterTasks,
  };
}
