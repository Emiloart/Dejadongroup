require("./admin-test-loader.cjs");
const test = require("node:test");
const assert = require("node:assert/strict");
const { consumeAttempt } = require("../src/lib/attempt-limiter.ts");

test("rate limits reject new identities at capacity without dropping known counters", () => {
  const now = 1_000_000;
  const attempts = new Map(Array.from({ length: 10_000 }, (_, index) => [
    `ip-${index}`,
    { count: 1, reset: now + 60_000 }
  ]));

  assert.deepEqual(consumeAttempt(attempts, "new-ip", 2, 60_000, now), { allowed: false, reset: now + 60_000 });
  assert.equal(attempts.size, 10_000);
  assert.deepEqual(consumeAttempt(attempts, "ip-0", 2, 60_000, now), { allowed: true, reset: now + 60_000 });
  assert.equal(attempts.get("ip-0").count, 2);
  assert.equal(consumeAttempt(attempts, "ip-0", 2, 60_000, now).allowed, false);
});

test("expired entries are cleared before a new identity is admitted", () => {
  const attempts = new Map([["expired", { count: 1, reset: 99 }]]);
  assert.deepEqual(consumeAttempt(attempts, "fresh", 1, 500, 100), { allowed: true, reset: 600 });
  assert.deepEqual([...attempts.keys()], ["fresh"]);
});
