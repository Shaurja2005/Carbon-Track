/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, describe } from 'vitest';
import { calculatePledgeMilestones } from './pledge';
import type { HistoryEntry } from './schemas';

describe('calculatePledgeMilestones', () => {
  test('accurately calculates achieved milestones and timeline percentages', () => {
    const history: HistoryEntry[] = [
      { id: '1', date: '2026-01-01', totalKg: 10000, totalTonnes: 10, input: {} as any },
      { id: '2', date: '2026-02-01', totalKg: 8000, totalTonnes: 8, input: {} as any },
      { id: '3', date: '2026-03-01', totalKg: 5000, totalTonnes: 5, input: {} as any },
    ];
    
    // baseline: 10, target: 5, current: 5
    // Required reduction: 5. 25% = 1.25 (Threshold = 8.75)
    const result = calculatePledgeMilestones(10, 5, 5, history);
    
    expect(result.overallPercent).toBe(100);
    expect(result.milestones[0].fraction).toBe(0.25);
    expect(result.milestones[0].achievedAt).toBe('2026-02-01'); // 8 is below 8.75
    expect(result.milestones[1].achievedAt).toBe('2026-03-01'); // 5 is below 7.5
  });

  test('gracefully handles empty history and 0% progress', () => {
    const result = calculatePledgeMilestones(10, 5, 10, []);
    
    expect(result.overallPercent).toBe(0);
    expect(result.milestones.every(m => m.achievedAt === null)).toBe(true);
  });
});
