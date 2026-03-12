"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "lucide-react";

const SHORTCUTS = [
  { key: "Space", label: "Start / Pause" },
  { key: "R", label: "Reset timer" },
  { key: "S", label: "Skip session" },
  { key: "N", label: "New task" },
];

export function KeyboardShortcutsHint() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-10">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors duration-200"
        style={{
          backgroundColor: open ? "var(--pomo-primary)" : "var(--pomo-card)",
          color: open ? "white" : "var(--pomo-neutral)",
        }}
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-12 left-0 rounded-2xl p-4 shadow-xl min-w-[180px]"
            style={{ backgroundColor: "var(--pomo-card)" }}
          >
            <p className="text-xs font-semibold mb-3 tracking-wide uppercase"
               style={{ color: "var(--pomo-text-secondary)" }}>
              Shortcuts
            </p>
            <div className="space-y-2">
              {SHORTCUTS.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-4">
                  <span className="text-xs" style={{ color: "var(--pomo-neutral)" }}>{s.label}</span>
                  <kbd className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold min-w-[36px] text-center"
                       style={{
                         backgroundColor: "var(--pomo-input)",
                         color: "var(--pomo-text)",
                       }}>
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
