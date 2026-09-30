import { useEffect } from "react";
import { notifyUser } from "../services/notifications";

const REMINDER_INTERVAL_MS = 10 * 60 * 1000;
const REMINDER_MESSAGES = [
  "Kembali saat siap. Mulai dari satu sesi.",
  "Satu langkah kecil cukup untuk lanjut.",
  "Tarik napas, lalu pilih satu hal untuk dikerjakan.",
  "Fokus bisa dimulai lagi kapan saja.",
];

export function useAwayReminder(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !("Notification" in window)) return;

    let timeoutId: number | undefined;
    let nextReminderAt: number | null = null;
    let reminderCount = 0;
    let active = true;

    const isAway = () => document.visibilityState === "hidden" || !document.hasFocus();

    const schedule = () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (!isAway()) {
        nextReminderAt = null;
        reminderCount = 0;
        return;
      }
      if (nextReminderAt === null) nextReminderAt = Date.now() + REMINDER_INTERVAL_MS;
      timeoutId = window.setTimeout(() => {
        timeoutId = undefined;
        if (!isAway()) {
          nextReminderAt = null;
          reminderCount = 0;
          return;
        }
        if (Notification.permission === "granted") {
          void notifyUser("Yuk, kembali fokus", {
            body: REMINDER_MESSAGES[reminderCount % REMINDER_MESSAGES.length],
            icon: "/icon.svg", tag: "pomodoro-away", silent: true,
          }, () => active && isAway());
          reminderCount += 1;
        }
        nextReminderAt = Date.now() + REMINDER_INTERVAL_MS;
        schedule();
      }, Math.max(0, nextReminderAt - Date.now()));
    };

    schedule();
    document.addEventListener("visibilitychange", schedule);
    window.addEventListener("blur", schedule);
    window.addEventListener("focus", schedule);
    return () => {
      active = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("blur", schedule);
      window.removeEventListener("focus", schedule);
    };
  }, [enabled]);
}
