import { useCallback, useEffect, useReducer, useRef } from "react";
import type { TimerMode, TimerSettings } from "../types";
import { initialTimer, timerReducer } from "../lib/timer";
import { playRingRepeated, playClickSound, playBreakSound } from "../data/ringtones";
import { notifyUser } from "../services/notifications";
import { CUSTOM_RINGTONE_ID } from "../services/customRingtone";

export interface UseTimerResult {
  mode: TimerMode;
  timeRemaining: number;
  isRunning: boolean;
  completedSessions: number;
  formattedTime: string;
  progress: number;
  cue: { sequence: number; kind: "start" | "pause" | "complete" | "skip" | "reset" | "switch" } | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  switchMode: (mode: TimerMode) => void;
  skip: () => void;
}

function notify(mode: TimerMode) {
  const title = mode === "focus" ? "Sesi fokus selesai" : "Waktu istirahat selesai";
  void notifyUser(title, { body: mode === "focus" ? "Saatnya beristirahat." : "Siap fokus lagi?", icon: "/icon.svg", tag: "pomodoro-session", silent: true });
}

export function useTimer(
  settings: TimerSettings,
  onComplete: (mode: TimerMode, duration: number) => void,
  ringtoneId: string,
  ringtoneRepeat: number,
  customRingtoneBuffer?: AudioBuffer,
): UseTimerResult {
  const [state, dispatch] = useReducer(timerReducer, settings, initialTimer);
  const settingsRef = useRef(settings);
  const onCompleteRef = useRef(onComplete);
  const ringtoneRef = useRef({ id: ringtoneId, repeat: ringtoneRepeat, buffer: customRingtoneBuffer });
  const handledCompletion = useRef(0);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { ringtoneRef.current = { id: ringtoneId, repeat: ringtoneRepeat, buffer: customRingtoneBuffer }; }, [ringtoneId, ringtoneRepeat, customRingtoneBuffer]);

  useEffect(() => {
    dispatch({ type: "settings", settings });
  }, [settings]);

  useEffect(() => {
    if (!state.isRunning) return;
    const tick = () => dispatch({ type: "tick", now: Date.now(), settings: settingsRef.current });
    const interval = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [state.isRunning]);

  useEffect(() => {
    const completion = state.completion;
    if (!completion || completion.sequence === handledCompletion.current) return;
    handledCompletion.current = completion.sequence;
    onCompleteRef.current(completion.mode, completion.duration);
    playRingRepeated(ringtoneRef.current.id, ringtoneRef.current.repeat, ringtoneRef.current.buffer);
    notify(completion.mode);
    if (completion.mode === "focus" && ringtoneRef.current.id !== CUSTOM_RINGTONE_ID && ringtoneRef.current.id !== "none") window.setTimeout(playBreakSound, 500);
  }, [state.completion]);

  const start = useCallback(() => {
    playClickSound();
    if ("Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission().catch(() => undefined);
    }
    dispatch({ type: "start", now: Date.now() });
  }, []);
  const pause = useCallback(() => {
    playClickSound();
    dispatch({ type: "pause", now: Date.now(), settings: settingsRef.current });
  }, []);
  const reset = useCallback(() => dispatch({ type: "reset", settings: settingsRef.current }), []);
  const switchMode = useCallback((mode: TimerMode) => dispatch({ type: "switch", mode, settings: settingsRef.current }), []);
  const skip = useCallback(() => dispatch({ type: "skip", settings: settingsRef.current }), []);

  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  return {
    mode: state.mode,
    timeRemaining: state.timeRemaining,
    isRunning: state.isRunning,
    completedSessions: state.completedSessions,
    formattedTime: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    progress: 100 * (1 - state.timeRemaining / (state.sessionDuration * 60)),
    cue: state.cue,
    start, pause, reset, switchMode, skip,
  };
}
