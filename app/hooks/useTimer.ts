import { useState, useEffect, useCallback, useRef } from "react";
import type { TimerMode, TimerSettings } from "@/app/types";

interface TimerState {
  mode: TimerMode;
  timeRemaining: number;
  isRunning: boolean;
  completedSessions: number;
}

function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case "focus":
      return settings.focusDuration;
    case "break":
      return settings.breakDuration;
    case "longBreak":
      return settings.longBreakDuration;
  }
}

function getNextMode(
  currentMode: TimerMode,
  completedSessions: number,
  settings: TimerSettings,
): TimerMode {
  if (currentMode === "focus") {
    const nextSessionCount = completedSessions + 1;
    return nextSessionCount % settings.longBreakInterval === 0
      ? "longBreak"
      : "break";
  }
  return "focus";
}

function getModeLabel(mode: TimerMode): string {
  switch (mode) {
    case "focus":
      return "Sesi Fokus sudah selesai!!";
    case "break":
      return "Waktu istirahat sudah berakhir!";
    case "longBreak":
      return "Istirahat panjang sudah berakhir!";
  }
}

function getModeBody(mode: TimerMode): string {
  switch (mode) {
    case "focus":
      return "Kerja bagus! Waktunya rehat sejenak dulu,le";
    case "break":
      return "Siap untuk fokus lagi,le?";
    case "longBreak":
      return "Sudah terisi ulang? GASS LANJUT,le!";
  }
}

/** Play a pleasant multi-tone ring using Web Audio API */
function playRing() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();

    // Three-tone chime: C5 → E5 → G5
    const tones = [523.25, 659.25, 783.99];
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value = freq;

      const startAt = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(0.35, startAt + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.6);

      osc.start(startAt);
      osc.stop(startAt + 0.65);
    });
  } catch (err) {
    console.warn("Could not play ring:", err);
  }
}

/** Request browser notification permission on first call, then show notification */
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
      silent: true, // we handle sound ourselves
    });
  }
}

export function useTimer(
  settings: TimerSettings,
  _tasks: unknown[],
  _activeTaskId: string | null,
  onComplete: (mode: TimerMode, duration: number) => void,
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

  // Ref to prevent multiple onComplete calls due to race condition
  const hasCompletedRef = useRef(false);

  // Request notification permission once on mount
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Reset timer when settings durations actually change and timer is paused
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

    setState((prev) => {
      if (prev.isRunning) return prev;
      return {
        ...prev,
        timeRemaining: getDurationForMode(prev.mode, settings) * 60,
      };
    });
  }, [
    settings.focusDuration,
    settings.breakDuration,
    settings.longBreakDuration,
    settings,
  ]);

  // Countdown — reads settings via ref, no restarts when settings change
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining > 0) {
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        }

        // Prevent multiple onComplete calls
        if (hasCompletedRef.current) {
          return prev;
        }

        const s = settingsRef.current;
        const duration = getDurationForMode(prev.mode, s);

        onCompleteRef.current(prev.mode, duration);
        playRing();
        showNotification(prev.mode);
        hasCompletedRef.current = true;

        const nextMode = getNextMode(prev.mode, prev.completedSessions, s);
        const nextCompletedSessions =
          prev.mode === "focus"
            ? prev.completedSessions + 1
            : prev.completedSessions;

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
    hasCompletedRef.current = false;
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);
  const pause = useCallback(
    () => setState((prev) => ({ ...prev, isRunning: false })),
    [],
  );

  const reset = useCallback(() => {
    hasCompletedRef.current = false;
    setState((prev) => ({
      ...prev,
      timeRemaining: getDurationForMode(prev.mode, settingsRef.current) * 60,
      isRunning: false,
    }));
  }, []);

  const switchMode = useCallback((mode: TimerMode) => {
    hasCompletedRef.current = false;
    setState((prev) => ({
      ...prev,
      mode,
      timeRemaining: getDurationForMode(mode, settingsRef.current) * 60,
      isRunning: false,
    }));
  }, []);

  const skip = useCallback(() => {
    hasCompletedRef.current = false;
    setState((prev) => {
      const s = settingsRef.current;
      const nextMode = getNextMode(prev.mode, prev.completedSessions, s);
      const nextCompletedSessions =
        prev.mode === "focus"
          ? prev.completedSessions + 1
          : prev.completedSessions;
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
