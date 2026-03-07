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
import type { Task, TaskPriority } from "@/app/types";

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low:    'bg-[#6B9B7A]',
  medium: 'bg-[#F4A261]',
  high:   'bg-red-400',
};

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
}

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onSelect: (taskId: string | null) => void;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

// Memoized task item — prevents re-render when other tasks change
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
      className={`
        group flex items-center justify-between p-3 rounded-xl cursor-pointer
        transition-colors duration-150
        ${
          task.completed
            ? "bg-[#D4CFC6] opacity-60"
            : isActive
              ? "bg-[#6B9B7A] text-white shadow-md"
              : "bg-[#D4CFC6] hover:bg-[#C9C4BB] hover:shadow-sm"
        }
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className={`
            w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-150 flex-shrink-0
            ${
              task.completed
                ? "bg-[#6B7B6B] text-white"
                : isActive
                  ? "bg-white/20 text-white border-2 border-white/50 hover:bg-white/30"
                  : "bg-white border-2 border-[#6B7B6B] text-transparent hover:border-[#5A6A5A]"
            }
          `}
        >
          {task.completed && <Check className="w-3.5 h-3.5" />}
        </button>

        {/* Task Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {task.priority && (
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isActive ? 'bg-white/70' : PRIORITY_DOT[task.priority]
              }`} />
            )}
            <span
              className={`font-medium truncate block ${task.completed ? "line-through opacity-60" : ""}`}
            >
              {task.title}
            </span>
          </div>
          {/* Notes preview */}
          {task.notes && !task.completed && (
            <p className={`text-xs mt-0.5 truncate italic ${isActive ? "text-white/70" : "text-[#6B7B6B]"}`}>
              {task.notes}
            </p>
          )}
          {/* Pomodoro dots */}
          {!task.completed && task.actualPomodoros > 0 && (
            <div className="flex gap-0.5 mt-1">
              {[...Array(Math.min(task.actualPomodoros, 5))].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/60" : "bg-[#6B9B7A]/60"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: count + menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`
          text-sm font-mono px-2 py-1 rounded-md
          ${isActive ? "bg-white/20 text-white" : "bg-[#E8E4DC] text-[#6B7B6B]"}
        `}
        >
          {task.actualPomodoros}/{task.estimatedPomodoros}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className={`
                w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150
                ${isActive ? "hover:bg-white/20 text-white" : "hover:bg-[#B8B3AA] text-[#6B7B6B]"}
              `}
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[120px] bg-[#E8E4DC] border border-[#D4CFC6] shadow-lg rounded-xl p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              onClick={() => onEditTask(task)}
              className="rounded-lg px-3 py-2 text-sm text-[#2D4A35] cursor-pointer
                         hover:bg-[#6B9B7A] hover:text-white focus:bg-[#6B9B7A] focus:text-white
                         transition-colors duration-150"
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
  const allTasksCompleted =
    tasks.length > 0 && completedTasks.length === tasks.length;

  return (
    <div className="bg-[#E8E4DC] rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#2D4A35]">Task</h2>
          {tasks.length > 0 && (
            <span className="text-xs bg-[#6B9B7A]/20 text-[#6B9B7A] px-2 py-1 rounded-full font-medium">
              {incompleteTasks.length} pending
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-full hover:bg-[#D4CFC6] text-[#6B7B6B]"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#6B7B6B] border-none text-white"
          >
            <DropdownMenuItem
              onClick={onClearFinished}
              className="hover:bg-[#5A6A5A] cursor-pointer focus:bg-[#5A6A5A]"
              disabled={completedTasks.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear finished Task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onClearAll}
              className="hover:bg-[#5A6A5A] cursor-pointer focus:bg-[#5A6A5A]"
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
            className="mb-4 p-3 bg-[#6B9B7A]/20 rounded-xl border border-[#6B9B7A]/30 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-sm text-[#4A7A59]">
              <div className="w-2 h-2 rounded-full bg-[#6B9B7A]" />
              Currently focusing on:
            </div>
            <div className="font-medium text-[#2D4A35] mt-1">
              {activeTask.title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-[#8A8A8A]"
            >
              <div className="text-sm">Tidak ada Task</div>
              <p className="text-xs mt-1">Tambahkan task untuk memulai!</p>
            </motion.div>
          ) : (
            tasks.map((task) => (
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
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#B8B3AA]
                   text-[#8A8A8A] hover:text-[#6B7B6B] hover:border-[#6B7B6B] hover:bg-[#6B7B6B]/5
                   transition-colors duration-150 flex items-center justify-center gap-2"
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
