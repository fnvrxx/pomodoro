import { motion, AnimatePresence } from "framer-motion";

interface TaskCompletionProgressProps {
  completedCount: number;
  totalCount: number;
}

// Plant SVG stages based on progress percentage
function PlantVisual({ percentage }: { percentage: number }) {
  const stage =
    percentage === 0 ? 0
    : percentage < 25 ? 1
    : percentage < 50 ? 2
    : percentage < 75 ? 3
    : percentage < 100 ? 4
    : 5;

  // Colors based on stage
  const stemColor = stage === 0 ? "#B8B3AA" : "var(--pomo-primary)";
  const leafColor = stage === 0 ? "#C9C4BB" : "var(--pomo-primary)";
  const darkLeaf = stage === 0 ? "#B0ABA2" : "var(--pomo-primary-dark)";
  const flowerColor = "var(--pomo-accent)";
  const soilColor = "var(--pomo-neutral-light)";
  const potColor = "var(--pomo-input)";
  const potRim = "var(--pomo-neutral-lighter)";

  return (
    <motion.div
      key={stage}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
    >
      <svg width="72" height="90" viewBox="0 0 72 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pot */}
        <path d="M18 72 L54 72 L50 86 L22 86 Z" fill={potColor} />
        <rect x="14" y="68" width="44" height="6" rx="3" fill={potRim} />
        {/* Soil */}
        <ellipse cx="36" cy="68" rx="22" ry="4" fill={soilColor} opacity="0.7" />

        {/* Stage 0 — just soil/seed */}
        {stage === 0 && (
          <motion.ellipse
            cx="36" cy="66" rx="4" ry="2.5"
            fill={stemColor} opacity="0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        )}

        {/* Stage 1 — tiny sprout */}
        {stage >= 1 && (
          <motion.g
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            style={{ transformOrigin: "36px 68px" }}
            transition={{ duration: 0.5 }}
          >
            {/* Stem */}
            <line x1="36" y1="68" x2="36" y2="52" stroke={stemColor} strokeWidth="2.5" strokeLinecap="round" />
            {/* Two tiny leaves */}
            <motion.path d="M36 58 Q28 54 30 48" stroke={leafColor} strokeWidth="2" fill="none" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2 }} />
            <motion.path d="M36 58 Q44 54 42 48" stroke={leafColor} strokeWidth="2" fill="none" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.3 }} />
          </motion.g>
        )}

        {/* Stage 2 — small plant with leaves */}
        {stage >= 2 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Stem extension */}
            <line x1="36" y1="52" x2="36" y2="38" stroke={stemColor} strokeWidth="2.5" strokeLinecap="round" />
            {/* Left leaf */}
            <motion.path d="M36 46 Q22 42 24 34" stroke={leafColor} strokeWidth="2.5" fill={leafColor} fillOpacity="0.25" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.1 }} />
            {/* Right leaf */}
            <motion.path d="M36 46 Q50 42 48 34" stroke={leafColor} strokeWidth="2.5" fill={leafColor} fillOpacity="0.25" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
          </motion.g>
        )}

        {/* Stage 3 — bigger, more leaves */}
        {stage >= 3 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Stem extension */}
            <line x1="36" y1="38" x2="34" y2="24" stroke={stemColor} strokeWidth="2.5" strokeLinecap="round" />
            {/* Big left leaf */}
            <motion.path d="M35 33 Q16 28 20 18" stroke={darkLeaf} strokeWidth="2.5" fill={leafColor} fillOpacity="0.35" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.1 }} />
            {/* Big right leaf */}
            <motion.path d="M35 33 Q54 28 50 18" stroke={darkLeaf} strokeWidth="2.5" fill={leafColor} fillOpacity="0.35" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
          </motion.g>
        )}

        {/* Stage 4 — almost blooming, bud appears */}
        {stage >= 4 && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: "34px 22px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Stem top */}
            <line x1="34" y1="24" x2="34" y2="16" stroke={stemColor} strokeWidth="2.5" strokeLinecap="round" />
            {/* Bud */}
            <ellipse cx="34" cy="13" rx="5" ry="7" fill={flowerColor} opacity="0.7" />
            <ellipse cx="34" cy="14" rx="3.5" ry="5" fill={flowerColor} opacity="0.9" />
          </motion.g>
        )}

        {/* Stage 5 — full bloom */}
        {stage >= 5 && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: "34px 14px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Petals */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.ellipse
                key={angle}
                cx={34 + 9 * Math.cos((angle * Math.PI) / 180)}
                cy={14 + 9 * Math.sin((angle * Math.PI) / 180)}
                rx="5" ry="3.5"
                fill={flowerColor}
                opacity="0.85"
                style={{
                  transformOrigin: `${34 + 9 * Math.cos((angle * Math.PI) / 180)}px ${14 + 9 * Math.sin((angle * Math.PI) / 180)}px`,
                  rotate: `${angle}deg`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.85 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
              />
            ))}
            {/* Center */}
            <motion.circle cx="34" cy="14" r="5.5" fill={flowerColor}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            />
            <circle cx="34" cy="14" r="3.5" fill="white" opacity="0.5" />
            {/* Sparkles */}
            {[[-10, -8], [10, -8], [0, -16]].map(([dx, dy], i) => (
              <motion.g key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ duration: 1.2, delay: 0.6 + i * 0.15, repeat: Infinity, repeatDelay: 1.5 }}
                style={{ transformOrigin: `${34 + dx}px ${14 + dy}px` }}
              >
                <line x1={34 + dx - 3} y1={14 + dy} x2={34 + dx + 3} y2={14 + dy} stroke={flowerColor} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={34 + dx} y1={14 + dy - 3} x2={34 + dx} y2={14 + dy + 3} stroke={flowerColor} strokeWidth="1.5" strokeLinecap="round" />
              </motion.g>
            ))}
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}

