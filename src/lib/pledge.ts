/**
 * Reduction pledge milestone calculator.
 *
 * Given a baseline footprint, a target footprint, and an optional history of
 * measured footprints over time, computes which milestones (25%, 50%, 75%,
 * 100% of the required reduction) have been achieved and when.
 *
 * A milestone is "achieved" when a history entry shows a footprint at or below
 * the milestone threshold. The achievedAt date is the date of the first such
 * history entry.
 */

import type { HistoryEntry } from './schemas';

export interface PledgeMilestone {
  /** Fraction of total required reduction (0.25, 0.5, 0.75, 1.0). */
  fraction: number;
  /** Human-readable label (e.g. "25% cut"). */
  label: string;
  /** Footprint in tonnes at this milestone. */
  thresholdTonnes: number;
  /** ISO date string if achieved; null otherwise. */
  achievedAt: string | null;
  /** The history entry kg value when milestone was hit, for display. */
  achievedKg: number | null;
}

export interface PledgeProgress {
  milestones: PledgeMilestone[];
  /** Overall % of the reduction range achieved (0–100). */
  overallPercent: number;
  /** Current tonnes relative to baseline and target. */
  currentTonnes: number;
  baselineTonnes: number;
  targetTonnes: number;
}

const FRACTIONS: Array<{ fraction: number; label: string }> = [
  { fraction: 0.25, label: '25% reduction' },
  { fraction: 0.5,  label: '50% reduction' },
  { fraction: 0.75, label: '75% reduction' },
  { fraction: 1.0,  label: 'Goal reached' },
];

/**
 * Calculate milestone progress for a reduction pledge.
 *
 * @param baselineTonnes - Footprint when the pledge was created.
 * @param targetTonnes   - Pledged end footprint (must be < baseline).
 * @param currentTonnes  - Latest measured footprint (for overall % calculation).
 * @param history        - Ordered history entries (oldest first).
 */
export function calculatePledgeMilestones(
  baselineTonnes: number,
  targetTonnes: number,
  currentTonnes: number,
  history: HistoryEntry[],
): PledgeProgress {
  const totalReduction = Math.max(0, baselineTonnes - targetTonnes);

  const milestones: PledgeMilestone[] = FRACTIONS.map(({ fraction, label }) => {
    const thresholdTonnes = baselineTonnes - totalReduction * fraction;

    // Find the earliest history entry at or below threshold
    const hit = history.find((h) => h.totalTonnes <= thresholdTonnes);

    return {
      fraction,
      label,
      thresholdTonnes,
      achievedAt: hit?.date ?? null,
      achievedKg: hit?.totalKg ?? null,
    };
  });

  // Overall progress: clamp reduction to [0, totalReduction]
  const achieved = Math.max(0, Math.min(baselineTonnes - currentTonnes, totalReduction));
  const overallPercent = totalReduction > 0 ? (achieved / totalReduction) * 100 : 0;

  return {
    milestones,
    overallPercent,
    currentTonnes,
    baselineTonnes,
    targetTonnes,
  };
}
