import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { TaskCompletionProgress } from './TaskCompletionProgress';
import { MotivationalQuote } from './MotivationalQuote';
import type { Task } from '@/app/types';

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
  const incompleteTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  
  // Check if all tasks are completed
  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.completed);

  return (
    <div className="bg-[#E8E4DC] rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#2D4A35]">Task</h2>
          {tasks.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs bg-[#6B9B7A]/20 text-[#6B9B7A] px-2 py-1 rounded-full font-medium"
            >
              {incompleteTasks.length} pending
            </motion.span>
          )}
        </div>
        
        {/* Clear Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-full hover:bg-[#D4CFC6] text-[#6B7B6B] transition-all duration-200 hover:scale-110"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#6B7B6B] border-none text-white">
            <DropdownMenuItem 
              onClick={onClearFinished}
              className="hover:bg-[#5A6A5A] cursor-pointer focus:bg-[#5A6A5A] transition-colors"
              disabled={completedTasks.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear finished Task
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onClearAll}
              className="hover:bg-[#5A6A5A] cursor-pointer focus:bg-[#5A6A5A] transition-colors"
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
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4 p-3 bg-[#6B9B7A]/20 rounded-xl border border-[#6B9B7A]/30 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-sm text-[#4A7A59]">
              <motion.div 
                className="w-2 h-2 rounded-full bg-[#6B9B7A]"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Currently focusing on:
            </div>
            <div className="font-medium text-[#2D4A35] mt-1">{activeTask.title}</div>
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
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl mb-3"
              >
                📝
              </motion.div>
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
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
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
                      ? 'bg-[#6B9B7A] text-white shadow-md'
                      : 'bg-[#D4CFC6] hover:bg-[#C9C4BB] hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Animated Checkbox */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task.id);
                    }}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    className={`
                      w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200
                      ${task.completed 
                        ? 'bg-[#6B7B6B] text-white shadow-inner' 
                        : task.id === activeTaskId
                          ? 'bg-white/20 text-white border-2 border-white/50 hover:bg-white/30'
                          : 'bg-white border-2 border-[#6B7B6B] text-transparent hover:border-[#5A6A5A] hover:shadow-sm'
                      }
                    `}
                  >
                    <motion.div
                      initial={false}
                      animate={{ 
                        scale: task.completed ? [1.2, 1] : 1,
                        rotate: task.completed ? [0, 10, 0] : 0
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                  </motion.button>

                  {/* Task Title with strikethrough animation */}
                  <div className="flex-1 min-w-0">
                    <motion.span 
                      className={`
                        font-medium truncate block
                        ${task.completed ? 'line-through' : ''}
                      `}
                      animate={{ 
                        opacity: task.completed ? 0.6 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {task.title}
                    </motion.span>
                    
                    {/* Pomodoro progress mini indicator */}
                    {!task.completed && task.actualPomodoros > 0 && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        className="flex items-center gap-1 mt-1"
                      >
                        <div className="flex gap-0.5">
                          {[...Array(Math.min(task.actualPomodoros, 5))].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className={`w-1.5 h-1.5 rounded-full ${
                                task.id === activeTaskId ? 'bg-white/60' : 'bg-[#6B9B7A]/60'
                              }`}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Pomodoro Count */}
                <div className="flex items-center gap-2">
                  <motion.span 
                    className={`
                      text-sm font-mono px-2 py-1 rounded-md
                      ${task.id === activeTaskId 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#E8E4DC] text-[#6B7B6B]'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                  >
                    {task.actualPomodoros}/{task.estimatedPomodoros}
                  </motion.span>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className={`
                          w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200
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
        whileHover={{ scale: 1.01, borderStyle: 'solid' }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          animate={{ rotate: [0, 90, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 5 }}
        >
          <Plus className="w-4 h-4" />
        </motion.div>
        <span className="font-medium">Add Task</span>
      </motion.button>

      {/* Task Completion Progress */}
      <AnimatePresence>
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
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

      {/* Motivational Quote - shown when all tasks completed */}
      <MotivationalQuote show={allTasksCompleted} />
    </div>
  );
}
