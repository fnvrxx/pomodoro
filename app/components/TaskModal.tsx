import { useState } from "react";
import type { FormEvent } from "react";
import type { Task, TaskPriority } from "../types";
import { AppDialog } from "./AppDialog";

type NewTask = Omit<Task, "id" | "createdAt" | "actualPomodoros" | "completed">;
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task | NewTask) => void;
  task: Task | null;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
];

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [estimate, setEstimate] = useState(task?.estimatedPomodoros ?? 1);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    const values = { title: title.trim(), priority, notes: notes.trim(), estimatedPomodoros: estimate };
    onSave(task ? { ...task, ...values } : values);
  };

  return (
    <AppDialog open={isOpen} onClose={onClose} title={task ? "Ubah tugas" : "Tugas baru"}>
      <form onSubmit={save} className="grid gap-5">
        <div>
          <label className="field-label" htmlFor="task-title">Nama tugas</label>
          <input id="task-title" className="field-input" value={title} onChange={event => setTitle(event.target.value)} placeholder="Apa yang ingin dikerjakan?" required maxLength={120} autoFocus />
        </div>
        <fieldset>
          <legend className="field-label">Prioritas</legend>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map(option => (
              <button key={option.value} type="button" className="choice-button flex-1" aria-pressed={priority === option.value} onClick={() => setPriority(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="field-label" htmlFor="task-notes">Catatan</label>
          <textarea id="task-notes" className="field-input min-h-24 resize-y" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Opsional" />
        </div>
        <div>
          <label className="field-label" htmlFor="task-estimate">Perkiraan sesi fokus</label>
          <input id="task-estimate" className="field-input !w-24" type="number" min={1} max={50} value={estimate} onChange={event => setEstimate(Math.min(50, Math.max(1, Number(event.target.value) || 1)))} required />
          {task && <p className="text-sm mt-2">{task.actualPomodoros} sesi selesai</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="action-button action-button-secondary" onClick={onClose}>Batal</button>
          <button type="submit" className="action-button" disabled={!title.trim()}>Simpan tugas</button>
        </div>
      </form>
    </AppDialog>
  );
}
