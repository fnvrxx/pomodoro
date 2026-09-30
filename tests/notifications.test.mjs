import test from 'node:test';
import assert from 'node:assert/strict';
import { notifyUser } from '../app/services/notifications.ts';

function mockBrowser(t, { permission = 'granted', serviceWorker, constructorFails = false } = {}) {
  const shown = [];
  class FakeNotification {
    static permission = permission;
    constructor(title, options) {
      if (constructorFails) throw new TypeError('Local notifications unavailable');
      shown.push({ title, options });
    }
  }
  const globals = {
    window: { Notification: FakeNotification, focus() {} },
    Notification: FakeNotification,
    navigator: serviceWorker ? { serviceWorker } : {},
  };
  for (const [key, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else delete globalThis[key];
    });
  }
  return shown;
}

test('denied notification permission never tries to display an alert', async t => {
  const shown = mockBrowser(t, { permission: 'denied' });
  assert.equal(await notifyUser('Sesi selesai', { body: 'Istirahat dulu.' }), false);
  assert.equal(shown.length, 0);
});

test('a failed service worker falls back to desktop notification', async t => {
  const shown = mockBrowser(t, { serviceWorker: { register: async () => { throw new Error('Unavailable'); } } });
  assert.equal(await notifyUser('Sesi selesai', { body: 'Istirahat dulu.' }), true);
  assert.equal(shown.length, 1);
});

test('returning to the page cancels a pending away notification', async t => {
  let relevant = true;
  let sent = false;
  const shown = mockBrowser(t, {
    serviceWorker: {
      register: async () => { relevant = false; },
      ready: Promise.resolve({ showNotification: async () => { sent = true; } }),
    },
  });
  assert.equal(await notifyUser('Kembali fokus', {}, () => relevant), false);
  assert.equal(sent, false);
  assert.equal(shown.length, 0);
});

test('unsupported local notifications fail safely without rejecting completion flow', async t => {
  mockBrowser(t, { constructorFails: true });
  assert.equal(await notifyUser('Sesi selesai', {}), false);
});
