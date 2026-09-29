import type { DailyStat } from "../types";

export type ChartPeriod = "week" | "month" | "year";
export interface ChartBar { label: string; minutes: number; date?: string }
export interface ActivityDay { date: string; minutes: number; isOutsideRange: boolean }
export interface ActivityMonth { date: string; weekIndex: number }

export function focusIntensity(minutes: number): 0 | 1 | 2 | 3 {
  if (minutes <= 0) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  return 3;
}

export function focusActivityData(stats: DailyStat[], today: Date): ActivityDay[] {
  const currentDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const firstDay = new Date(Date.UTC(currentDay.getUTCFullYear(), currentDay.getUTCMonth() - 11, 1));
  const start = new Date(firstDay);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  const end = new Date(currentDay);
  end.setUTCDate(end.getUTCDate() + 6 - ((end.getUTCDay() + 6) % 7));
  const dayCount = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const byDate = new Map(stats.map(stat => [stat.date, stat.focusTime]));

  return Array.from({ length: dayCount }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    const date = day.toISOString().slice(0, 10);
    return { date, minutes: byDate.get(date) ?? 0, isOutsideRange: day < firstDay || day > currentDay };
  });
}

export function focusActivityMonths(days: ActivityDay[]): ActivityMonth[] {
  return days.flatMap((day, index) =>
    !day.isOutsideRange && day.date.endsWith("-01")
      ? [{ date: day.date, weekIndex: Math.floor(index / 7) }]
      : [],
  );
}

export function focusChartData(stats: DailyStat[], period: ChartPeriod, weekOffset: number, today: Date): ChartBar[] {
  const byDate = new Map(stats.map(stat => [stat.date, stat.focusTime]));
  if (period === "week") {
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + index);
      const date = day.toISOString().slice(0, 10);
      return { date, label: day.toLocaleDateString("id-ID", { weekday: "short", timeZone: "UTC" }), minutes: byDate.get(date) ?? 0 };
    });
  }
  if (period === "month") {
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return Array.from({ length: Math.ceil(dayCount / 7) }, (_, index) => {
      const first = index * 7 + 1;
      const last = Math.min(first + 6, dayCount);
      let minutes = 0;
      for (let day = first; day <= last; day++) {
        const date = new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
        minutes += byDate.get(date) ?? 0;
      }
      return { label: `${first}-${last}`, minutes };
    });
  }
  const year = String(today.getUTCFullYear());
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const minutes = stats.reduce((sum, stat) => sum + (stat.date.startsWith(`${year}-${month}-`) ? stat.focusTime : 0), 0);
    const label = new Date(Date.UTC(Number(year), index, 1)).toLocaleDateString("id-ID", { month: "short", timeZone: "UTC" });
    return { label, minutes };
  });
}
