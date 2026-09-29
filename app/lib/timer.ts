import type { TimerMode, TimerSettings } from "../types";

export interface TimerState {
  mode: TimerMode;
  timeRemaining: number;
  sessionDuration: number;
  isRunning: boolean;
  deadline: number | null;
  completedSessions: number;
  completionSequence: number;
  completion: { sequence: number; mode: TimerMode; duration: number } | null;
  cue: { sequence: number; kind: "start" | "pause" | "complete" | "skip" | "reset" | "switch" } | null;
}

export type TimerAction =
  | { type: "start"; now: number }
  | { type: "pause"; now: number; settings: TimerSettings }
  | { type: "tick"; now: number; settings: TimerSettings }
  | { type: "reset"; settings: TimerSettings }
  | { type: "switch"; mode: TimerMode; settings: TimerSettings }
  | { type: "skip"; settings: TimerSettings }
  | { type: "settings"; settings: TimerSettings };

export function durationFor(mode: TimerMode, settings: TimerSettings): number {
  if (mode === "focus") return settings.focusDuration;
  if (mode === "break") return settings.breakDuration;
  return settings.longBreakDuration;
}

export function nextMode(mode: TimerMode, completedSessions: number, settings: TimerSettings): TimerMode {
  if (mode !== "focus") return "focus";
  return (completedSessions + 1) % settings.longBreakInterval === 0 ? "longBreak" : "break";
}

export function focusHeartsFilled(completedSessions: number, interval: number, mode: TimerMode): number {
  const cycleLength = Math.max(1, interval);
  const progress = completedSessions % cycleLength;
  return mode === "longBreak" && completedSessions > 0 && progress === 0 ? cycleLength : progress;
}

export function initialTimer(settings: TimerSettings): TimerState {
  const duration = durationFor("focus", settings);
  return {
    mode: "focus", timeRemaining: duration * 60, sessionDuration: duration,
    isRunning: false, deadline: null, completedSessions: 0, completionSequence: 0, completion: null, cue: null,
  };
}

function transition(state: TimerState, settings: TimerSettings, completed: boolean): TimerState {
  const completedFocus = completed && state.mode === "focus";
  const mode = state.mode === "focus" && !completed ? "break" : nextMode(state.mode, state.completedSessions, settings);
  const duration = durationFor(mode, settings);
  return {
    mode, timeRemaining: duration * 60, sessionDuration: duration,
    isRunning: false, deadline: null,
    completedSessions: state.completedSessions + (completedFocus ? 1 : 0),
    completionSequence: state.completionSequence + (completed ? 1 : 0),
    completion: completed
      ? { sequence: state.completionSequence + 1, mode: state.mode, duration: state.sessionDuration }
      : null,
    cue: { sequence: (state.cue?.sequence ?? 0) + 1, kind: completed ? "complete" : "skip" },
  };
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "start":
      if (state.isRunning) return state;
      return { ...state, isRunning: true, deadline: action.now + state.timeRemaining * 1000, completion: null,
        cue: { sequence: (state.cue?.sequence ?? 0) + 1, kind: "start" } };
    case "tick":
    case "pause": {
      if (!state.isRunning || state.deadline === null) return state;
      const remaining = Math.max(0, Math.ceil((state.deadline - action.now) / 1000));
      if (remaining === 0) return transition(state, action.settings, true);
      if (action.type === "pause") return { ...state, timeRemaining: remaining, isRunning: false, deadline: null,
        cue: { sequence: (state.cue?.sequence ?? 0) + 1, kind: "pause" } };
      return remaining === state.timeRemaining ? state : { ...state, timeRemaining: remaining };
    }
    case "reset": {
      const duration = durationFor(state.mode, action.settings);
      return { ...state, timeRemaining: duration * 60, sessionDuration: duration, isRunning: false, deadline: null, completion: null,
        cue: { sequence: (state.cue?.sequence ?? 0) + 1, kind: "reset" } };
    }
    case "switch": {
      const duration = durationFor(action.mode, action.settings);
      return { ...state, mode: action.mode, timeRemaining: duration * 60, sessionDuration: duration, isRunning: false, deadline: null, completion: null,
        cue: { sequence: (state.cue?.sequence ?? 0) + 1, kind: "switch" } };
    }
    case "skip": return transition(state, action.settings, false);
    case "settings": {
      if (state.isRunning) return state;
      const duration = durationFor(state.mode, action.settings);
      return { ...state, timeRemaining: duration * 60, sessionDuration: duration, completion: null };
    }
  }
}
