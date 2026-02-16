import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Flame } from 'lucide-react';
import type { UserProgress, Task } from '@/app/types';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  tasks: Task[];
}

export function ProgressModal({ isOpen, onClose, progress, tasks }: ProgressModalProps) {
  // Calculate stats
  const totalHours = Math.floor(progress.totalFocusTime / 60);
  const totalMinutes = progress.totalFocusTime % 60;
  
  // Get today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayStat = progress.dailyStats.find(s => s.date === today);
  const todayFocusTime = todayStat?.focusTime || 0;
  const todayPomodoros = todayStat?.pomodorosCompleted || 0;

  // Calculate task breakdown
  const taskBreakdown = useMemo(() => {
    return tasks
      .filter(t => t.actualPomodoros > 0)
      .map(t => ({
        name: t.title,
        time: t.actualPomodoros * 25, // Assuming 25 min per pomodoro
        pomodoros: t.actualPomodoros,
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5); // Top 5 tasks
  }, [tasks]);

  // Format time as HH:MM
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 modal-backdrop z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="bg-[#E8E4DC] rounded-3xl p-6 w-full max-w-md shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#2D4A35]">Activity Summary</h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-[#D4CFC6] hover:bg-[#C9C4BB] 
                           flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-[#6B7B6B]" />
                </motion.button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Hours Focused */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#F4A261] rounded-2xl p-4 text-center"
                >
                  <div className="flex justify-center mb-2">
                    <Clock className="w-6 h-6 text-[#2D4A35]" />
                  </div>
                  <div className="text-2xl font-bold text-[#2D4A35]">
                    {totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : '--'}
                  </div>
                  <div className="text-xs text-[#5A4A35] font-medium">hours focused</div>
                </motion.div>

                {/* Day Streak */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#F4A261] rounded-2xl p-4 text-center"
                >
                  <div className="flex justify-center mb-2">
                    <Flame className="w-6 h-6 text-[#2D4A35]" />
                  </div>
                  <div className="text-2xl font-bold text-[#2D4A35]">
                    {progress.currentStreak > 0 ? progress.currentStreak : '--'}
                  </div>
                  <div className="text-xs text-[#5A4A35] font-medium">day streak</div>
                </motion.div>
              </div>

              {/* Today's Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#D4CFC6] rounded-2xl p-4 mb-6"
              >
                <h3 className="text-sm font-medium text-[#5A5A5A] mb-3">Today</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-[#2D4A35]">{todayPomodoros}</div>
                    <div className="text-xs text-[#8A8A8A]">pomodoros</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#2D4A35]">{formatTime(todayFocusTime)}</div>
                    <div className="text-xs text-[#8A8A8A]">focus time</div>
                  </div>
                </div>
              </motion.div>

              {/* Task Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-sm font-medium text-[#5A5A5A] mb-3">Project Breakdown</h3>
                
                {taskBreakdown.length === 0 ? (
                  <div className="bg-[#D4CFC6] rounded-2xl p-6 text-center text-[#8A8A8A]">
                    <p className="text-sm">No activity yet</p>
                    <p className="text-xs mt-1">Complete pomodoros to see your progress</p>
                  </div>
                ) : (
                  <div className="bg-[#D4CFC6] rounded-2xl overflow-hidden">
                    {/* Table Header */}
                    <div className="flex justify-between items-center px-4 py-3 bg-[#C9C4BB]">
                      <span className="text-xs font-medium text-[#5A5A5A] uppercase tracking-wider">
                        Project
                      </span>
                      <span className="text-xs font-medium text-[#5A5A5A] uppercase tracking-wider">
                        Time (HH:MM)
                      </span>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-[#C9C4BB]">
                      {taskBreakdown.map((task, index) => (
                        <motion.div
                          key={task.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="flex justify-between items-center px-4 py-3"
                        >
                          <span className="text-sm text-[#2D4A35] truncate flex-1 mr-4">
                            {task.name}
                          </span>
                          <span className="text-sm font-mono text-[#6B7B6B]">
                            {formatTime(task.time)}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Total Row */}
                    <div className="flex justify-between items-center px-4 py-3 bg-[#C9C4BB]/50 border-t border-[#C9C4BB]">
                      <span className="text-sm font-bold text-[#2D4A35]">Total</span>
                      <span className="text-sm font-mono font-bold text-[#6B7B6B]">
                        {formatTime(taskBreakdown.reduce((acc, t) => acc + t.time, 0))}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Total Stats Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 pt-4 border-t border-[#D4CFC6] text-center"
              >
                <p className="text-xs text-[#8A8A8A]">
                  Total pomodoros completed: <span className="font-bold text-[#6B7B6B]">{progress.totalPomodorosCompleted}</span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
