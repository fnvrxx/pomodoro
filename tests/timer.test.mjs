import test from 'node:test';
import assert from 'node:assert/strict';
import { focusHeartsFilled, initialTimer, timerReducer } from '../app/lib/timer.ts';

const settings = { focusDuration: 25, breakDuration: 5, longBreakDuration: 15, longBreakInterval: 4 };

test('timer uses the deadline after a background delay and completes once', () => {
  let state = initialTimer(settings);
  state = timerReducer(state, { type: 'start', now: 0 });
  state = timerReducer(state, { type: 'tick', now: 61_000, settings });
  assert.equal(state.timeRemaining, 1439);
  state = timerReducer(state, { type: 'tick', now: 1_800_000, settings });
  assert.equal(state.mode, 'break');
  assert.equal(state.timeRemaining, 300);
  assert.equal(state.completion?.mode, 'focus');
  assert.equal(state.completion?.duration, 25);
  assert.equal(state.completionSequence, 1);
  assert.equal(timerReducer(state, { type: 'tick', now: 1_801_000, settings }), state);
});

test('pause preserves elapsed time and reset restores the full session', () => {
  let state = timerReducer(initialTimer(settings), { type: 'start', now: 10_000 });
  state = timerReducer(state, { type: 'pause', now: 70_000, settings });
  assert.equal(state.timeRemaining, 1440);
  assert.equal(state.isRunning, false);
  state = timerReducer(state, { type: 'start', now: 100_000 });
  state = timerReducer(state, { type: 'reset', settings });
  assert.equal(state.timeRemaining, 1500);
  assert.equal(state.deadline, null);
});

test('long break follows four focus sessions; skipping does not record completion', () => {
  let state = initialTimer(settings);
  const skipped = timerReducer(state, { type: 'skip', settings });
  assert.equal(skipped.mode, 'break');
  assert.equal(skipped.completedSessions, 0);
  assert.equal(skipped.completion, null);
  assert.equal(focusHeartsFilled(skipped.completedSessions, settings.longBreakInterval, skipped.mode), 0);

  for (let index = 0; index < 4; index++) {
    state = timerReducer(state, { type: 'start', now: 0 });
    state = timerReducer(state, { type: 'tick', now: 1_500_000, settings });
    assert.equal(state.completedSessions, index + 1);
    assert.equal(focusHeartsFilled(state.completedSessions, settings.longBreakInterval, state.mode), index + 1);
    if (index === 3) break;
    assert.equal(state.mode, 'break');
    state = timerReducer(state, { type: 'skip', settings });
    assert.equal(state.mode, 'focus');
  }
  assert.equal(state.mode, 'longBreak');
  assert.equal(state.completedSessions, 4);
  assert.equal(focusHeartsFilled(state.completedSessions, settings.longBreakInterval, state.mode), 4);
  state = timerReducer(state, { type: 'skip', settings });
  assert.equal(focusHeartsFilled(state.completedSessions, settings.longBreakInterval, state.mode), 0);
});

test('settings update resets a stopped session but leaves a running one intact', () => {
  const updated = { ...settings, focusDuration: 30 };
  let state = timerReducer(initialTimer(settings), { type: 'settings', settings: updated });
  assert.equal(state.timeRemaining, 1800);
  state = timerReducer(state, { type: 'start', now: 0 });
  assert.equal(timerReducer(state, { type: 'settings', settings }), state);
});
