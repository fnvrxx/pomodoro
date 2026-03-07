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
        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors duration-200
          ${open ? "bg-[#6B9B7A] text-white" : "bg-[#E8E4DC] hover:bg-[#DDD8CE] text-[#6B7B6B]"}`}
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
            className="absolute bottom-12 left-0 bg-[#E8E4DC] rounded-2xl p-4 shadow-xl min-w-[180px]"
          >
            <p className="text-xs font-semibold text-[#5A5A5A] mb-3 tracking-wide uppercase">
              Shortcuts
            </p>
            <div className="space-y-2">
              {SHORTCUTS.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#6B7B6B]">{s.label}</span>
                  <kbd className="px-2 py-0.5 bg-[#D4CFC6] rounded-md text-[10px] font-mono font-semibold text-[#2D4A35] min-w-[36px] text-center">
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
