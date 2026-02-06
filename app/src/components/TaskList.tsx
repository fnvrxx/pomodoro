import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task } from '@/types';

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
  const activeTask = tasks.find(t => t.id === activeTaskId);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

  return (
    <div className="bg-[#E8E4DC] rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#2D4A35]">Task</h2>
        
        {/* Clear Menu Dropdown */}
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
          <DropdownMenuContent align="end" className="bg-[#6B7B6B] border-none text-white">
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
      {activeTask && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-[#6B9B7A]/20 rounded-xl border border-[#6B9B7A]/30"
        >
          <div className="flex items-center gap-2 text-sm text-[#4A7A59]">
            <div className="w-2 h-2 rounded-full bg-[#6B9B7A] animate-pulse" />
            Currently focusing on:
          </div>
          <div className="font-medium text-[#2D4A35] mt-1">{activeTask.title}</div>
        </motion.div>
      )}

      {/* Task List */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-[#8A8A8A]"
            >
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Add a task to get started</p>
            </motion.div>
          ) : (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  layout: { duration: 0.2 }
                }}
                onClick={() => onSelectTask(task.id === activeTaskId ? null : task.id)}
                className={`
                  group flex items-center justify-between p-3 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${task.completed 
                    ? 'bg-[#D4CFC6] opacity-60' 
                    : task.id === activeTaskId
                      ? 'bg-[#6B9B7A] text-white'
                      : 'bg-[#D4CFC6] hover:bg-[#C9C4BB]'
                  }
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Checkbox */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task.id);
                    }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                      w-5 h-5 rounded flex items-center justify-center transition-all duration-200
                      ${task.completed 
                        ? 'bg-[#6B7B6B] text-white' 
                        : task.id === activeTaskId
                          ? 'bg-white/20 text-white border-2 border-white/50'
                          : 'bg-white border-2 border-[#6B7B6B] text-transparent hover:border-[#5A6A5A]'
                      }
                    `}
                  >
                    <Check className="w-3 h-3" />
                  </motion.button>

                  {/* Task Title */}
                  <span className={`
                    font-medium truncate flex-1
                    ${task.completed ? 'line-through' : ''}
                  `}>
                    {task.title}
                  </span>
                </div>

                {/* Pomodoro Count */}
                <div className="flex items-center gap-2">
                  <span className={`
                    text-sm font-mono
                    ${task.id === activeTaskId ? 'text-white/80' : 'text-[#6B7B6B]'}
                  `}>
                    {task.actualPomodoros}/{task.estimatedPomodoros}
                  </span>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className={`
                          w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                          ${task.id === activeTaskId 
                            ? 'hover:bg-white/20 text-white' 
                            : 'hover:bg-[#B8B3AA] text-[#6B7B6B]'
                          }
                        `}
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTask(task)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteTask(task.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Button */}
      <motion.button
        onClick={onAddTask}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#B8B3AA] 
                   text-[#8A8A8A] hover:text-[#6B7B6B] hover:border-[#6B7B6B] hover:bg-[#6B7B6B]/5
                   transition-all duration-200 flex items-center justify-center gap-2"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Plus className="w-4 h-4" />
        <span className="font-medium">Add Task</span>
      </motion.button>
    </div>
  );
}
