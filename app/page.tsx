"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimerCard } from "@/app/components/TimerCard";
import { TaskList } from "@/app/components/TaskList";
import { TaskModal } from "@/app/components/TaskModal";
import { ProgressModal } from "@/app/components/ProgressModal";
import { SettingsModal } from "@/app/components/SettingsModal";
import { MusicPlayer } from "@/app/components/MusicPlayer";
import { KeyboardShortcutsHint } from "@/app/components/KeyboardShortcutsHint";
import { useAppPersistence } from "@/app/hooks/useLocalStorage";
import { useTimer } from "@/app/hooks/useTimer";
import { Button } from "@/app/components/ui/button";
import { BarChart3, Settings, Music } from "lucide-react";
import type { Task, TimerMode, TimerSettings, CustomPlaylist } from "@/app/types";

type NewTask = Omit<Task, "id" | "createdAt" | "actualPomodoros" | "completed">;

export default function Home() {
  const {
    tasks, setTasks,
    settings, setSettings,
    progress, setProgress,
    activeTaskId, setActiveTaskId,
    customPlaylists, setCustomPlaylists,
    ringtoneId, setRingtoneId,
    ringtoneRepeat, setRingtoneRepeat,
    theme, setTheme,
  } = useAppPersistence();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // ── Timer ────────────────────────────────────────────────────────────────────

  const handleTimerComplete = useCallback((mode: TimerMode, duration: number) => {
    if (mode !== "focus") return;

    setProgress(prev => {
      const today = new Date().toISOString().split("T")[0];
      let newStreak = prev.currentStreak;
      if (prev.lastActiveDate) {
        const diffDays = Math.floor(
          (new Date(today).getTime() - new Date(prev.lastActiveDate).getTime()) /
          (1000 * 60 * 60 * 24),
        );
        newStreak = diffDays === 1 ? prev.currentStreak + 1 : diffDays === 0 ? prev.currentStreak : 1;
      } else {
        newStreak = 1;
      }

      const existingIdx = prev.dailyStats.findIndex(s => s.date === today);
      const newDailyStats = [...prev.dailyStats];
      if (existingIdx >= 0) {
        newDailyStats[existingIdx] = {
          ...newDailyStats[existingIdx],
          focusTime: newDailyStats[existingIdx].focusTime + duration,
          pomodorosCompleted: newDailyStats[existingIdx].pomodorosCompleted + 1,
        };
      } else {
        newDailyStats.push({ date: today, focusTime: duration, pomodorosCompleted: 1 });
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

    if (activeTaskId) {
      setTasks(prev =>
        prev.map(t => {
          if (t.id !== activeTaskId) return t;
          const newActual = t.actualPomodoros + 1;
          return {
            ...t,
            actualPomodoros: newActual,
            completed: newActual >= t.estimatedPomodoros ? true : t.completed,
          };
        }),
      );
    }
  }, [activeTaskId, setProgress, setTasks]);

  const timer = useTimer(settings, tasks, activeTaskId, handleTimerComplete, ringtoneId, ringtoneRepeat);

  // ── Task handlers ────────────────────────────────────────────────────────────

  const handleAddTask = useCallback((task: NewTask) => {
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

  const handleSaveTask = useCallback((task: Task | NewTask) => {
    if ("id" in task) handleEditTask(task);
    else handleAddTask(task);
  }, [handleEditTask, handleAddTask]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (activeTaskId === taskId) setActiveTaskId(null);
  }, [setTasks, activeTaskId, setActiveTaskId]);

  const handleToggleTaskComplete = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  }, [setTasks]);

  const handleClearFinishedTasks = useCallback(() => {
    setTasks(prev => {
      const removedIds = prev.filter(t => t.completed).map(t => t.id);
      if (activeTaskId && removedIds.includes(activeTaskId)) setActiveTaskId(null);
      return prev.filter(t => !t.completed);
    });
  }, [setTasks, activeTaskId, setActiveTaskId]);

  const handleClearAllTasks = useCallback(() => {
    setTasks([]);
    setActiveTaskId(null);
  }, [setTasks, setActiveTaskId]);

  const handleSelectTask = useCallback((taskId: string | null) => {
    setActiveTaskId(taskId);
  }, [setActiveTaskId]);

  // ── Playlist handlers ────────────────────────────────────────────────────────

  const handleAddPlaylist = useCallback((playlist: CustomPlaylist) => {
    setCustomPlaylists(prev => [...prev, playlist]);
  }, [setCustomPlaylists]);

  const handleRemovePlaylist = useCallback((id: string) => {
    setCustomPlaylists(prev => prev.filter(p => p.id !== id));
  }, [setCustomPlaylists]);

  // ── Settings ─────────────────────────────────────────────────────────────────

  const handleSaveSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    setIsSettingsModalOpen(false);
  }, [setSettings]);

  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────

  const anyModalOpen = isTaskModalOpen || isProgressModalOpen || isSettingsModalOpen;
  const anyModalOpenRef = useRef(anyModalOpen);
  anyModalOpenRef.current = anyModalOpen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas or when a modal is open
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || anyModalOpenRef.current) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          timer.isRunning ? timer.pause() : timer.start();
          break;
        case "KeyR":
          timer.reset();
          break;
        case "KeyS":
          timer.skip();
          break;
        case "KeyN":
          setEditingTask(null);
          setIsTaskModalOpen(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [timer]);

  // Browser tab title
  useEffect(() => {
    const modeLabel =
      timer.mode === "focus" ? "Focus" : timer.mode === "break" ? "Break" : "Long Break";
    document.title = `${timer.formattedTime} - ${modeLabel}`;
  }, [timer.formattedTime, timer.mode]);

  const isFocusActive = timer.isRunning && timer.mode === "focus";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 ${isFocusActive ? "focus-active" : ""}`}
         style={{
           backgroundColor: isFocusActive ? "#000000" : "var(--pomo-bg)",
           transition: "background-color 0.6s ease",
         }}>
      {/* Header buttons */}
      <motion.div
        className="fixed top-4 right-4 flex gap-2 z-10 focus-grayscale"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsProgressModalOpen(true)}
          className="rounded-full px-4 py-2 flex items-center gap-2 shadow-md"
          style={{ backgroundColor: "var(--pomo-card)", color: "var(--pomo-text-secondary)" }}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Progress</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsSettingsModalOpen(true)}
          className="rounded-full p-2 shadow-md text-white"
          style={{ backgroundColor: "var(--pomo-neutral)" }}
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsMusicPlayerOpen(prev => !prev)}
          className="rounded-full p-2 shadow-md transition-colors duration-200"
          style={{
            backgroundColor: isMusicPlayerOpen ? "var(--pomo-accent)" : "var(--pomo-card)",
            color: isMusicPlayerOpen ? "white" : "var(--pomo-text-secondary)",
          }}
        >
          <Music className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Main content */}
      <div className="w-full max-w-md space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <TimerCard timer={timer} settings={settings} isFocusActive={isFocusActive} />
        </motion.div>

        <AnimatePresence>
          {isMusicPlayerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="focus-grayscale"
            >
              <MusicPlayer
                customPlaylists={customPlaylists}
                onAddPlaylist={handleAddPlaylist}
                onRemovePlaylist={handleRemovePlaylist}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="focus-grayscale"
        >
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onAddTask={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
            onEditTask={openEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleComplete={handleToggleTaskComplete}
            onClearFinished={handleClearFinishedTasks}
            onClearAll={handleClearAllTasks}
            onSelectTask={handleSelectTask}
            settings={settings}
          />
        </motion.div>

      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        task={editingTask}
      />
      <ProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        progress={progress}
        tasks={tasks}
        settings={settings}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        ringtoneId={ringtoneId}
        onRingtoneChange={setRingtoneId}
        ringtoneRepeat={ringtoneRepeat}
        onRingtoneRepeatChange={setRingtoneRepeat}
        theme={theme}
        onThemeChange={setTheme}
      />

      <KeyboardShortcutsHint />
    </div>
  );
}
