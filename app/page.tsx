"use client";
import { useCustomRingtone } from "./hooks/useCustomRingtone";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3, Music2, Settings2 } from "lucide-react";
import { TimerCard } from "./components/TimerCard";
import { TaskList } from "./components/TaskList";
import { TaskModal } from "./components/TaskModal";
import { SettingsModal } from "./components/SettingsModal";
import { KeyboardShortcutsHint } from "./components/KeyboardShortcutsHint";
import { MotivationalQuote } from "./components/MotivationalQuote";
import { useAppPersistence } from "./hooks/useLocalStorage";
import { useTimer } from "./hooks/useTimer";
import { useAwayReminder } from "./hooks/useAwayReminder";
import { useFocusCelebration } from "./hooks/useFocusCelebration";
import { FocusCelebrationDialog } from "./components/FocusCelebrationDialog";
import { recordFocusSession } from "./lib/progress";
import type { Task, TimerMode, TimerSettings, CustomPlaylist } from "./types";

const ProgressModal = dynamic(() => import("./components/ProgressModal").then(module => module.ProgressModal), {
  loading: () => <p role="status" className="surface p-4 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">Memuat progres…</p>,
});
const MusicPlayer = dynamic(() => import("./components/MusicPlayer").then(module => module.MusicPlayer), {
  loading: () => <p role="status" className="surface p-4">Memuat musik…</p>,
});
type NewTask = Omit<Task, "id" | "createdAt" | "actualPomodoros" | "completed">;

