'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerCard } from '@/app/components/TimerCard';
import { TaskList } from '@/app/components/TaskList';
import { TaskModal } from '@/app/components/TaskModal';
import { ProgressModal } from '@/app/components/ProgressModal';
import { SettingsModal } from '@/app/components/SettingsModal';
import { MusicPlayer } from '@/app/components/MusicPlayer';
import { WeeklyProgressBar } from '@/app/components/WeeklyProgressBar';
import { useAppPersistence } from '@/app/hooks/useLocalStorage';
import { useWeeklyProgress } from '@/app/hooks/useWeeklyProgress';
import { useTimer } from '@/app/hooks/useTimer';
import { Button } from '@/app/components/ui/button';
import { BarChart3, Settings, Music } from 'lucide-react';
import type { Task, TimerMode, TimerSettings } from '@/app/types';

export default function Home() {
  // App state from localStorage
  const {
    tasks,
    setTasks,
    settings,
    setSettings,
    progress,
    setProgress,
    activeTaskId,
    setActiveTaskId,
  } = useAppPersistence();

  // Weekly progress tracking
  const {
    weeklyProgress,
    completeTask,
    uncompleteTask,
    getWeeklyCompletedCount,
  } = useWeeklyProgress();

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Handle timer completion
  const handleTimerComplete = useCallback((mode: TimerMode, duration: number) => {
    if (mode === 'focus') {
      // Update progress
      setProgress(prev => {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = prev.lastActiveDate;

        // Calculate streak
        let newStreak = prev.currentStreak;
        if (lastActive) {
          const lastDate = new Date(lastActive);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak = prev.currentStreak + 1;
          } else if (diffDays > 1) {
            newStreak = 1; // Reset streak
          }
        } else {
          newStreak = 1;
        }

        // Update daily stats
        const existingStatIndex = prev.dailyStats.findIndex(s => s.date === today);
        let newDailyStats = [...prev.dailyStats];

        if (existingStatIndex >= 0) {
          newDailyStats[existingStatIndex] = {
            ...newDailyStats[existingStatIndex],
            focusTime: newDailyStats[existingStatIndex].focusTime + duration,
            pomodorosCompleted: newDailyStats[existingStatIndex].pomodorosCompleted + 1,
          };
        } else {
          newDailyStats.push({
            date: today,
            focusTime: duration,
            pomodorosCompleted: 1,
          });
        }

        // Update active task
        if (activeTaskId) {
          setTasks(prevTasks =>
            prevTasks.map(task =>
              task.id === activeTaskId
                ? { ...task, actualPomodoros: task.actualPomodoros + 1 }
                : task
            )
          );
        }

        return {
          ...prev,
          totalFocusTime: prev.totalFocusTime + duration,
          totalPomodorosCompleted: prev.totalPomodorosCompleted + 1,
          currentStreak: newStreak,
          lastActiveDate: today,
          dailyStats: newDailyStats,
        };
      });
    }
  }, [activeTaskId, setProgress, setTasks]);

  // Timer hook
  const timer = useTimer(settings, tasks, activeTaskId, handleTimerComplete);

  // Task handlers
  const handleAddTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'actualPomodoros' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      actualPomodoros: 0,
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
    setIsTaskModalOpen(false);
  }, [setTasks]);

  const handleEditTask = useCallback((task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    setEditingTask(null);
    setIsTaskModalOpen(false);
  }, [setTasks]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    // Also remove from weekly progress if completed
    if (weeklyProgress.completedTasks.includes(taskId)) {
      uncompleteTask(taskId);
    }
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  }, [setTasks, activeTaskId, setActiveTaskId, weeklyProgress.completedTasks, uncompleteTask]);

  const handleToggleTaskComplete = useCallback((taskId: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (task) {
        // Update weekly progress
        if (!task.completed) {
          // Task is being marked as complete
          completeTask(taskId);
        } else {
          // Task is being unmarked
          uncompleteTask(taskId);
        }
      }
      return prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
    });
  }, [setTasks, completeTask, uncompleteTask]);

  const handleClearFinishedTasks = useCallback(() => {
    setTasks(prev => {
      const remaining = prev.filter(t => !t.completed);
      const removedIds = prev.filter(t => t.completed).map(t => t.id);
      // Remove cleared tasks from weekly progress
      removedIds.forEach(id => uncompleteTask(id));
      if (activeTaskId && removedIds.includes(activeTaskId)) {
        setActiveTaskId(null);
      }
      return remaining;
    });
  }, [setTasks, activeTaskId, setActiveTaskId, uncompleteTask]);

  const handleClearAllTasks = useCallback(() => {
    // Clear all tasks from weekly progress
    tasks.forEach(task => {
      if (task.completed) {
        uncompleteTask(task.id);
      }
    });
    setTasks([]);
    setActiveTaskId(null);
  }, [setTasks, setActiveTaskId, tasks, uncompleteTask]);

  const handleSelectTask = useCallback((taskId: string | null) => {
    setActiveTaskId(taskId);
  }, [setActiveTaskId]);

  // Settings handler
  const handleSaveSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    setIsSettingsModalOpen(false);
  }, [setSettings]);

  // Open edit task modal
  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  // Update document title with timer
  useEffect(() => {
    document.title = `${timer.formattedTime} - ${timer.mode === 'focus' ? 'Focus' : timer.mode === 'break' ? 'Break' : 'Long Break'}`;
  }, [timer.formattedTime, timer.mode]);

  return (
    <div className="min-h-screen bg-[#B8C4B8] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Header Actions */}
      <motion.div
        className="fixed top-4 right-4 flex gap-2 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsProgressModalOpen(true)}
          className="bg-[#E8E4DC] hover:bg-[#DDD8CE] text-[#5A5A5A] rounded-full px-4 py-2 flex items-center gap-2 shadow-md transition-all duration-200 hover:scale-105"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Progress</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsSettingsModalOpen(true)}
          className="bg-[#6B7B6B] hover:bg-[#5A6A5A] text-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-105"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsMusicPlayerOpen(!isMusicPlayerOpen)}
          className={`rounded-full p-2 shadow-md transition-all duration-200 hover:scale-105 ${isMusicPlayerOpen
              ? 'bg-[#F4A261] text-white'
              : 'bg-[#E8E4DC] hover:bg-[#DDD8CE] text-[#5A5A5A]'
            }`}
        >
          <Music className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Main Content */}
      <div className="w-full max-w-md space-y-6">
        {/* Timer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <TimerCard
            timer={timer}
            settings={settings}
          />
        </motion.div>

        {/* Music Player */}
        <AnimatePresence>
          {isMusicPlayerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MusicPlayer />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <WeeklyProgressBar
            completedCount={getWeeklyCompletedCount()}
            targetCount={10}
          />
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onAddTask={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onEditTask={openEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleComplete={handleToggleTaskComplete}
            onClearFinished={handleClearFinishedTasks}
            onClearAll={handleClearAllTasks}
            onSelectTask={handleSelectTask}
          />
        </motion.div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleEditTask as (task: Task | Omit<Task, 'id' | 'createdAt' | 'actualPomodoros' | 'completed'>) => void : handleAddTask}
        task={editingTask}
      />

      <ProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        progress={progress}
        tasks={tasks}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
