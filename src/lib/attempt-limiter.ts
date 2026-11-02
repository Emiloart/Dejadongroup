export type AttemptEntry = { count: number; reset: number };

/** A bounded per-process limiter. A full map rejects new keys instead of failing open. */
export function consumeAttempt(
  attempts: Map<string, AttemptEntry>,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
) {
  for (const [existingKey, entry] of attempts) if (entry.reset <= now) attempts.delete(existingKey);
  let entry = attempts.get(key);
  if (!entry && attempts.size >= 10_000) return { allowed: false, reset: now + windowMs };
  entry ||= { count: 0, reset: now + windowMs };
  if (entry.count >= limit) return { allowed: false, reset: entry.reset };
  entry.count++;
  attempts.set(key, entry);
  return { allowed: true, reset: entry.reset };
}