export default function Home() {
  const {
    tasks, setTasks, settings, setSettings, progress, setProgress,
    activeTaskId, setActiveTaskId, customPlaylists, setCustomPlaylists,
    ringtoneId, setRingtoneId, ringtoneRepeat, setRingtoneRepeat,
    awayRemindersEnabled, setAwayRemindersEnabled,
  } = useAppPersistence();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { session: celebration, celebrate, dismiss: dismissCelebration } = useFocusCelebration();
  const celebrationOpen = celebration !== null && !taskModalOpen && !progressOpen && !settingsOpen;

  const onTimerComplete = useCallback((mode: TimerMode, duration: number) => {
    celebrate(mode, duration);
    if (mode !== "focus") return;
    setProgress(previous => recordFocusSession(previous, duration, new Date()));
    if (activeTaskId) {
      setTasks(previous => previous.map(task => {
        if (task.id !== activeTaskId) return task;
        const actualPomodoros = task.actualPomodoros + 1;
        return { ...task, actualPomodoros, completed: task.completed || actualPomodoros >= task.estimatedPomodoros };
      }));
    }
  }, [activeTaskId, setProgress, setTasks, celebrate]);

  const customRingtone = useCustomRingtone();
  const timer = useTimer(settings, onTimerComplete, ringtoneId, ringtoneRepeat, customRingtone.audio?.buffer);
  useAwayReminder(awayRemindersEnabled);
  const { start, pause, reset, skip } = timer;

  const closeTaskModal = useCallback(() => {
    setTaskModalOpen(false);
    setEditingTask(null);
  }, []);
  const openNewTask = useCallback(() => {
    setEditingTask(null);
    setTaskModalOpen(true);
  }, []);
  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  }, []);
  const saveTask = useCallback((task: Task | NewTask) => {
    if ("id" in task) {
      setTasks(previous => previous.map(item => item.id === task.id ? task : item));
    } else {
      setTasks(previous => [...previous, { ...task, id: crypto.randomUUID(), createdAt: Date.now(), actualPomodoros: 0, completed: false }]);
    }
    closeTaskModal();
  }, [setTasks, closeTaskModal]);
  const deleteTask = useCallback((id: string) => {
    setTasks(previous => previous.filter(task => task.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  }, [setTasks, activeTaskId, setActiveTaskId]);
  const toggleTask = useCallback((id: string) => {
    setTasks(previous => previous.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  }, [setTasks]);
  const clearFinished = useCallback(() => {
    setTasks(previous => previous.filter(task => !task.completed));
    if (tasks.some(task => task.id === activeTaskId && task.completed)) setActiveTaskId(null);
  }, [setTasks, setActiveTaskId, tasks, activeTaskId]);
  const clearAll = useCallback(() => {
    setTasks([]);
    setActiveTaskId(null);
  }, [setTasks, setActiveTaskId]);
  const saveSettings = useCallback((next: TimerSettings) => {
    setSettings(next);
    setSettingsOpen(false);
  }, [setSettings]);
  const addPlaylist = useCallback((playlist: CustomPlaylist) => {
    setCustomPlaylists(previous => [...previous, playlist]);
  }, [setCustomPlaylists]);
  const removePlaylist = useCallback((id: string) => {
    setCustomPlaylists(previous => previous.filter(playlist => playlist.id !== id));
  }, [setCustomPlaylists]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (taskModalOpen || progressOpen || settingsOpen || celebrationOpen || target.closest("button, a, input, textarea, select, [contenteditable='true']")) return;
      if (event.code === "Space") {
        event.preventDefault();
        if (timer.isRunning) pause();
        else start();
      } else if (event.code === "KeyR") reset();
      else if (event.code === "KeyS") skip();
      else if (event.code === "KeyN") openNewTask();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [start, pause, reset, skip, openNewTask, timer.isRunning, taskModalOpen, progressOpen, settingsOpen, celebrationOpen]);

  useEffect(() => {
    const label = timer.mode === "focus" ? "Fokus" : "Istirahat";
    document.title = `${timer.formattedTime} · ${label} | Pomodoro`;
  }, [timer.formattedTime, timer.mode]);

  const focusActive = timer.isRunning && timer.mode === "focus";

  return (
    <div className={`app-shell ${focusActive ? "focus-active" : ""}`}>
      <header className="app-header">
        <nav className="header-actions" aria-label="Alat aplikasi">
          <button type="button" className="header-action" onClick={() => setProgressOpen(true)} aria-label="Lihat progres">
            <BarChart3 size={18} aria-hidden="true" /><span>Progres</span>
          </button>
          <button type="button" className="header-action" onClick={() => setSettingsOpen(true)} aria-label="Buka pengaturan">
            <Settings2 size={18} aria-hidden="true" /><span>Pengaturan</span>
          </button>
          <button type="button" className="header-action" onClick={() => setMusicOpen(open => !open)} aria-label="Tampilkan musik" aria-pressed={musicOpen}>
            <Music2 size={18} aria-hidden="true" /><span>Musik</span>
          </button>
        </nav>
      </header>

      <main className="app-main">
        <div className="main-column">
          <TimerCard timer={timer} settings={settings} />
          {musicOpen && (
            <div className="focus-grayscale">
              <MusicPlayer customPlaylists={customPlaylists} onAddPlaylist={addPlaylist} onRemovePlaylist={removePlaylist} />
            </div>
          )}
        </div>
        <div className="side-column focus-grayscale">
          <MotivationalQuote
            show={tasks.length > 0 || progress.totalPomodorosCompleted > 0}
            completed={tasks.length > 0 && tasks.every(task => task.completed)}
            completedSessions={progress.totalPomodorosCompleted}
          />
          <TaskList
            tasks={tasks} activeTaskId={activeTaskId} onAddTask={openNewTask}
            onEditTask={openEditTask} onDeleteTask={deleteTask} onToggleComplete={toggleTask}
            onClearFinished={clearFinished} onClearAll={clearAll} onSelectTask={setActiveTaskId}
          />
        </div>
      </main>

      {taskModalOpen && <TaskModal isOpen onClose={closeTaskModal} onSave={saveTask} task={editingTask} />}
      {progressOpen && <ProgressModal isOpen onClose={() => setProgressOpen(false)} progress={progress} tasks={tasks} />}
      {settingsOpen && <SettingsModal
        isOpen onClose={() => setSettingsOpen(false)} settings={settings} onSave={saveSettings}
        ringtoneId={ringtoneId} onRingtoneChange={setRingtoneId}
        ringtoneRepeat={ringtoneRepeat} onRingtoneRepeatChange={setRingtoneRepeat}
        customRingtone={customRingtone}
        awayRemindersEnabled={awayRemindersEnabled} onAwayRemindersChange={setAwayRemindersEnabled}
      />}
      <KeyboardShortcutsHint />
      {celebrationOpen && celebration && <FocusCelebrationDialog
        session={celebration} completedSessions={progress.totalPomodorosCompleted} onClose={dismissCelebration}
      />}
    </div>
  );
}
