import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import type { Task, TaskPriority } from "@/app/types";

type NewTask = Omit<Task, "id" | "createdAt" | "actualPomodoros" | "completed">;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task | NewTask) => void;
  task: Task | null;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
];

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [notes, setNotes] = useState("");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (task) {
      setTitle(task.title);
      setPriority(task.priority ?? "medium");
      setNotes(task.notes ?? "");
      setEstimatedPomodoros(task.estimatedPomodoros);
    } else {
      setTitle("");
      setPriority("medium");
      setNotes("");
      setEstimatedPomodoros(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [notes]);

  const handleSave = () => {
    if (!title.trim()) return;
    const base = { title: title.trim(), priority, notes: notes.trim(), estimatedPomodoros };
    if (task) {
      // Keep actualPomodoros from original task — don't allow manual editing
      onSave({ ...task, ...base });
    } else {
      onSave(base);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 modal-backdrop z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div
              className="rounded-3xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto"
              style={{ backgroundColor: "var(--pomo-card)" }}
              onKeyDown={handleKeyDown}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold" style={{ color: "var(--pomo-text)" }}>
                  {task ? "Edit Task" : "Add Task"}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
                  style={{ backgroundColor: "var(--pomo-input)" }}
                >
                  <X className="w-4 h-4" style={{ color: "var(--pomo-neutral)" }} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: "var(--pomo-text-secondary)" }}>Task</label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                    placeholder="Mau ngerjain apa hari ini?"
                    className="border-none rounded-xl py-3 px-4"
                    style={{
                      backgroundColor: "var(--pomo-input)",
                      color: "var(--pomo-text)",
                    }}
                    autoFocus
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: "var(--pomo-text-secondary)" }}>Prioritas</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors duration-150"
                        style={{
                          backgroundColor: priority === p.value
                            ? `var(--pomo-priority-${p.value})`
                            : "var(--pomo-input)",
                          color: priority === p.value ? "white" : "var(--pomo-neutral)",
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: "var(--pomo-text-secondary)" }}>Catatan</label>
                  <textarea
                    ref={textareaRef}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan... (opsional)"
                    rows={2}
                    className="w-full border-none rounded-xl py-3 px-4 text-sm focus:outline-none resize-none leading-relaxed"
                    style={{
                      backgroundColor: "var(--pomo-input)",
                      color: "var(--pomo-text)",
                    }}
                  />
                </div>

                {/* Estimated Pomodoros */}
                <div>
                  <label className="block text-sm font-medium mb-2"
                         style={{ color: "var(--pomo-text-secondary)" }}>
                    Estimated Pomodoros
                  </label>
                  <div className="flex items-center gap-3">
                    {task && (
                      <span className="text-sm font-mono px-3 py-2 rounded-xl"
                            style={{
                              backgroundColor: "var(--pomo-input)",
                              color: "var(--pomo-text-muted)",
                            }}>
                        {task.actualPomodoros} done
                      </span>
                    )}
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={estimatedPomodoros}
                      onChange={e =>
                        setEstimatedPomodoros(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))
                      }
                      className="border-none rounded-xl py-3 px-4 w-20 text-center text-white"
                      style={{ backgroundColor: "var(--pomo-neutral)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl"
                  style={{ color: "var(--pomo-neutral)" }}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="px-6 py-2 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "var(--pomo-neutral)" }}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
