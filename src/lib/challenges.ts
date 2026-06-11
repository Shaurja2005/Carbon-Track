/**
 * Weekly challenge engine.
 *
 * Each week a single challenge is surfaced based on the user's footprint profile.
 * The week is keyed by ISO 8601 week number (YYYY-Www) so the challenge rotates
 * every Monday at midnight local time. Completed challenges are stored with their
 * estimated CO₂ saving so cumulative progress can be displayed.
 *
 * Challenges are rule-based and deterministic — no randomness, no network. The
 * same inputs always produce the same challenge for the same week.
 */

import type { FootprintInput, FootprintResult } from './schemas';

export type ChallengeCategory = 'transport' | 'home' | 'food' | 'consumption' | 'general';
export type ChallengeStatus = 'todo' | 'done' | 'skipped';

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  title: string;
  description: string;
  /** Rough one-week saving in kg CO₂e if the challenge is completed. */
  estimatedWeeklySavingKg: number;
  actionLabel: string;
}

/** Returns the ISO week key for a given date (e.g. "2025-W03"). */
export function isoWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // ISO week starts on Monday; day 0=Sun → shift to Mon=0
  const day = d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = d.valueOf();
  d.setUTCMonth(0, 1);
  if (d.getUTCDay() !== 4) {
    d.setUTCMonth(0, 1 + ((4 - d.getUTCDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - d.valueOf()) / 604800000);
  return `${new Date(firstThursday).getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Challenge pool — each challenge targets one behavioral area.
// Estimated weekly savings are conservative fractions of annual factors.
// ---------------------------------------------------------------------------

const ALL_CHALLENGES: Challenge[] = [
  // Transport
  {
    id: 'wk-no-car-day',
    category: 'transport',
    title: 'One car-free day',
    description:
      'Choose one day this week and leave the car at home. Walk, cycle, or take public transit for all journeys that day.',
    estimatedWeeklySavingKg: 2.5,
    actionLabel: 'Completed my car-free day',
  },
  {
    id: 'wk-cycle-commute',
    category: 'transport',
    title: 'Cycle or walk to work once',
    description:
      'Replace one commute trip with cycling or walking. Even a single swap meaningfully cuts your weekly transport emissions.',
    estimatedWeeklySavingKg: 1.8,
    actionLabel: 'Did it — cycled or walked',
  },
  {
    id: 'wk-remote-meeting',
    category: 'transport',
    title: 'Replace a meeting with a call',
    description:
      'Switch one in-person meeting this week to a video call. Short business trips and commutes add up quickly.',
    estimatedWeeklySavingKg: 3.2,
    actionLabel: 'Meeting went virtual',
  },
  // Home energy
  {
    id: 'wk-cold-wash',
    category: 'home',
    title: 'Wash laundry at 30°C',
    description:
      'Dropping your washing machine from 40°C to 30°C cuts per-wash energy use by around 40%. Modern detergents work just as well cold.',
    estimatedWeeklySavingKg: 0.6,
    actionLabel: 'Washed cold this week',
  },
  {
    id: 'wk-standby-off',
    category: 'home',
    title: 'Turn off standby devices',
    description:
      'Switch off TVs, monitors, and gaming consoles at the plug when not in use. UK households waste around £35/yr on standby alone.',
    estimatedWeeklySavingKg: 0.4,
    actionLabel: 'Standby eliminated',
  },
  {
    id: 'wk-thermostat',
    category: 'home',
    title: 'Drop the thermostat by 1°C',
    description:
      'Reducing home heating by one degree saves roughly 3% of heating emissions. Wear an extra layer and turn it down for the week.',
    estimatedWeeklySavingKg: 1.1,
    actionLabel: 'Thermostat turned down',
  },
  // Food
  {
    id: 'wk-meat-free-day',
    category: 'food',
    title: 'One meat-free day',
    description:
      'Skipping meat for one day a week reduces your annual food footprint by roughly 14%. Plant-based meals are the fastest dietary lever.',
    estimatedWeeklySavingKg: 3.5,
    actionLabel: 'Had a meat-free day',
  },
  {
    id: 'wk-plan-meals',
    category: 'food',
    title: 'Plan meals before shopping',
    description:
      'Write a meal plan before buying groceries. Planned shopping typically cuts household food waste by 25–30%.',
    estimatedWeeklySavingKg: 1.2,
    actionLabel: 'Planned and shopped smart',
  },
  {
    id: 'wk-local-produce',
    category: 'food',
    title: 'Buy one local or seasonal item',
    description:
      'Choose one fruit, vegetable, or dairy product that is locally grown or in season. Shorter supply chains lower transport emissions.',
    estimatedWeeklySavingKg: 0.5,
    actionLabel: 'Bought local this week',
  },
  // Consumption
  {
    id: 'wk-secondhand',
    category: 'consumption',
    title: 'Buy or swap something secondhand',
    description:
      'Before buying new, check a secondhand marketplace or swap group first. Manufacturing new goods accounts for a significant share of personal consumption emissions.',
    estimatedWeeklySavingKg: 2.0,
    actionLabel: 'Found it secondhand',
  },
  {
    id: 'wk-repair',
    category: 'consumption',
    title: 'Repair something instead of replacing it',
    description:
      'Sew a button, patch a puncture, or fix a broken clasp. Extending product life avoids the embodied carbon of replacement.',
    estimatedWeeklySavingKg: 1.5,
    actionLabel: 'Repaired rather than replaced',
  },
  // General
  {
    id: 'wk-carbon-audit',
    category: 'general',
    title: 'Recalculate your footprint',
    description:
      'Come back and update your answers. Tracking your number over time turns vague intentions into visible progress.',
    estimatedWeeklySavingKg: 0,
    actionLabel: 'Updated my answers',
  },
];

/**
 * Select the challenge for the current week, weighted toward the user's highest
 * emission category. Falls back to a general challenge if no profile is provided.
 */
export function selectWeeklyChallenge(
  weekKey: string,
  input?: FootprintInput,
  result?: FootprintResult,
): Challenge {
  // Determine highest-impact category from result, if available
  let topCategory: ChallengeCategory = 'general';
  if (result) {
    const cats = result.categories;
    const entries = Object.entries(cats) as [ChallengeCategory, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    if (top) topCategory = top[0];
  }

  // Suppress unused parameter warning — input may inform future priority logic
  void input;

  // Filter by top category; if none, use all
  const pool = ALL_CHALLENGES.filter((c) => c.category === topCategory || c.category === 'general');
  const candidates = pool.length > 0 ? pool : ALL_CHALLENGES;

  // Deterministic selection: hash week key to pick from pool
  let hash = 0;
  for (let i = 0; i < weekKey.length; i++) {
    hash = (hash * 31 + weekKey.charCodeAt(i)) >>> 0;
  }
  const selected = candidates[hash % candidates.length];
  // candidates always has at least one element (falls back to ALL_CHALLENGES)
  if (!selected && ALL_CHALLENGES.length > 0) {
    return ALL_CHALLENGES[0] as Challenge;
  }
  return selected as Challenge;
}

/** Return all challenges, useful for displaying history or the full challenge list. */
export function getAllChallenges(): Challenge[] {
  return [...ALL_CHALLENGES];
}
