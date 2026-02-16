import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerMode, TimerSettings } from '@/app/types';

/**
 * Timer state interface
 */
interface TimerState {
  mode: TimerMode;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  completedSessions: number; // tracks focus sessions completed for long break logic
}

/**
 * Custom hook for Pomodoro timer logic
 * Handles Focus, Break, and Long Break modes with automatic transitions
 */
export function useTimer(
  settings: TimerSettings,
  _tasks: unknown[],
  _activeTaskId: string | null,
  onComplete: (mode: TimerMode, duration: number) => void
) {
  // Initialize timer state
  const [state, setState] = useState<TimerState>({
    mode: 'focus',
    timeRemaining: settings.focusDuration * 60,
    isRunning: false,
    completedSessions: 0,
  });

  // Audio ref for timer complete sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a simple beep sound using Web Audio API
      audioRef.current = new Audio();
    }
  }, []);

  // Play completion sound
  const playCompletionSound = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, []);

  // Update timer when settings change (but not while running)
  useEffect(() => {
    if (!state.isRunning) {
      setState(prev => ({
        ...prev,
        timeRemaining: settings.focusDuration * 60,
      }));
    }
  }, [settings.focusDuration, settings.breakDuration, settings.longBreakDuration]);

  // Timer countdown effect
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          // Timer completed
          const duration = getDurationForMode(prev.mode, settings);
          onComplete(prev.mode, duration);
          playCompletionSound();

          // Determine next mode
          const nextMode = getNextMode(prev.mode, prev.completedSessions, settings);
          const nextCompletedSessions = prev.mode === 'focus'
            ? prev.completedSessions + 1
            : prev.completedSessions;

          return {
            mode: nextMode,
            timeRemaining: getDurationForMode(nextMode, settings) * 60,
            isRunning: false, // Pause after completion
            completedSessions: nextCompletedSessions,
          };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, settings, onComplete, playCompletionSound]);

  // Start timer
  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  // Reset timer to current mode's duration
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeRemaining: getDurationForMode(prev.mode, settings) * 60,
      isRunning: false,
    }));
  }, [settings]);

  // Switch mode manually
  const switchMode = useCallback((mode: TimerMode) => {
    setState(prev => ({
      ...prev,
      mode,
      timeRemaining: getDurationForMode(mode, settings) * 60,
      isRunning: false,
    }));
  }, [settings]);

  // Skip current session
  const skip = useCallback(() => {
    setState(prev => {
      const nextMode = getNextMode(prev.mode, prev.completedSessions, settings);
      const nextCompletedSessions = prev.mode === 'focus'
        ? prev.completedSessions + 1
        : prev.completedSessions;

      return {
        mode: nextMode,
        timeRemaining: getDurationForMode(nextMode, settings) * 60,
        isRunning: false,
        completedSessions: nextCompletedSessions,
      };
    });
  }, [settings]);

  // Format time as MM:SS
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [state.timeRemaining]);

  // Calculate progress percentage
  const progress = useCallback(() => {
    const total = getDurationForMode(state.mode, settings) * 60;
    return ((total - state.timeRemaining) / total) * 100;
  }, [state.timeRemaining, state.mode, settings]);

  return {
    mode: state.mode,
    timeRemaining: state.timeRemaining,
    isRunning: state.isRunning,
    completedSessions: state.completedSessions,
    formattedTime: formattedTime(),
    progress: progress(),
    start,
    pause,
    reset,
    switchMode,
    skip,
  };
}

/**
 * Get duration in minutes for a given timer mode
 */
function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case 'focus':
      return settings.focusDuration;
    case 'break':
      return settings.breakDuration;
    case 'longBreak':
      return settings.longBreakDuration;
    default:
      return settings.focusDuration;
  }
}

/**
 * Determine the next timer mode based on current mode and completed sessions
 * Long break is triggered after completing the configured number of focus sessions
 */
function getNextMode(
  currentMode: TimerMode,
  completedSessions: number,
  settings: TimerSettings
): TimerMode {
  if (currentMode === 'focus') {
    // After focus, check if we should take a long break
    // Long break triggers when completedSessions + 1 is divisible by longBreakInterval
    const nextSessionCount = completedSessions + 1;
    if (nextSessionCount % settings.longBreakInterval === 0) {
      return 'longBreak';
    }
    return 'break';
  }
  // After any break, go back to focus
  return 'focus';
}
