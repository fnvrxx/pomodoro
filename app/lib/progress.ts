import type { UserProgress } from "../types";

export function recordFocusSession(progress: UserProgress, duration: number, now: Date): UserProgress {
  const date = now.toISOString().slice(0, 10);
  const previous = progress.lastActiveDate;
  const dayDifference = previous
    ? Math.round((Date.parse(date) - Date.parse(previous)) / 86_400_000)
    : null;
  const currentStreak = dayDifference === 0
    ? progress.currentStreak
    : dayDifference === 1 ? progress.currentStreak + 1 : 1;
  const existingIndex = progress.dailyStats.findIndex(stat => stat.date === date);
  const dailyStats = [...progress.dailyStats];

  if (existingIndex >= 0) {
    const stat = dailyStats[existingIndex];
    dailyStats[existingIndex] = {
      ...stat,
      focusTime: stat.focusTime + duration,
      pomodorosCompleted: stat.pomodorosCompleted + 1,
    };
  } else {
    dailyStats.push({ date, focusTime: duration, pomodorosCompleted: 1 });
  }

  return {
    ...progress,
    totalFocusTime: progress.totalFocusTime + duration,
    totalPomodorosCompleted: progress.totalPomodorosCompleted + 1,
    currentStreak,
    lastActiveDate: date,
    dailyStats,
  };
}
