"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

let now = Date.UTC(2026, 10, 4, 12, 0, 0);
class FixedDate extends Date {
  constructor(...args) {
    super(...(args.length ? args : [now]));
  }
  static now() {
    return now;
  }
}

const values = new Map();
const listeners = {};
const localStorage = {
  getItem(key) { return values.has(key) ? values.get(key) : null; },
  setItem(key, value) { values.set(key, String(value)); },
  removeItem(key) { values.delete(key); }
};
const document = {
  head: { appendChild() {} },
  body: { classList: { contains() { return false; } } },
  createElement() { return { textContent: "" }; },
  querySelector() { return null; },
  getElementById() { return null; },
  addEventListener() {}
};
const window = {
  EnglisityProgress: {},
  addEventListener(name, callback) { listeners[name] = callback; }
};
const context = {
  window,
  document,
  location: { pathname: "/index.html" },
  localStorage,
  Date: FixedDate,
  console,
  MutationObserver: class {}
};

const source = fs.readFileSync(path.join(__dirname, "..", "js", "features.js"), "utf8");
vm.runInNewContext(source, context, { filename: "features.js" });

const api = window.EnglisityProgress;
assert.equal(typeof api.recordActivity, "function", "streak activity API must be exposed");
assert.equal(typeof api.getStreak, "function", "streak status API must be exposed");

function stored() {
  return JSON.parse(localStorage.getItem("englisity-quiz-streak-v1"));
}
function setDate(year, month, day) {
  now = Date.UTC(year, month - 1, day, 12, 0, 0);
}

// First successful session starts the streak.
setDate(2026, 11, 4);
api.recordActivity();
assert.equal(stored().current, 1);
assert.equal(stored().longest, 1);
assert.equal(stored().lastActive, "2026-11-04");

// A second quiz on the same day must not increase it twice.
api.recordActivity();
assert.equal(stored().current, 1);

// Activity on the next local day continues the streak.
setDate(2026, 11, 5);
api.recordActivity();
assert.equal(stored().current, 2);
assert.equal(stored().longest, 2);

// A missed day resets the current streak but preserves the record.
setDate(2026, 11, 7);
api.recordActivity();
assert.equal(stored().current, 1);
assert.equal(stored().longest, 2);

// A stale streak is shown as zero until the learner is active again.
setDate(2026, 11, 9);
assert.equal(api.getStreak().current, 0);
assert.equal(api.getStreak().longest, 2);
api.recordActivity();
assert.equal(stored().current, 1);
assert.equal(stored().longest, 2);

// Event-based updates use the same single source of truth and stay idempotent.
setDate(2026, 11, 10);
listeners["englisity:quiz-passed"]();
listeners["englisity:quiz-passed"]();
assert.equal(stored().current, 2);
assert.equal(stored().longest, 2);

// Calendar boundaries, including leap day, must continue correctly.
setDate(2028, 2, 28);
api.recordActivity();
assert.equal(stored().current, 1);
setDate(2028, 2, 29);
api.recordActivity();
assert.equal(stored().current, 2);
setDate(2028, 3, 1);
api.recordActivity();
assert.equal(stored().current, 3);

// Corrupt legacy data must recover cleanly rather than breaking the UI.
localStorage.setItem("englisity-quiz-streak-v1", "{not-json");
api.recordActivity();
assert.equal(stored().current, 1);
assert.equal(stored().longest, 1);

process.stdout.write("Streak tests passed: daily increment, idempotency, resets, longest streak, events, leap day, and recovery.\n");
