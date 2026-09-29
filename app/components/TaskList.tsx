import { memo, useMemo } from "react";
import { Check, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type { Task, TaskPriority } from "../types";

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onClearFinished: () => void;
  onClearAll: () => void;
  onSelectTask: (id: string | null) => void;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
const PRIORITY_LABEL: Record<TaskPriority, string> = { high: "Tinggi", medium: "Sedang", low: "Rendah" };

export const TaskList = memo(function TaskList({
  tasks, activeTaskId, onAddTask, onEditTask, onDeleteTask, onToggleComplete,
  onClearFinished, onClearAll, onSelectTask,
}: TaskListProps) {
  const sortedTasks = useMemo(() => [...tasks].sort((a, b) =>
    Number(a.completed) - Number(b.completed) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.createdAt - b.createdAt,
  ), [tasks]);
  const completedCount = tasks.filter(task => task.completed).length;
  return (
    <section className="surface task-panel p-5 sm:p-6" aria-labelledby="tasks-heading">
      {tasks.length > 0 && (
        <div className="mb-5" aria-label={`${completedCount} dari ${tasks.length} tugas selesai`}>
          <div className="flex justify-between text-sm mb-2"><span>Progres tugas</span><strong>{completedCount}/{tasks.length}</strong></div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--pomo-input)" }}>
            <div className="h-full" style={{ width: `${completedCount / tasks.length * 100}%`, backgroundColor: "var(--pomo-primary)" }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 id="tasks-heading" className="section-heading">Tugas</h2>
          <p className="text-sm mt-1">{tasks.length ? `${tasks.length - completedCount} belum selesai` : "Pilih satu hal untuk dikerjakan"}</p>
        </div>
        {tasks.length > 0 && (
          <details className="relative shrink-0">
            <summary className="header-action !w-10 !h-10 !p-0 list-none cursor-pointer" aria-label="Pilihan tugas"><MoreHorizontal size={18} aria-hidden="true" /></summary>
            <div className="surface absolute right-0 top-11 z-10 w-48 p-2 grid gap-1 text-sm">
              {completedCount > 0 && <button type="button" className="text-left p-2 rounded-md hover:bg-[var(--pomo-input)]" onClick={onClearFinished}>Hapus tugas selesai</button>}
              <button type="button" className="text-left p-2 rounded-md hover:bg-[var(--pomo-input)]" onClick={onClearAll}>Hapus semua tugas</button>
            </div>
          </details>
        )}
      </div>

      {sortedTasks.length === 0 ? (
        <div className="border border-dashed rounded-lg p-6 text-center" style={{ borderColor: "var(--pomo-neutral-light)" }}>
          <p className="font-bold">Belum ada tugas</p>
          <p className="text-sm mt-1">Tambahkan tugas, lalu pilih untuk sesi fokus.</p>
        </div>
      ) : (
        <ul className="grid gap-2 max-h-[420px] overflow-y-auto pr-1">
          {sortedTasks.map(task => (
            <li key={task.id} className="task-row flex items-start gap-2 p-3" data-active={task.id === activeTaskId} data-completed={task.completed}>
              <button
                type="button" className="shrink-0 w-8 h-8 border rounded-md flex items-center justify-center"
                style={{ borderColor: task.completed ? "var(--pomo-completed-border)" : "var(--pomo-primary)", backgroundColor: task.completed ? "var(--pomo-completed-border)" : "transparent", color: "var(--pomo-bg)" }}
                onClick={() => onToggleComplete(task.id)} aria-label={`${task.completed ? "Batalkan selesai" : "Selesaikan"} ${task.title}`}
              >
                {task.completed && <Check size={18} aria-hidden="true" />}
              </button>
              <button
                type="button" className="task-select" onClick={() => onSelectTask(task.id === activeTaskId ? null : task.id)}
                aria-pressed={task.id === activeTaskId} aria-label={`${task.id === activeTaskId ? "Lepas" : "Pilih"} tugas ${task.title}`}
              >
                <span className={`block font-bold break-words ${task.completed ? "line-through" : ""}`}>{task.title}</span>
                {task.notes && !task.completed && <span className="block text-sm mt-1 whitespace-pre-wrap break-words">{task.notes}</span>}
                <span className="block text-xs mt-2">{PRIORITY_LABEL[task.priority]} · {task.actualPomodoros}/{task.estimatedPomodoros} sesi</span>
              </button>
              <div className="flex gap-1 shrink-0">
                <button type="button" className="w-8 h-8 flex items-center justify-center rounded-md" onClick={() => onEditTask(task)} aria-label={`Ubah ${task.title}`}><Pencil size={16} aria-hidden="true" /></button>
                <button type="button" className="w-8 h-8 flex items-center justify-center rounded-md" onClick={() => onDeleteTask(task.id)} aria-label={`Hapus ${task.title}`}><Trash2 size={16} aria-hidden="true" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="w-full min-h-12 mt-4 border-2 border-dashed rounded-md flex items-center justify-center gap-2 font-bold" style={{ borderColor: "var(--pomo-primary)" }} onClick={onAddTask}>
        <Plus size={18} aria-hidden="true" /> Tambahkan tugas
      </button>
    </section>
  );
});
