import { useState, useEffect, useCallback } from 'react';
import type { Task, TimerSettings, UserProgress, CustomPlaylist } from '@/app/types';

/**
 * Custom hook for persisting state to localStorage.
 *
 * SSR-safe: the initial render (server + first client paint) always uses
 * `initialValue` so the HTML matches. After mount the stored value is
 * loaded and applied, avoiding the Next.js hydration mismatch error.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // After mount, hydrate from localStorage (client-only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`useLocalStorage: error reading "${key}"`, error);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue(prev => {
          const next = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(next));
          return next;
        });
      } catch (error) {
        console.warn(`useLocalStorage: error writing "${key}"`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}

/**
 * Aggregates all persisted app state in one place.
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
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>(
    'pomodoro-active-task',
    null,
  );
  const [customPlaylists, setCustomPlaylists] = useLocalStorage<CustomPlaylist[]>(
    'pomodoro-custom-playlists',
    [],
  );
  const [ringtoneId, setRingtoneId] = useLocalStorage<string>(
    'pomodoro-ringtone',
    'chime',
  );
  const [ringtoneRepeat, setRingtoneRepeat] = useLocalStorage<number>(
    'pomodoro-ringtone-repeat',
    1,
  );

  return {
    tasks, setTasks,
    settings, setSettings,
    progress, setProgress,
    activeTaskId, setActiveTaskId,
    customPlaylists, setCustomPlaylists,
    ringtoneId, setRingtoneId,
    ringtoneRepeat, setRingtoneRepeat,
  };
}
