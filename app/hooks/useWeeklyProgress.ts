import { useState, useEffect, useCallback } from 'react';

/**
 * Weekly Progress Hook
 * 
 * Tracks tasks completed per week and automatically resets when a new week starts.
 * Uses localStorage for persistence.
 * 
 * @returns Object containing weekly progress data and functions
 */
export interface WeeklyProgress {
  weekStartDate: string; // ISO date string of the week's Monday
  completedTasks: string[]; // Array of task IDs completed this week
}

const STORAGE_KEY = 'pomodoro-weekly-progress';

/**
 * Get the Monday of the current week for a given date
 */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

/**
 * Check if a date is in the current week
 */
export function isInCurrentWeek(dateString: string): boolean {
  const currentWeekStart = getWeekStart();
  const taskWeekStart = getWeekStart(new Date(dateString));
  return currentWeekStart === taskWeekStart;
}

export function useWeeklyProgress() {
  // Initialize state from localStorage
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>(() => {
    if (typeof window === 'undefined') {
      return { weekStartDate: getWeekStart(), completedTasks: [] };
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: WeeklyProgress = JSON.parse(stored);
        // Check if we need to reset for a new week
        const currentWeekStart = getWeekStart();
        if (parsed.weekStartDate !== currentWeekStart) {
          // New week started, reset progress
          const newProgress: WeeklyProgress = {
            weekStartDate: currentWeekStart,
            completedTasks: [],
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
          return newProgress;
        }
        return parsed;
      }
    } catch (error) {
      console.warn('Error reading weekly progress from localStorage:', error);
    }
    
    return { weekStartDate: getWeekStart(), completedTasks: [] };
  });

  // Persist to localStorage whenever progress changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeklyProgress));
    } catch (error) {
      console.warn('Error saving weekly progress to localStorage:', error);
    }
  }, [weeklyProgress]);

  /**
   * Add a task to the weekly completed list
   */
  const completeTask = useCallback((taskId: string) => {
    setWeeklyProgress(prev => {
      // Check if we need to reset for a new week
      const currentWeekStart = getWeekStart();
      if (prev.weekStartDate !== currentWeekStart) {
        return {
          weekStartDate: currentWeekStart,
          completedTasks: [taskId],
        };
      }
      
      // Avoid duplicates
      if (prev.completedTasks.includes(taskId)) {
        return prev;
      }
      
      return {
        ...prev,
        completedTasks: [...prev.completedTasks, taskId],
      };
    });
  }, []);

  /**
   * Remove a task from the weekly completed list
   */
  const uncompleteTask = useCallback((taskId: string) => {
    setWeeklyProgress(prev => ({
      ...prev,
      completedTasks: prev.completedTasks.filter(id => id !== taskId),
    }));
  }, []);

  /**
   * Get the count of completed tasks this week
   */
  const getWeeklyCompletedCount = useCallback((): number => {
    return weeklyProgress.completedTasks.length;
  }, [weeklyProgress.completedTasks]);

  /**
   * Check if a specific task was completed this week
   */
  const isTaskCompletedThisWeek = useCallback((taskId: string): boolean => {
    return weeklyProgress.completedTasks.includes(taskId);
  }, [weeklyProgress.completedTasks]);

  /**
   * Reset weekly progress (for testing or manual reset)
   */
  const resetWeeklyProgress = useCallback(() => {
    const newProgress: WeeklyProgress = {
      weekStartDate: getWeekStart(),
      completedTasks: [],
    };
    setWeeklyProgress(newProgress);
  }, []);

  return {
    weeklyProgress,
    completeTask,
    uncompleteTask,
    getWeeklyCompletedCount,
    isTaskCompletedThisWeek,
    resetWeeklyProgress,
    currentWeekStart: weeklyProgress.weekStartDate,
  };
}
