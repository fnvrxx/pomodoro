import type { CSSProperties } from "react";

const PARTICLES = Array.from({ length: 36 }, (_, index) => {
  const angle = (index / 36) * Math.PI * 2;
  const distance = 140 + (index % 5) * 32;
  return {
    "--particle-x": `${Math.cos(angle) * distance}px`,
    "--particle-y": `${Math.sin(angle) * distance - 100}px`,
    "--particle-spin": `${180 + index * 37}deg`,
    "--particle-delay": `${(index % 4) * 35}ms`,
  } as CSSProperties;
});

export function ConfettiBurst() {
  return (
    <div className="confetti-burst" aria-hidden="true">
      {PARTICLES.map((style, index) => <span key={index} className="confetti-particle" style={style} />)}
    </div>
  );
}