const STAGE_LABELS = [
  "Benih menunggu...",
  "Mulai berkecambah!",
  "Tumbuh perlahan...",
  "Semakin subur!",
  "Hampir mekar!",
  "Bunga mekar! Luar biasa! 🌸",
];

export function TaskCompletionProgress({
  completedCount,
  totalCount,
}: TaskCompletionProgressProps) {
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const stage =
    percentage === 0 ? 0
    : percentage < 25 ? 1
    : percentage < 50 ? 2
    : percentage < 75 ? 3
    : percentage < 100 ? 4
    : 5;

  const getProgressStyle = () => {
    if (percentage === 0) return { backgroundColor: "var(--pomo-input)" };
    if (percentage < 30) return { backgroundColor: "var(--pomo-accent)" };
    return { backgroundColor: "var(--pomo-primary)" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-4 shadow-md"
      style={{ backgroundColor: "var(--pomo-card)" }}
    >
      {/* Plant + Stats row */}
      <div className="flex items-end gap-4 mb-3">
        {/* Plant visual */}
        <PlantVisual percentage={percentage} />

        {/* Right side: label + percentage */}
        <div className="flex-1 flex flex-col justify-end pb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold" style={{ color: "var(--pomo-text)" }}>
              Task Progress
            </span>
            <motion.span
              key={percentage}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-xl font-bold"
              style={{ color: percentage === 100 ? "var(--pomo-primary)" : "var(--pomo-text)" }}
            >
              {percentage}%
            </motion.span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--pomo-text-muted)" }}>
              <span className="font-semibold" style={{ color: "var(--pomo-primary)" }}>{completedCount}</span>
              {" "}dari{" "}
              <span className="font-semibold" style={{ color: "var(--pomo-text)" }}>{totalCount}</span>
              {" "}tugas
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 rounded-full overflow-hidden"
               style={{ backgroundColor: "var(--pomo-input)" }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={getProgressStyle()}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white/40 to-transparent" />
            </motion.div>
          </div>

          {/* Stage label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={stage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-xs mt-1.5 font-medium"
              style={{
                color: percentage === 0
                  ? "var(--pomo-text-muted)"
                  : percentage < 50
                    ? "var(--pomo-accent)"
                    : "var(--pomo-primary)",
              }}
            >
              {STAGE_LABELS[stage]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
