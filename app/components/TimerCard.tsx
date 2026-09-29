import { memo } from "react";
import { Heart, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import type { TimerMode, TimerSettings } from "../types";
import type { UseTimerResult } from "../hooks/useTimer";
import { focusHeartsFilled } from "../lib/timer";
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

export const TimerCard = memo(function TimerCard({ timer, settings }: TimerCardProps) {
  const cycleLength = Math.max(1, settings.longBreakInterval);
  const filledHearts = focusHeartsFilled(timer.completedSessions, cycleLength, timer.mode);
  const modeLabel = MODES.find(mode => mode.value === timer.mode)?.label ?? "Fokus";
  const primaryLabel = timer.isRunning ? "Jeda" : timer.mode === "focus" ? "Mulai fokus" : "Mulai istirahat";

  return (
    <section className="timer-panel" aria-labelledby="timer-heading">
      <h1 id="timer-heading" className="sr-only">Timer Pomodoro</h1>
      <div className="timer-mode-switch" role="group" aria-label="Pilih mode timer">
        {MODES.slice(0, 2).map(({ value, label }) => (
          <button key={value} type="button" className="timer-mode" aria-pressed={timer.mode === value} onClick={() => timer.switchMode(value)}>{label}</button>
        ))}
      </div>

      <div className="timer-stage">
        <DinosaurMascot cue={timer.cue} />
        <div className="timer-digit" role="timer" aria-live="off">{timer.formattedTime}</div>
        <p className="timer-mode-label">{modeLabel}</p>
        <div className="session-hearts" role="img" aria-label={`${filledHearts} dari ${cycleLength} sesi fokus selesai dalam siklus ini`}>
          {Array.from({ length: cycleLength }, (_, index) => (
            <Heart key={index} size={22} strokeWidth={1.8} fill={index < filledHearts ? "currentColor" : "none"} aria-hidden="true" data-filled={index < filledHearts} />
          ))}
        </div>
      </div>

      <div className="timer-controls">
        <button type="button" className="timer-control timer-control-secondary" onClick={timer.skip} aria-label="Lewati sesi" title="Lewati sesi"><SkipForward size={24} aria-hidden="true" /></button>
        <button type="button" className="timer-control timer-control-primary" onClick={timer.isRunning ? timer.pause : timer.start} aria-label={primaryLabel} title={primaryLabel}>
          {timer.isRunning ? <Pause size={28} fill="currentColor" aria-hidden="true" /> : <Play size={28} fill="currentColor" aria-hidden="true" />}
        </button>
        <button type="button" className="timer-control timer-control-secondary" onClick={timer.reset} aria-label="Ulangi sesi" title="Ulangi sesi"><RotateCcw size={24} aria-hidden="true" /></button>
      </div>
    </section>
  );
});
