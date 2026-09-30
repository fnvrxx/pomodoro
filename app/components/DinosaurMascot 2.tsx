import type { UseTimerResult } from "../hooks/useTimer";

export function DinosaurMascot({ cue }: { cue: UseTimerResult["cue"] }) {
  return (
    <svg
      key={cue?.sequence ?? 0}
      className="dino-mascot"
      data-cue={cue?.kind}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Maskot dinosaurus"
      shapeRendering="crispEdges"
    >
      <path fill="currentColor" d="M13 2h8v2h1v4h-2v1h-5v2h3v2h-2v-1h-2v4h-2v3h-2v3H7v-2h1v-3H6v-2H4v-2H2v-3h2v2h2v1h2v1h2V9h3V2Zm-2 17v3H9v-3h2Zm6-3v6h-2v-6h2Z" />
      <rect x="18" y="4" width="2" height="2" fill="var(--pomo-timer-bg)" />
      <rect x="18" y="8" width="4" height="1" fill="var(--pomo-timer-bg)" />
    </svg>
  );
}
