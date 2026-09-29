import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Task, UserProgress } from "../types";
import { focusActivityData, focusActivityMonths, focusChartData, focusIntensity, type ChartBar, type ChartPeriod } from "../lib/stats";
import { AppDialog } from "./AppDialog";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  tasks: Task[];
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} jam ${remainder} menit` : `${hours} jam`;
}

const activityDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
});
const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" });
const monthYearFormatter = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });

function activityLabel(date: string, minutes: number, isToday: boolean): string {
  const day = activityDateFormatter.format(new Date(`${date}T00:00:00Z`));
  return `${isToday ? "Hari ini, " : ""}${day}: ${formatMinutes(minutes)} fokus`;
}

function chartBarLabel(bar: ChartBar, period: ChartPeriod, today: Date): string {
  if (bar.date) return activityDateFormatter.format(new Date(`${bar.date}T00:00:00Z`));
  if (period === "month") return `${bar.label} ${monthYearFormatter.format(today)}`;
  return `${bar.label} ${today.getUTCFullYear()}`;
}

export function ProgressModal({ isOpen, onClose, progress, tasks }: ProgressModalProps) {
  const [period, setPeriod] = useState<ChartPeriod>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const activityScrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const todayStat = progress.dailyStats.find(stat => stat.date === todayKey);
  const activity = focusActivityData(progress.dailyStats, today);
  const activityMonths = focusActivityMonths(activity);
  const activityStyle = { "--activity-weeks": activity.length / 7 } as CSSProperties;
  const bars = focusChartData(progress.dailyStats, period, weekOffset, today);
  const periodMinutes = bars.reduce((total, bar) => total + bar.minutes, 0);
  const periodLabel = period === "week"
    ? weekOffset === 0 ? "pekan ini" : `${Math.abs(weekOffset)} pekan lalu`
    : period === "month" ? "bulan ini" : "tahun ini";
  const maxMinutes = Math.max(...bars.map(bar => bar.minutes), 1);
  const hasData = bars.some(bar => bar.minutes > 0);
  const taskBreakdown = useMemo(() => tasks.filter(task => task.actualPomodoros > 0).sort((a, b) => b.actualPomodoros - a.actualPomodoros), [tasks]);
  const selectedBar = selectedBarIndex === null ? null : bars[selectedBarIndex];

  useEffect(() => {
    if (isOpen && activityScrollRef.current) {
      activityScrollRef.current.scrollLeft = activityScrollRef.current.scrollWidth;
    }
  }, [isOpen]);

  return (
    <AppDialog open={isOpen} onClose={onClose} title="Progres fokus" wide>
      <section className="activity-panel mb-6" aria-labelledby="activity-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-4">
          <h3 id="activity-heading" className="font-bold text-lg">Aktivitas fokus</h3>
          <span className="text-sm">1 tahun terakhir</span>
        </div>
        <p className="text-sm mb-4">Total fokus <strong>{formatMinutes(progress.totalFocusTime)}</strong> · Hari ini <strong>{formatMinutes(todayStat?.focusTime ?? 0)}</strong></p>
        <div ref={activityScrollRef} className="activity-scroll" tabIndex={0} aria-label="Kalender aktivitas fokus satu tahun, geser untuk melihat bulan lain">
          <div className="activity-map" style={activityStyle}>
            <div className="activity-map-body">
              <div className="activity-weekdays" aria-hidden="true"><span>Sen</span><span /><span>Rab</span><span /><span>Jum</span><span /><span /></div>
              <ul className="activity-grid" aria-label="Durasi fokus per hari">
                {activity.map(day => {
                  const isToday = day.date === todayKey;
                  const label = activityLabel(day.date, day.minutes, isToday);
                  return <li key={day.date} className="activity-day" data-intensity={focusIntensity(day.minutes)} data-today={isToday} data-outside={day.isOutsideRange} aria-hidden={day.isOutsideRange} aria-label={day.isOutsideRange ? undefined : label} title={day.isOutsideRange ? undefined : label} />;
                })}
              </ul>
            </div>
            <div className="activity-months" aria-hidden="true">
              {activityMonths.map(month => <span key={month.date} style={{ gridColumnStart: month.weekIndex + 1 }}>{monthFormatter.format(new Date(`${month.date}T00:00:00Z`))}</span>)}
            </div>
          </div>
        </div>
        <div className="activity-legend mt-4" aria-label="Skala intensitas fokus dari less ke more">
          <span>Less</span>
          {[0, 1, 2, 3].map(level => <span key={level} className="activity-day" data-intensity={level} aria-hidden="true" />)}
          <span>More</span>
        </div>
      </section>

      <section aria-labelledby="chart-heading" className="chart-panel">
        <h3 id="chart-heading" className="font-bold text-lg">Berapa lama fokus setiap {period === "week" ? "hari" : period === "month" ? "pekan" : "bulan"}?</h3>
        <p className="text-sm mt-1" aria-live="polite">Total {periodLabel}: <strong>{formatMinutes(periodMinutes)}</strong></p>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-5">
          <div className="flex gap-1" role="group" aria-label="Rentang progres">
            {(["week", "month", "year"] as ChartPeriod[]).map(value => (
              <button key={value} type="button" className="choice-button" aria-pressed={period === value} onClick={() => { setPeriod(value); setWeekOffset(0); setSelectedBarIndex(null); }}>
                {value === "week" ? "Pekan" : value === "month" ? "Bulan" : "Tahun"}
              </button>
            ))}
          </div>
          {period === "week" && (
            <div className="flex items-center gap-2 text-sm">
              <button type="button" className="header-action !w-9 !h-9 !p-0" onClick={() => { setWeekOffset(offset => offset - 1); setSelectedBarIndex(null); }} aria-label="Pekan sebelumnya"><ChevronLeft size={16} aria-hidden="true" /></button>
              <span>{weekOffset === 0 ? "Pekan ini" : `${Math.abs(weekOffset)} pekan lalu`}</span>
              <button type="button" className="header-action !w-9 !h-9 !p-0" onClick={() => { setWeekOffset(offset => Math.min(0, offset + 1)); setSelectedBarIndex(null); }} disabled={weekOffset === 0} aria-label="Pekan berikutnya"><ChevronRight size={16} aria-hidden="true" /></button>
            </div>
          )}
        </div>
        {hasData ? (
          <>
            <p className="chart-detail text-sm mb-3" data-selected={selectedBar !== null} role="status">{selectedBar ? `${chartBarLabel(selectedBar, period, today)} · ${selectedBar.minutes} menit fokus` : "Ketuk batang untuk melihat menit fokus."}</p>
            <div className="overflow-x-auto">
              <ul className={`chart-bars ${period === "year" ? "chart-bars-year" : ""}`} aria-label="Grafik waktu fokus">
                {bars.map((bar, index) => (
                  <li key={`${bar.date ?? bar.label}-${index}`} className="flex-1 h-full min-w-0">
                    <button type="button" className="chart-bar-button" aria-pressed={selectedBarIndex === index} aria-label={`${chartBarLabel(bar, period, today)}: ${bar.minutes} menit fokus`} onClick={() => setSelectedBarIndex(current => current === index ? null : index)}>
                      <span className="chart-plot"><span className="chart-bar" data-empty={bar.minutes === 0} style={{ height: `${Math.max(bar.minutes / maxMinutes * 100, bar.minutes ? 5 : 1)}%` }} /></span>
                      <span className="chart-bar-label">{bar.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : <p className="surface p-4 text-sm">Belum ada sesi fokus dalam rentang ini. Mulai satu sesi untuk melihat progres.</p>}
      </section>

      <section className="border-t mt-6 pt-5" style={{ borderColor: "var(--pomo-neutral-light)" }} aria-labelledby="task-breakdown-heading">
        <h3 id="task-breakdown-heading" className="font-bold text-lg mb-3">Sesi per tugas</h3>
        {taskBreakdown.length ? (
          <ul className="grid gap-2">
            {taskBreakdown.map(task => <li key={task.id} className="flex justify-between gap-4 text-sm border-b pb-2" style={{ borderColor: "var(--pomo-input)" }}><span className="break-words">{task.title}</span><strong className="shrink-0">{task.actualPomodoros} sesi</strong></li>)}
          </ul>
        ) : <p className="text-sm">Belum ada tugas dengan sesi fokus selesai.</p>}
      </section>
    </AppDialog>
  );
}
