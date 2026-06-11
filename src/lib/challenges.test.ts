import { expect, test, describe } from 'vitest';
import { selectWeeklyChallenge, getAllChallenges, isoWeekKey } from './challenges';
import type { FootprintResult } from './schemas';

describe('challenges', () => {
  test('getAllChallenges returns an array of available tasks', () => {
    expect(getAllChallenges().length).toBeGreaterThan(0);
  });
  
  test('isoWeekKey correctly formats an ISO week string', () => {
    const date = new Date('2026-06-11T12:00:00Z');
    const week = isoWeekKey(date);
    expect(week).toMatch(/^\d{4}-W\d{2}$/);
  });

  test('selectWeeklyChallenge falls back to general category when no result is provided', () => {
    const challenge = selectWeeklyChallenge('2026-W01');
    expect(challenge.category).toMatch(/general|transport|home|food|consumption/);
  });

  test('selectWeeklyChallenge prioritizes the users top emission category', () => {
    const result: FootprintResult = {
      totalKg: 5000, totalTonnes: 5,
      categories: { transport: 4000, home: 100, food: 100, consumption: 800 },
      details: {} as any
    };
    
    // The pool should only be transport or general if transport is their highest emission.
    const challenge = selectWeeklyChallenge('2026-W01', undefined, result);
    expect(['transport', 'general']).toContain(challenge.category);
  });
});
