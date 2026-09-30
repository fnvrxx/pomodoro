import { useCallback, useReducer, useSyncExternalStore } from "react";
import { celebrationReducer, INITIAL_CELEBRATION } from "../lib/celebration";
import type { TimerMode } from "../types";

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const isPageVisible = () => document.visibilityState === "visible";
const serverVisibility = () => false;

export function useFocusCelebration() {
  const [state, dispatch] = useReducer(celebrationReducer, INITIAL_CELEBRATION);
  const visible = useSyncExternalStore(subscribeToVisibility, isPageVisible, serverVisibility);
  const celebrate = useCallback((mode: TimerMode, duration: number) => {
    dispatch({ type: "complete", mode, duration });
  }, []);
  const dismiss = useCallback(() => dispatch({ type: "dismiss" }), []);

  return { session: visible ? state.session : null, celebrate, dismiss };
}
