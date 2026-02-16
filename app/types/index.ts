/**
 * Type definitions for Pomodoro Timer App
 */

// Timer session types
export type TimerMode = 'focus' | 'break' | 'longBreak';

// Task status
export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  actualPomodoros: number;
  completed: boolean;
  createdAt: number;
}

// Timer settings
export interface TimerSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of focus sessions before long break
}

// User progress/stats
export interface UserProgress {
  totalFocusTime: number; // in minutes
  totalPomodorosCompleted: number;
  currentStreak: number;
  lastActiveDate: string | null; // ISO date string
  dailyStats: DailyStat[];
}

// Daily statistics
export interface DailyStat {
  date: string; // ISO date string
  focusTime: number; // in minutes
  pomodorosCompleted: number;
}

// App state
export interface AppState {
  tasks: Task[];
  settings: TimerSettings;
  progress: UserProgress;
  activeTaskId: string | null;
}

// Default values
export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

export const DEFAULT_PROGRESS: UserProgress = {
  totalFocusTime: 0,
  totalPomodorosCompleted: 0,
  currentStreak: 0,
  lastActiveDate: null,
  dailyStats: [],
};
