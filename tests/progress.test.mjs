import test from 'node:test';
import assert from 'node:assert/strict';
import { recordFocusSession } from '../app/lib/progress.ts';
import { focusActivityData, focusActivityMonths, focusChartData, focusIntensity } from '../app/lib/stats.ts';

const empty = { totalFocusTime: 0, totalPomodorosCompleted: 0, currentStreak: 0, lastActiveDate: null, dailyStats: [] };

test('focus sessions update totals and the same day exactly once per call', () => {
  const first = recordFocusSession(empty, 25, new Date('2026-09-29T01:00:00Z'));
  const second = recordFocusSession(first, 25, new Date('2026-09-29T03:00:00Z'));
  assert.equal(second.totalFocusTime, 50);
  assert.equal(second.totalPomodorosCompleted, 2);
  assert.equal(second.currentStreak, 1);
  assert.deepEqual(second.dailyStats, [{ date: '2026-09-29', focusTime: 50, pomodorosCompleted: 2 }]);
  assert.deepEqual(empty.dailyStats, []);
});

test('streak increments on consecutive days and resets after a gap', () => {
  const first = recordFocusSession(empty, 25, new Date('2026-09-28T10:00:00Z'));
  const next = recordFocusSession(first, 25, new Date('2026-09-29T10:00:00Z'));
  assert.equal(next.currentStreak, 2);
  const afterGap = recordFocusSession(next, 25, new Date('2026-10-02T10:00:00Z'));
  assert.equal(afterGap.currentStreak, 1);
});

test('histogram reads persisted daily totals for the selected week', () => {
  const stats = [{ date: '2026-09-29', focusTime: 50, pomodorosCompleted: 2 }];
  const bars = focusChartData(stats, 'week', 0, new Date('2026-09-29T12:00:00Z'));
  assert.equal(bars.length, 7);
  assert.equal(bars[0].date, '2026-09-28');
  assert.equal(bars.find(bar => bar.date === '2026-09-29')?.minutes, 50);
});

test('activity calendar spans 12 months and uses the darkest level above one hour', () => {
  const stats = [
    { date: '2026-09-27', focusTime: 60, pomodorosCompleted: 2 },
    { date: '2026-09-29', focusTime: 65, pomodorosCompleted: 3 },
  ];
  const days = focusActivityData(stats, new Date('2026-09-29T12:00:00Z'));
  assert.equal(days.length % 7, 0);
  assert.equal(days[0].date, '2025-09-29');
  assert.equal(focusActivityMonths(days).length, 12);
  assert.equal(focusActivityMonths(days)[0].date, '2025-10-01');
  assert.equal(focusActivityMonths(days).at(-1)?.date, '2026-09-01');
  assert.equal(days.find(day => day.date === '2026-09-27')?.minutes, 60);
  assert.equal(days.find(day => day.date === '2026-09-29')?.minutes, 65);
  assert.equal(days.find(day => day.date === '2026-09-30')?.isOutsideRange, true);
  assert.deepEqual([0, 25, 60, 65].map(focusIntensity), [0, 1, 2, 3]);
});
