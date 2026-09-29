import type { UseTimerResult } from "../hooks/useTimer";

export function DinosaurMascot({ cue }: { cue: UseTimerResult["cue"] }) {
  return (
    <svg key={cue?.sequence ?? 0} className="dino-mascot" data-cue={cue?.kind} viewBox="0 0 144 132" role="img" aria-label="Dinosaurus kecil sedang belajar">
      <ellipse cx="72" cy="122" rx="48" ry="6" fill="#E9E4DF" />
      <path d="M46 88c-13 4-24 0-29-11 1 20 15 30 32 27" fill="#67B77C" stroke="#325B40" strokeWidth="3" strokeLinejoin="round" />
      <path d="M35 49 42 35l9 11 6-16 10 13 9-15 10 16" fill="#F69B67" stroke="#B95D39" strokeWidth="2" strokeLinejoin="round" />
      <path d="M37 60c0-23 17-40 41-40 28 0 43 20 43 46v31c0 15-15 25-40 25-27 0-44-13-44-32Z" fill="#79C98A" stroke="#325B40" strokeWidth="3" />
      <path d="M63 71c11-9 30-9 42 0 6 5 8 13 8 23v13c-8 9-19 14-33 14-17 0-31-6-39-16V91c0-9 9-17 22-20Z" fill="#A9DEAD" />
      <path d="M72 70c9-10 22-13 34-8 11 5 20 15 20 26 0 9-8 16-19 16H85" fill="#79C98A" stroke="#325B40" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="76" cy="58" r="4" fill="#24332A" />
      <circle cx="99" cy="58" r="4" fill="#24332A" />
      <circle cx="77" cy="57" r="1.2" fill="white" />
      <circle cx="100" cy="57" r="1.2" fill="white" />
      <ellipse cx="68" cy="70" rx="5" ry="3" fill="#F5A48A" opacity=".75" />
      <path d="M84 75c4 5 11 5 15 0" fill="none" stroke="#325B40" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M45 102c-8 3-13 10-13 16h34l5-14M99 103l5 15h27c-1-7-7-13-15-16" fill="#67B77C" stroke="#325B40" strokeWidth="3" strokeLinejoin="round" />
      <rect x="53" y="89" width="55" height="28" rx="4" fill="#EFF4F2" stroke="#6A8077" strokeWidth="2.5" />
      <path d="M49 118h63" stroke="#6A8077" strokeWidth="4" strokeLinecap="round" />
      <path d="M77 100h7v6h-7z" fill="#F69B67" />
    </svg>
  );
}
