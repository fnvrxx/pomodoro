import test from "node:test";
import assert from "node:assert/strict";
import { playRingRepeated, stopAllRingtones } from "../app/data/ringtones.ts";
import { decodeRingtone, MAX_AUDIO_BYTES } from "../app/services/customRingtone.ts";

test("uploaded audio repeats sequentially and stopping closes its context", () => {
  const starts = [];
  let closed = 0;
  globalThis.window = { AudioContext: class {
    currentTime = 10;
    destination = {};
    close() { closed++; return Promise.resolve(); }
    createBufferSource() { return { connect() {}, start(time) { starts.push(time); } }; }
  } };
  try {
    playRingRepeated("custom", 3, { duration: 2 });
    assert.deepEqual(starts, [10, 12.3, 14.6]);
    stopAllRingtones();
    assert.equal(closed, 1);
    playRingRepeated("custom", 0, { duration: 2 });
    assert.equal(starts.length, 3);
  } finally {
    stopAllRingtones();
    delete globalThis.window;
  }
});

test("empty and oversized uploads fail before audio decoding", async () => {
  await assert.rejects(decodeRingtone(new Blob()), /kosong/);
  await assert.rejects(decodeRingtone({ size: MAX_AUDIO_BYTES + 1 }), /5 MB/);
});
