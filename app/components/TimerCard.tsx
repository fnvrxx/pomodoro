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
}

const RADIUS = 50 - 5 / 2; // SVG size is 110, stroke width is 5, so radius is (110/2) - (5/2)
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerCard({ timer, settings }: TimerCardProps) {
  const isFocus = timer.mode === "focus";
  const isLongBreak = timer.mode === "longBreak";

  const sessionsUntilLongBreak =
    settings.longBreakInterval -
    (timer.completedSessions % settings.longBreakInterval);

  const modeLabel = isFocus ? "Focus" : isLongBreak ? "Long Break" : "Break";

  return (
    <div className="bg-[#6B9B7A] rounded-3xl px-4 pt-3 pb-2 shadow-xl">
      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 mb-4">
        {(["focus", "break"] as TimerMode[]).map((m) => (
          <motion.button
            key={m}
            onClick={() => timer.switchMode(m)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
              timer.mode === m
                ? "bg-[#E8E4DC] text-[#6B9B7A]"
                : "text-[#3D5A45] hover:bg-[#5A8A69]"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tracking-widest capitalize">{m}</span>
          </motion.button>
        ))}
      </div>

      {/* Timer Ring */}
      <div className="relative flex justify-center items-center mb-3">
        <svg className="w-52 h-52 sm:w-56 sm:h-56" viewBox="0 0 110 110">
          {/* Track */}
          <circle
            cx="55"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="5"
          />
          {/* Progress arc */}
          <motion.circle
            cx="55"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke={
              timer.isRunning
                ? "rgba(255,255,255,0.6)"
                : "rgba(255,255,255,0.28)"
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

        {/* Center content */}
        <div className="absolute flex flex-col items-center gap-0.5">
          <motion.span
            className="text-6xl sm:text-7xl font-bold text-[#2D4A35] tabular-nums leading-none"
            key={timer.formattedTime}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {timer.formattedTime}
          </motion.span>
          <span className="text-[11px] text-[#3D5A45] tracking-[0.2em] uppercase font-semibold">
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
              className="text-xs text-[#3D5A45] bg-[#5A8A69]/30 px-3 py-1 rounded-full"
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
              className="text-xs font-medium text-[#E8E4DC] bg-[#F4A261] px-4 py-1 rounded-full"
            >
              Long Break ☕
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
            className="w-10 h-10 rounded-full bg-[#5A8A69] hover:bg-[#4A7A59] text-[#E8E4DC]"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={timer.isRunning ? timer.pause : timer.start}
            className={`
              w-36 h-12 rounded-2xl font-bold text-base tracking-widest
              transition-all duration-200
              ${
                timer.isRunning
                  ? "bg-[#E8E4DC]/90 hover:bg-[#E8E4DC] text-[#6B9B7A]"
                  : "bg-[#F4A261] hover:bg-[#E8924F] text-[#2D4A35] opacity-90 hover:opacity-100"
              }
            `}
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
            className="w-10 h-10 rounded-full bg-[#5A8A69] hover:bg-[#4A7A59] text-[#E8E4DC]"
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
                  className="w-1.5 h-1.5 rounded-full bg-[#E8E4DC]/60"
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
