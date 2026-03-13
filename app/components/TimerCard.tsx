import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { TimerMode, TimerSettings } from "@/app/types";

interface TimerCardProps {
  timer: {
    mode: TimerMode;
    timeRemaining: number;
    isRunning: boolean;
    completedSessions: number;
    formattedTime: string;
    progress: number;
    start: () => void;
    pause: () => void;
    reset: () => void;
    switchMode: (mode: TimerMode) => void;
    skip: () => void;
  };
  settings: TimerSettings;
  isFocusActive?: boolean;
}

const RADIUS = 50 - 5 / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerCard({ timer, settings, isFocusActive = false }: TimerCardProps) {
  const isFocus = timer.mode === "focus";
  const isLongBreak = timer.mode === "longBreak";

  const sessionsUntilLongBreak =
    settings.longBreakInterval -
    (timer.completedSessions % settings.longBreakInterval);

  const modeLabel = isFocus ? "Focus" : isLongBreak ? "Long Break" : "Break";

  return (
    <div className="rounded-3xl px-4 pt-3 pb-2 shadow-xl focus-timer-card"
         style={{ backgroundColor: "var(--pomo-timer-bg)", transition: "background-color 0.6s ease" }}>
      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 mb-4">
        {(["focus", "break"] as TimerMode[]).map((m) => (
          <motion.button
            key={m}
            onClick={() => timer.switchMode(m)}
            className="px-5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200"
            style={{
              backgroundColor: timer.mode === m
                ? (isFocusActive ? "#111111" : "var(--pomo-card)")
                : "transparent",
              color: timer.mode === m
                ? (isFocusActive ? "#ffffff" : "var(--pomo-timer-bg)")
                : "var(--pomo-timer-sub)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tracking-widest capitalize">{m}</span>
          </motion.button>
        ))}
      </div>

      {/* Timer Ring */}
      <div className="relative flex justify-center items-center mb-3">
        <svg className="w-52 h-52 sm:w-56 sm:h-56" viewBox="0 0 110 110">
          <circle
            cx="55"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke={isFocusActive ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}
            strokeWidth="5"
          />
          <motion.circle
            cx="55"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke={
              isFocusActive
                ? (timer.isRunning ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.28)")
                : (timer.isRunning ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.28)")
            }
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{
              strokeDashoffset: CIRCUMFERENCE * (1 - timer.progress / 100),
            }}
            transition={
              timer.isRunning
                ? { duration: 0.6, ease: "easeOut" }
                : { duration: 0 }
            }
            transform="rotate(-90 55 55)"
          />
        </svg>

        <div className="absolute flex flex-col items-center gap-0.5">
          <span
            className="text-6xl sm:text-7xl font-bold tabular-nums leading-none"
            style={{ color: "var(--pomo-timer-text)" }}
          >
            {timer.formattedTime}
          </span>
          <span className="text-[11px] tracking-[0.2em] uppercase font-semibold"
                style={{ color: "var(--pomo-timer-sub)" }}>
            {modeLabel}
          </span>
        </div>
      </div>

      {/* Sub-info row */}
      <div className="flex justify-center mb-4 h-6">
        <AnimatePresence mode="wait">
          {isFocus && (
            <motion.span
              key="focus-sub"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                color: "var(--pomo-timer-sub)",
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              {sessionsUntilLongBreak} session
              {sessionsUntilLongBreak !== 1 ? "s" : ""} until long break
            </motion.span>
          )}
          {isLongBreak && (
            <motion.span
              key="lb-sub"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="text-xs font-medium px-4 py-1 rounded-full"
              style={{
                color: "var(--pomo-card)",
                backgroundColor: "var(--pomo-accent)",
              }}
            >
              Long Break
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-4">
        <motion.div whileTap={{ scale: 0.88 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={timer.reset}
            className="w-10 h-10 rounded-full"
            style={{
              backgroundColor: "var(--pomo-timer-btn)",
              color: isFocusActive ? "#111111" : "var(--pomo-card)",
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={timer.isRunning ? timer.pause : timer.start}
            className="w-36 h-12 rounded-2xl font-bold text-base tracking-widest transition-all duration-200"
            style={{
              backgroundColor: timer.isRunning
                ? (isFocusActive ? "#111111" : "var(--pomo-card)")
                : "var(--pomo-accent)",
              color: timer.isRunning
                ? (isFocusActive ? "#ffffff" : "var(--pomo-timer-bg)")
                : "var(--pomo-timer-text)",
              opacity: timer.isRunning ? 1 : 0.9,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              {timer.isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  PAUSE
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  START
                </>
              )}
            </div>
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.88 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={timer.skip}
            className="w-10 h-10 rounded-full"
            style={{
              backgroundColor: "var(--pomo-timer-btn)",
              color: isFocusActive ? "#111111" : "var(--pomo-card)",
            }}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Running dots */}
      <div className="h-6 flex justify-center items-center mt-3">
        <AnimatePresence>
          {timer.isRunning && (
            <motion.div
              className="flex gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isFocusActive ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
