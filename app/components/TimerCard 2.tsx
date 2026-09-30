import { memo } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import type { TimerMode, TimerSettings } from "../types";
import type { UseTimerResult } from "../hooks/useTimer";
import { DinosaurMascot } from "./DinosaurMascot";

interface TimerCardProps {
  timer: UseTimerResult;
  settings: TimerSettings;
}

const MODES: { value: TimerMode; label: string }[] = [
  { value: "focus", label: "Fokus" },
  { value: "break", label: "Istirahat" },
  { value: "longBreak", label: "Istirahat panjang" },
];
const SELECTABLE_MODES = MODES.slice(0, 2);
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const TimerCard = memo(function TimerCard({ timer, settings }: TimerCardProps) {
  const sessionsUntilLongBreak = settings.longBreakInterval - (timer.completedSessions % settings.longBreakInterval);
  const modeLabel = MODES.find(mode => mode.value === timer.mode)?.label ?? "Fokus";

  return (
    <section className="timer-panel" aria-labelledby="timer-heading">
      <h1 id="timer-heading" className="sr-only">Timer Pomodoro</h1>
      <div className="flex flex-wrap justify-center gap-2 mb-5" role="group" aria-label="Pilih mode timer">
        {SELECTABLE_MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => timer.switchMode(value)}
            aria-pressed={timer.mode === value}
            className="min-h-9 px-3 rounded-md border text-sm font-bold"
            style={{
              color: timer.mode === value ? "var(--pomo-timer-bg)" : "var(--pomo-timer-text)",
              backgroundColor: timer.mode === value ? "var(--pomo-timer-text)" : "transparent",
              borderColor: "var(--pomo-timer-text)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative flex justify-center items-center">
        <svg className="w-56 h-56 sm:w-60 sm:h-60" viewBox="0 0 110 110" aria-hidden="true">
          <circle cx="55" cy="55" r={RADIUS} fill="none" stroke="var(--pomo-timer-text)" strokeOpacity=".22" strokeWidth="2" />
          <circle
            cx="55" cy="55" r={RADIUS} fill="none" stroke="var(--pomo-highlight)" strokeWidth="3"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (timer.progress / 100)}
            transform="rotate(-90 55 55)"
            style={{ transition: "stroke-dashoffset .4s linear" }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="timer-digit text-[clamp(58px,10vw,72px)]" role="timer" aria-live="off">{timer.formattedTime}</div>
          <p className="text-sm font-bold mt-2" style={{ color: "var(--pomo-timer-sub)" }}>{modeLabel}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 min-h-14 my-2">
        <DinosaurMascot cue={timer.cue} />
        <p className="text-sm max-w-48" style={{ color: "var(--pomo-timer-sub)" }}>
          {timer.mode === "focus" ? `${sessionsUntilLongBreak} sesi lagi menuju istirahat panjang` : "Ambil jeda sebelum sesi berikutnya"}
        </p>
      </div>

      <div className="flex justify-center items-center gap-3">
        <button type="button" className="timer-control timer-control-secondary" onClick={timer.reset} aria-label="Ulangi sesi">
          <RotateCcw size={19} aria-hidden="true" />
        </button>
        <button type="button" className="timer-control timer-control-primary" onClick={timer.isRunning ? timer.pause : timer.start}>
          {timer.isRunning ? <Pause size={19} aria-hidden="true" /> : <Play size={19} aria-hidden="true" />}
          {timer.isRunning ? "Jeda" : timer.mode === "focus" ? "Mulai fokus" : "Mulai istirahat"}
        </button>
        <button type="button" className="timer-control timer-control-secondary" onClick={timer.skip} aria-label="Lewati sesi">
          <SkipForward size={19} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
});
