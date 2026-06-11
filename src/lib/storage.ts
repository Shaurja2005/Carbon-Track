import { type z } from 'zod';
import {
  footprintInputSchema,
  goalSchema,
  historySchema,
  challengeEntriesSchema,
  type FootprintInput,
  type Goal,
  type HistoryEntry,
  type ChallengeEntry,
} from './schemas';

/**
 * Safe localStorage layer.
 *
 * SECURITY: localStorage is treated as UNTRUSTED. Every value read back is parsed
 * and validated against its Zod schema; anything malformed, tampered with, or of
 * the wrong shape fails closed (returns null / empty), never throwing into the UI.
 * All access is also guarded so the module is safe to import during SSR, in private
 * browsing, or when storage is disabled or over quota.
 */

const KEYS = {
  input: 'ecotrace:input',
  goal: 'ecotrace:goal',
  history: 'ecotrace:history',
  challenges: 'ecotrace:challenges',
} as const;

/** Cap stored history so a single browser key can never grow without bound. */
const MAX_HISTORY = 100;

function getStorage(): Storage | null {
  try {
    const g = globalThis as { localStorage?: Storage };
    return g.localStorage ?? null;
  } catch {
    // Accessing localStorage can throw in sandboxed iframes / strict privacy modes.
    return null;
  }
}

/** True when localStorage is usable in this environment (false during SSR, private modes, etc.). */
export function isStorageAvailable(): boolean {
  return getStorage() !== null;
}

function writeRaw(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // e.g. QuotaExceededError
    return false;
  }
}

function readValidated<S extends z.ZodTypeAny>(key: string, schema: S): z.infer<S> | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    // Invalid JSON, etc.
    return null;
  }
}

function removeRaw(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* no-op */
  }
}

/** Persist the questionnaire input; returns false if storage is unavailable or full. */
export function saveInput(input: FootprintInput): boolean {
  return writeRaw(KEYS.input, input);
}

/** Load the saved questionnaire input, or null if missing or invalid. */
export function loadInput(): FootprintInput | null {
  return readValidated(KEYS.input, footprintInputSchema);
}

/** Persist the reduction goal; returns false if storage is unavailable or full. */
export function saveGoal(goal: Goal): boolean {
  return writeRaw(KEYS.goal, goal);
}

/** Load the saved reduction goal, or null if missing or invalid. */
export function loadGoal(): Goal | null {
  return readValidated(KEYS.goal, goalSchema);
}

/** Remove any saved reduction goal. */
export function clearGoal(): void {
  removeRaw(KEYS.goal);
}

/** Load the footprint history (empty array if missing or invalid). */
export function loadHistory(): HistoryEntry[] {
  return readValidated(KEYS.history, historySchema) ?? [];
}

/**
 * Append an entry to history, capped at MAX_HISTORY, and return the new list.
 *
 * Consecutive duplicates are skipped: if the footprint is unchanged from the most
 * recent entry, no new point is recorded. This keeps the trend meaningful and
 * stops the table filling with identical rows when results are revisited or the
 * questionnaire is re-submitted without edits.
 */
export function addHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const history = loadHistory();
  const last = history[history.length - 1];
  if (last && last.totalKg === entry.totalKg) return history;
  const next = [...history, entry].slice(-MAX_HISTORY);
  writeRaw(KEYS.history, next);
  return next;
}

/** Remove all footprint history. */
export function clearHistory(): void {
  removeRaw(KEYS.history);
}

/** Load saved challenge entries (empty array if missing or invalid). */
export function loadChallengeEntries(): ChallengeEntry[] {
  return readValidated(KEYS.challenges, challengeEntriesSchema) ?? [];
}

/**
 * Upsert a challenge entry for the given week key.
 * If an entry for the same week already exists it is replaced; otherwise appended.
 * Entries are capped at 52 (one year's worth of weekly challenges).
 */
export function saveChallengeEntry(entry: ChallengeEntry): ChallengeEntry[] {
  const existing = loadChallengeEntries();
  const idx = existing.findIndex((e) => e.weekKey === entry.weekKey);
  const next =
    idx >= 0
      ? existing.map((e, i) => (i === idx ? entry : e))
      : [...existing, entry].slice(-52);
  writeRaw(KEYS.challenges, next);
  return next;
}

/** Remove all challenge history. */
export function clearChallengeEntries(): void {
  removeRaw(KEYS.challenges);
}

export { KEYS as STORAGE_KEYS };
