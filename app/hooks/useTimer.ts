import { useState, useEffect, useCallback, useRef } from "react";
import type { TimerMode, TimerSettings } from "@/app/types";
import { playRingRepeated } from "@/app/data/ringtones";

interface TimerState {
  mode: TimerMode;
  timeRemaining: number;
  isRunning: boolean;
  completedSessions: number;
}

function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case "focus": return settings.focusDuration;
    case "break": return settings.breakDuration;
    case "longBreak": return settings.longBreakDuration;
  }
}

function getNextMode(
  currentMode: TimerMode,
  completedSessions: number,
  settings: TimerSettings,
): TimerMode {
  if (currentMode === "focus") {
    const next = completedSessions + 1;
    return next % settings.longBreakInterval === 0 ? "longBreak" : "break";
  }
  return "focus";
}

function getModeLabel(mode: TimerMode): string {
  switch (mode) {
    case "focus": return "Sesi Fokus sudah selesai!!";
    case "break": return "Waktu istirahat sudah berakhir!";
    case "longBreak": return "Istirahat panjang sudah berakhir!";
  }
}

function getModeBody(mode: TimerMode): string {
  switch (mode) {
    case "focus": return "Kerja bagus! Waktunya rehat sejenak dulu,le";
    case "break": return "Siap untuk fokus lagi,le?";
    case "longBreak": return "Sudah terisi ulang? GASS LANJUT,le!";
  }
}

function playRing(ringtoneId: string, repeat: number) {
  try {
    playRingRepeated(ringtoneId, repeat);
  } catch (err) {
    console.warn("Could not play ring:", err);
  }
}

async function showNotification(mode: TimerMode) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "denied") return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission === "granted") {
    new Notification(getModeLabel(mode), {
      body: getModeBody(mode),
      icon: "/favicon.ico",
      silent: true,
    });
  }
}

export function useTimer(
  settings: TimerSettings,
  _tasks: unknown[],
  _activeTaskId: string | null,
  onComplete: (mode: TimerMode, duration: number) => void,
  ringtoneId: string,
  ringtoneRepeat: number,
) {
  const [state, setState] = useState<TimerState>({
    mode: "focus",
    timeRemaining: settings.focusDuration * 60,
    isRunning: false,
    completedSessions: 0,
  });

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const ringtoneIdRef = useRef(ringtoneId);
  ringtoneIdRef.current = ringtoneId;

  const ringtoneRepeatRef = useRef(ringtoneRepeat);
  ringtoneRepeatRef.current = ringtoneRepeat;

  const completionFiredRef = useRef(false);

  // Request notification permission once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Reset timer when settings durations change (only while paused)
  const prevDurationsRef = useRef({
    focusDuration: settings.focusDuration,
    breakDuration: settings.breakDuration,
    longBreakDuration: settings.longBreakDuration,
  });

  useEffect(() => {
    const prev = prevDurationsRef.current;
    const changed =
      prev.focusDuration !== settings.focusDuration ||
      prev.breakDuration !== settings.breakDuration ||
      prev.longBreakDuration !== settings.longBreakDuration;

    if (!changed) return;
    prevDurationsRef.current = {
      focusDuration: settings.focusDuration,
      breakDuration: settings.breakDuration,
      longBreakDuration: settings.longBreakDuration,
    };

    setState(prev => {
      if (prev.isRunning) return prev;
      return { ...prev, timeRemaining: getDurationForMode(prev.mode, settings) * 60 };
    });
  }, [settings.focusDuration, settings.breakDuration, settings.longBreakDuration, settings]);

  // ── Core countdown ──────────────────────────────────────────────────────────
  // Fix: decrement first, then check if we hit 0.
  // This ensures 00:01 → 00:00 triggers completion cleanly in one tick,
  // with no lingering state at 0 that requires a hasCompleted guard.
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.isRunning) return prev;

        const next = prev.timeRemaining - 1;

        if (next > 0) {
          // Still counting down
          return { ...prev, timeRemaining: next };
        }

        // Reached 0 — complete this session
        const s = settingsRef.current;
        const duration = getDurationForMode(prev.mode, s);
        const completedMode = prev.mode;

        // Guard against StrictMode double-invoke of setState updater
        if (!completionFiredRef.current) {
          completionFiredRef.current = true;
          setTimeout(() => {
            onCompleteRef.current(completedMode, duration);
            playRing(ringtoneIdRef.current, ringtoneRepeatRef.current);
            showNotification(completedMode);
            completionFiredRef.current = false;
          }, 0);
        }

        const nextMode = getNextMode(prev.mode, prev.completedSessions, s);
        const nextCompletedSessions =
          prev.mode === "focus" ? prev.completedSessions + 1 : prev.completedSessions;

        return {
          mode: nextMode,
          timeRemaining: getDurationForMode(nextMode, s) * 60,
          isRunning: false,
          completedSessions: nextCompletedSessions,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning]);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeRemaining: getDurationForMode(prev.mode, settingsRef.current) * 60,
      isRunning: false,
    }));
  }, []);

  const switchMode = useCallback((mode: TimerMode) => {
    setState(prev => ({
      ...prev,
      mode,
      timeRemaining: getDurationForMode(mode, settingsRef.current) * 60,
      isRunning: false,
    }));
  }, []);

  const skip = useCallback(() => {
    setState(prev => {
      const s = settingsRef.current;
      const nextMode = getNextMode(prev.mode, prev.completedSessions, s);
      const nextCompletedSessions =
        prev.mode === "focus" ? prev.completedSessions + 1 : prev.completedSessions;
      return {
        mode: nextMode,
        timeRemaining: getDurationForMode(nextMode, s) * 60,
        isRunning: false,
        completedSessions: nextCompletedSessions,
      };
    });
  }, []);

  const totalSeconds = getDurationForMode(state.mode, settings) * 60;
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const progress = ((totalSeconds - state.timeRemaining) / totalSeconds) * 100;

  return {
    mode: state.mode,
    timeRemaining: state.timeRemaining,
    isRunning: state.isRunning,
    completedSessions: state.completedSessions,
    formattedTime,
    progress,
    start,
    pause,
    reset,
    switchMode,
    skip,
  };
}
