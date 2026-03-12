import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Flame } from 'lucide-react';
import type { UserProgress, Task, TimerSettings } from '@/app/types';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  tasks: Task[];
  settings: TimerSettings;
}

export function ProgressModal({ isOpen, onClose, progress, tasks, settings }: ProgressModalProps) {
  const totalHours = Math.floor(progress.totalFocusTime / 60);
  const totalMinutes = progress.totalFocusTime % 60;

  const today = new Date().toISOString().split('T')[0];
  const todayStat = progress.dailyStats.find(s => s.date === today);
  const todayFocusTime = todayStat?.focusTime || 0;
  const todayPomodoros = todayStat?.pomodorosCompleted || 0;

  const taskBreakdown = useMemo(() => {
    return tasks
      .filter(t => t.actualPomodoros > 0)
      .map(t => ({
        name: t.title,
        time: t.actualPomodoros * settings.focusDuration,
        pomodoros: t.actualPomodoros,
        estimated: t.estimatedPomodoros,
        completed: t.completed,
      }))
      .sort((a, b) => b.time - a.time);
  }, [tasks, settings.focusDuration]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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
            className="fixed inset-0 bg-black/50 modal-backdrop z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="rounded-3xl p-6 w-full max-w-md shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto"
                 style={{ backgroundColor: "var(--pomo-card)" }}>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold" style={{ color: "var(--pomo-text)" }}>Activity Summary</h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                  style={{ backgroundColor: "var(--pomo-input)" }}
                >
                  <X className="w-4 h-4" style={{ color: "var(--pomo-neutral)" }} />
                </motion.button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl p-4 text-center"
                  style={{ backgroundColor: "var(--pomo-accent)" }}
                >
                  <div className="flex justify-center mb-2">
                    <Clock className="w-6 h-6" style={{ color: "var(--pomo-text)" }} />
                  </div>
                  <div className="text-2xl font-bold" style={{ color: "var(--pomo-text)" }}>
                    {totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : '--'}
                  </div>
                  <div className="text-xs font-medium" style={{ color: "var(--pomo-text-secondary)" }}>hours focused</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl p-4 text-center"
                  style={{ backgroundColor: "var(--pomo-accent)" }}
                >
                  <div className="flex justify-center mb-2">
                    <Flame className="w-6 h-6" style={{ color: "var(--pomo-text)" }} />
                  </div>
                  <div className="text-2xl font-bold" style={{ color: "var(--pomo-text)" }}>
                    {progress.currentStreak > 0 ? progress.currentStreak : '--'}
                  </div>
                  <div className="text-xs font-medium" style={{ color: "var(--pomo-text-secondary)" }}>day streak</div>
                </motion.div>
              </div>

              {/* Today's Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-4 mb-6"
                style={{ backgroundColor: "var(--pomo-input)" }}
              >
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--pomo-text-secondary)" }}>Today</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: "var(--pomo-text)" }}>{todayPomodoros}</div>
                    <div className="text-xs" style={{ color: "var(--pomo-text-muted)" }}>pomodoros</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: "var(--pomo-text)" }}>{formatTime(todayFocusTime)}</div>
                    <div className="text-xs" style={{ color: "var(--pomo-text-muted)" }}>focus time</div>
                  </div>
                </div>
              </motion.div>

              {/* Task Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--pomo-text-secondary)" }}>Project Breakdown</h3>

                {taskBreakdown.length === 0 ? (
                  <div className="rounded-2xl p-6 text-center"
                       style={{ backgroundColor: "var(--pomo-input)", color: "var(--pomo-text-muted)" }}>
                    <p className="text-sm">No activity yet</p>
                    <p className="text-xs mt-1">Complete pomodoros to see your progress</p>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden"
                       style={{ backgroundColor: "var(--pomo-input)" }}>
                    {/* Table Header */}
                    <div className="flex items-center px-4 py-3"
                         style={{ backgroundColor: "var(--pomo-input-hover)" }}>
                      <span className="text-xs font-medium uppercase tracking-wider flex-1"
                            style={{ color: "var(--pomo-text-secondary)" }}>Project</span>
                      <span className="text-xs font-medium uppercase tracking-wider w-16 text-center"
                            style={{ color: "var(--pomo-text-secondary)" }}>Pomo</span>
                      <span className="text-xs font-medium uppercase tracking-wider w-16 text-right"
                            style={{ color: "var(--pomo-text-secondary)" }}>Time</span>
                    </div>

                    {/* Table Rows - scrollable */}
                    <div className="divide-y max-h-48 overflow-y-auto"
                         style={{ borderColor: "var(--pomo-input-hover)" }}>
                      {taskBreakdown.map((task, index) => (
                        <motion.div
                          key={task.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="flex items-center px-4 py-3"
                        >
                          <span className="text-sm truncate flex-1 mr-2"
                                style={{ color: "var(--pomo-text)" }}>
                            {task.name}
                          </span>
                          <span className="text-xs font-mono w-16 text-center"
                                style={{ color: "var(--pomo-neutral)" }}>
                            {task.pomodoros}/{task.estimated}
                          </span>
                          <span className="text-sm font-mono w-16 text-right"
                                style={{ color: "var(--pomo-neutral)" }}>
                            {formatTime(task.time)}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Total Row */}
                    <div className="flex items-center px-4 py-3 border-t"
                         style={{
                           backgroundColor: "color-mix(in srgb, var(--pomo-input-hover) 50%, transparent)",
                           borderColor: "var(--pomo-input-hover)",
                         }}>
                      <span className="text-sm font-bold flex-1" style={{ color: "var(--pomo-text)" }}>Total</span>
                      <span className="text-xs font-mono font-bold w-16 text-center"
                            style={{ color: "var(--pomo-neutral)" }}>
                        {taskBreakdown.reduce((acc, t) => acc + t.pomodoros, 0)}
                      </span>
                      <span className="text-sm font-mono font-bold w-16 text-right"
                            style={{ color: "var(--pomo-neutral)" }}>
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
                className="mt-6 pt-4 border-t text-center"
                style={{ borderColor: "var(--pomo-input)" }}
              >
                <p className="text-xs" style={{ color: "var(--pomo-text-muted)" }}>
                  Total pomodoros completed: <span className="font-bold" style={{ color: "var(--pomo-neutral)" }}>{progress.totalPomodorosCompleted}</span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
