import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import type { Task } from '@/app/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task | Omit<Task, 'id' | 'createdAt' | 'actualPomodoros' | 'completed'>) => void;
  task: Task | null;
}

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [actualPomodoros, setActualPomodoros] = useState(0);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setEstimatedPomodoros(task.estimatedPomodoros);
        setActualPomodoros(task.actualPomodoros);
      } else {
        setTitle('');
        setEstimatedPomodoros(1);
        setActualPomodoros(0);
      }
    }
  }, [isOpen, task]);

  const handleSave = () => {
    if (!title.trim()) return;

    if (task) {
      // Editing existing task
      onSave({
        ...task,
        title: title.trim(),
        estimatedPomodoros,
        actualPomodoros,
      });
    } else {
      // Creating new task
      onSave({
        title: title.trim(),
        estimatedPomodoros,
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 modal-backdrop z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="bg-[#E8E4DC] rounded-3xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#2D4A35]">
                  {task ? 'Edit Task' : 'Add Task'}
                </h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-[#D4CFC6] hover:bg-[#C9C4BB] 
                           flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-[#6B7B6B]" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">
                    Task
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What are you working on?"
                    className="bg-[#D4CFC6] border-none rounded-xl py-3 px-4 
                             text-[#2D4A35] placeholder:text-[#9A9A9A]
                             focus:ring-2 focus:ring-[#6B9B7A]/50"
                    autoFocus
                  />
                </div>

                {/* Pomodoro Count */}
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">
                    Act/Est Pomodoros
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Actual Pomodoros (only show when editing) */}
                    {task && (
                      <>
                        <Input
                          type="number"
                          min={0}
                          value={actualPomodoros}
                          onChange={(e) => setActualPomodoros(Math.max(0, parseInt(e.target.value) || 0))}
                          className="bg-[#D4CFC6] border-none rounded-xl py-3 px-4 
                                   text-[#2D4A35] w-20 text-center
                                   focus:ring-2 focus:ring-[#6B9B7A]/50"
                        />
                        <span className="text-[#6B7B6B] font-medium">/</span>
                      </>
                    )}
                    
                    {/* Estimated Pomodoros */}
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={estimatedPomodoros}
                      onChange={(e) => setEstimatedPomodoros(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                      className="bg-[#6B7B6B] border-none rounded-xl py-3 px-4 
                               text-white w-20 text-center
                               focus:ring-2 focus:ring-[#6B9B7A]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-[#6B7B6B] hover:bg-[#D4CFC6]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="px-6 py-2 rounded-xl bg-[#6B7B6B] hover:bg-[#5A6A5A] 
                           text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
