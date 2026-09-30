import type { TimerMode } from "../types";

export interface FocusCelebration {
  sequence: number;
  duration: number;
}

export interface CelebrationState {
  sequence: number;
  session: FocusCelebration | null;
}

export type CelebrationAction =
  | { type: "complete"; mode: TimerMode; duration: number }
  | { type: "dismiss" };

export const INITIAL_CELEBRATION: CelebrationState = { sequence: 0, session: null };

export function celebrationReducer(state: CelebrationState, action: CelebrationAction): CelebrationState {
  if (action.type === "dismiss") return { ...state, session: null };
  if (action.mode !== "focus") return state;

  const sequence = state.sequence + 1;
  return { sequence, session: { sequence, duration: action.duration } };
}
