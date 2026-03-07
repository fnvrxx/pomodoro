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

const PRIORITIES: { value: TaskPriority; label: string; bg: string }[] = [
  { value: "low",    label: "Low",    bg: "bg-[#6B9B7A]" },
  { value: "medium", label: "Medium", bg: "bg-[#F4A261]" },
  { value: "high",   label: "High",   bg: "bg-red-400"   },
];

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [notes, setNotes] = useState("");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [actualPomodoros, setActualPomodoros] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Populate form only when the modal first opens — not on every task prop change.
  // This prevents the timer's per-second re-renders from resetting the form mid-edit.
  useEffect(() => {
    if (!isOpen) return;
    if (task) {
      setTitle(task.title);
      setPriority(task.priority ?? "medium");
      setNotes(task.notes ?? "");
      setEstimatedPomodoros(task.estimatedPomodoros);
      setActualPomodoros(task.actualPomodoros);
    } else {
      setTitle("");
      setPriority("medium");
      setNotes("");
      setEstimatedPomodoros(1);
      setActualPomodoros(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-resize textarea
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
      onSave({ ...task, ...base, actualPomodoros });
    } else {
      onSave(base);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    // Enter only saves from title input, not textarea
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
              className="bg-[#E8E4DC] rounded-3xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto"
              onKeyDown={handleKeyDown}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-[#2D4A35]">
                  {task ? "Edit Task" : "Add Task"}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#D4CFC6] hover:bg-[#C9C4BB]
                             flex items-center justify-center transition-colors duration-150"
                >
                  <X className="w-4 h-4 text-[#6B7B6B]" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">Task</label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                    placeholder="Mau ngerjain apa hari ini?"
                    className="bg-[#D4CFC6] border-none rounded-xl py-3 px-4
                               text-[#2D4A35] placeholder:text-[#9A9A9A]
                               focus:ring-2 focus:ring-[#6B9B7A]/50"
                    autoFocus
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">Prioritas</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors duration-150
                                   ${priority === p.value
                                     ? `${p.bg} text-white`
                                     : "bg-[#D4CFC6] text-[#6B7B6B] hover:bg-[#C9C4BB]"
                                   }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">Catatan</label>
                  <textarea
                    ref={textareaRef}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan... (opsional)"
                    rows={2}
                    className="w-full bg-[#D4CFC6] border-none rounded-xl py-3 px-4
                               text-sm text-[#2D4A35] placeholder:text-[#9A9A9A]
                               focus:outline-none focus:ring-2 focus:ring-[#6B9B7A]/50
                               resize-none leading-relaxed"
                  />
                </div>

                {/* Pomodoros */}
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">
                    {task ? "Act / Est Pomodoros" : "Estimated Pomodoros"}
                  </label>
                  <div className="flex items-center gap-3">
                    {task && (
                      <>
                        <Input
                          type="number"
                          min={0}
                          value={actualPomodoros}
                          onChange={e =>
                            setActualPomodoros(Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="bg-[#D4CFC6] border-none rounded-xl py-3 px-4
                                     text-[#2D4A35] w-20 text-center
                                     focus:ring-2 focus:ring-[#6B9B7A]/50"
                        />
                        <span className="text-[#6B7B6B] font-medium">/</span>
                      </>
                    )}
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={estimatedPomodoros}
                      onChange={e =>
                        setEstimatedPomodoros(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))
                      }
                      className="bg-[#6B7B6B] border-none rounded-xl py-3 px-4
                                 text-white w-20 text-center
                                 focus:ring-2 focus:ring-[#6B9B7A]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-[#6B7B6B] hover:bg-[#D4CFC6]"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="px-6 py-2 rounded-xl bg-[#6B7B6B] hover:bg-[#5A6A5A]
                             text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
