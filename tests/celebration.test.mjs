import test from 'node:test';
import assert from 'node:assert/strict';
import { celebrationReducer, INITIAL_CELEBRATION } from '../app/lib/celebration.ts';
import { initialTimer, timerReducer } from '../app/lib/timer.ts';

const settings = { focusDuration: 25, breakDuration: 5, longBreakDuration: 15, longBreakInterval: 4 };

test('only a completed focus session opens a celebration; each new focus gets a new sequence', () => {
  for (const mode of ['break', 'longBreak']) {
    assert.equal(celebrationReducer(INITIAL_CELEBRATION, { type: 'complete', mode, duration: 5 }), INITIAL_CELEBRATION);
  }
  let celebration = celebrationReducer(INITIAL_CELEBRATION, { type: 'complete', mode: 'focus', duration: 25 });
  assert.deepEqual(celebration.session, { sequence: 1, duration: 25 });
  celebration = celebrationReducer(celebration, { type: 'dismiss' });
  assert.equal(celebration.session, null);
  celebration = celebrationReducer(celebration, { type: 'complete', mode: 'focus', duration: 30 });
  assert.deepEqual(celebration.session, { sequence: 2, duration: 30 });
});

test('skip and reset never emit the completion that opens a celebration', () => {
  const running = timerReducer(initialTimer(settings), { type: 'start', now: 0 });
  for (const type of ['skip', 'reset']) {
    assert.equal(timerReducer(running, { type, settings }).completion, null);
  }
  const finished = timerReducer(running, { type: 'tick', now: 1_500_000, settings });
  const event = finished.completion;
  const celebration = celebrationReducer(INITIAL_CELEBRATION, { type: 'complete', mode: event.mode, duration: event.duration });
  assert.equal(celebration.session.duration, 25);
  assert.equal(timerReducer(finished, { type: 'tick', now: 1_501_000, settings }), finished);
});
