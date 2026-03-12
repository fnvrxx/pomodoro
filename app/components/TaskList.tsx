import { useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreVertical, Check, Trash2, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { TaskCompletionProgress } from "./TaskCompletionProgress";
import { MotivationalQuote } from "./MotivationalQuote";
import type { Task, TaskPriority, TimerSettings } from "@/app/types";

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onClearFinished: () => void;
  onClearAll: () => void;
  onSelectTask: (taskId: string | null) => void;
  settings: TimerSettings;
}

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onSelect: (taskId: string | null) => void;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const TaskItem = memo(function TaskItem({
  task,
  isActive,
  onSelect,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}: TaskItemProps) {
  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(isActive ? null : task.id)}
      className="group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-150"
      style={{
        backgroundColor: task.completed
          ? "var(--pomo-input)"
          : isActive
            ? "var(--pomo-primary)"
            : "var(--pomo-input)",
        color: isActive && !task.completed ? "white" : "var(--pomo-text)",
        opacity: task.completed ? 0.6 : 1,
        boxShadow: isActive && !task.completed ? "0 4px 6px -1px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-150 flex-shrink-0 mt-0.5"
          style={{
            backgroundColor: task.completed
              ? "var(--pomo-neutral)"
              : isActive
                ? "rgba(255,255,255,0.2)"
                : "white",
            color: task.completed ? "white" : "transparent",
            border: task.completed
              ? "none"
              : isActive
                ? "2px solid rgba(255,255,255,0.5)"
                : `2px solid var(--pomo-neutral)`,
          }}
        >
          {task.completed && <Check className="w-3.5 h-3.5" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {task.priority && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: isActive && !task.completed
                    ? "rgba(255,255,255,0.7)"
                    : `var(--pomo-priority-${task.priority})`,
                }}
              />
            )}
            <span
              className={`font-medium truncate block ${task.completed ? "line-through opacity-60" : ""}`}
            >
              {task.title}
            </span>
          </div>
          {/* Notes preview */}
          {task.notes && !task.completed && (
            <div
              className="mt-1.5 p-2 rounded-lg text-xs whitespace-pre-wrap leading-relaxed"
              style={{
                backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.04)",
                color: isActive ? "rgba(255,255,255,0.8)" : "var(--pomo-neutral)",
              }}
            >
              {task.notes}
            </div>
          )}
          {/* Pomodoro dots */}
          {!task.completed && task.actualPomodoros > 0 && (
            <div className="flex gap-0.5 mt-1">
              {[...Array(Math.min(task.actualPomodoros, 5))].map((_, i) => (
                <div
                  key={`dot-${task.id}-${i}`}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(255,255,255,0.6)"
                      : "var(--pomo-primary)",
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: count + menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-sm font-mono px-2 py-1 rounded-md"
          style={{
            backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "var(--pomo-card)",
            color: isActive ? "white" : "var(--pomo-neutral)",
          }}
        >
          {task.actualPomodoros}/{task.estimatedPomodoros}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{
                color: isActive ? "white" : "var(--pomo-neutral)",
              }}
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[120px] shadow-lg rounded-xl p-1"
            style={{
              backgroundColor: "var(--pomo-card)",
              borderColor: "var(--pomo-input)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              onClick={() => onEditTask(task)}
              className="rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors duration-150"
              style={{ color: "var(--pomo-text)" }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteTask(task.id)}
              className="rounded-lg px-3 py-2 text-sm text-red-500 cursor-pointer
                         hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white
                         transition-colors duration-150"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
});

export function TaskList({
  tasks,
  activeTaskId,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onClearFinished,
  onClearAll,
  onSelectTask,
  settings,
}: TaskListProps) {
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed),
    [tasks],
  );
  const incompleteTasks = useMemo(
    () => tasks.filter((t) => !t.completed),
    [tasks],
  );

  // Sorted: incomplete first (by priority high>med>low), then completed (by priority)
  const sortedTasks = useMemo(() => {
    const sortByPriority = (a: Task, b: Task) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    return [
      ...incompleteTasks.sort(sortByPriority),
      ...completedTasks.sort(sortByPriority),
    ];
  }, [incompleteTasks, completedTasks]);

  const allTasksCompleted =
    tasks.length > 0 && completedTasks.length === tasks.length;

  // Estimated completion time for active task
  const estimatedEndTime = useMemo(() => {
    if (!activeTask || activeTask.completed) return null;
    const remaining = activeTask.estimatedPomodoros - activeTask.actualPomodoros;
    if (remaining <= 0) return null;
    const totalMinutes =
      remaining * settings.focusDuration +
      (remaining - 1) * settings.breakDuration;
    const end = new Date(Date.now() + totalMinutes * 60 * 1000);
    return end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }, [activeTask, settings.focusDuration, settings.breakDuration]);

  return (
    <div className="rounded-3xl p-5 sm:p-6 shadow-xl"
         style={{ backgroundColor: "var(--pomo-card)" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold" style={{ color: "var(--pomo-text)" }}>Task</h2>
          {tasks.length > 0 && (
            <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--pomo-primary) 20%, transparent)",
                    color: "var(--pomo-primary)",
                  }}>
              {incompleteTasks.length} pending
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-full"
              style={{ color: "var(--pomo-neutral)" }}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-none text-white"
            style={{ backgroundColor: "var(--pomo-neutral)" }}
          >
            <DropdownMenuItem
              onClick={onClearFinished}
              className="cursor-pointer"
              disabled={completedTasks.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear finished Task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onClearAll}
              className="cursor-pointer"
              disabled={tasks.length === 0}
            >
              <X className="w-4 h-4 mr-2" />
              Clear all Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Task Display */}
      <AnimatePresence>
        {activeTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-xl overflow-hidden"
            style={{
              backgroundColor: "color-mix(in srgb, var(--pomo-primary) 20%, transparent)",
              border: "1px solid color-mix(in srgb, var(--pomo-primary) 30%, transparent)",
            }}
          >
            <div className="flex items-center gap-2 text-sm"
                 style={{ color: "var(--pomo-primary-darker)" }}>
              <div className="w-2 h-2 rounded-full"
                   style={{ backgroundColor: "var(--pomo-primary)" }} />
              Currently focusing on:
            </div>
            <div className="font-medium mt-1" style={{ color: "var(--pomo-text)" }}>
              {activeTask.title}
            </div>
            {estimatedEndTime && (
              <div className="text-xs mt-1" style={{ color: "var(--pomo-primary-dark)" }}>
                Est. selesai: {estimatedEndTime}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        <AnimatePresence mode="sync">
          {sortedTasks.length === 0 ? (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
              style={{ color: "var(--pomo-text-muted)" }}
            >
              <div className="text-sm">Tidak ada Task</div>
              <p className="text-xs mt-1">Tambahkan task untuk memulai!</p>
            </motion.div>
          ) : (
            sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isActive={task.id === activeTaskId}
                onSelect={onSelectTask}
                onToggleComplete={onToggleComplete}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Button */}
      <button
        onClick={onAddTask}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed transition-colors duration-150 flex items-center justify-center gap-2"
        style={{
          borderColor: "var(--pomo-neutral-light)",
          color: "var(--pomo-text-muted)",
        }}
      >
        <Plus className="w-4 h-4" />
        <span className="font-medium">Tambahkan Task</span>
      </button>

      {/* Task Completion Progress */}
      <AnimatePresence>
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskCompletionProgress
              completedCount={completedTasks.length}
              totalCount={tasks.length}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivational Quote */}
      <MotivationalQuote show={allTasksCompleted} />
    </div>
  );
}
