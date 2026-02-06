import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persisting state to localStorage
 * Automatically syncs state with localStorage and handles SSR
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsInitialized(true);
  }, [key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * Hook for managing the entire app state with localStorage persistence
 */
export function useAppPersistence() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('pomodoro-tasks', []);
  const [settings, setSettings] = useLocalStorage<TimerSettings>('pomodoro-settings', {
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  });
  const [progress, setProgress] = useLocalStorage<UserProgress>('pomodoro-progress', {
    totalFocusTime: 0,
    totalPomodorosCompleted: 0,
    currentStreak: 0,
    lastActiveDate: null,
    dailyStats: [],
  });
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('pomodoro-active-task', null);

  return {
    tasks,
    setTasks,
    settings,
    setSettings,
    progress,
    setProgress,
    activeTaskId,
    setActiveTaskId,
  };
}

// Import types
import type { Task, TimerSettings, UserProgress } from '@/types';
