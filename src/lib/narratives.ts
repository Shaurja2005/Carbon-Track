/**
 * Smart insight narrative generator.
 *
 * Produces structured, plain-language interpretations of a user's footprint.
 * The output is deterministic — same inputs always yield the same narrative.
 * All numbers reference the same emission factors used in calculator.ts, so
 * figures are internally consistent.
 *
 * The writing is factual and direct: no hedging, no filler, no emoji.
 */

import { TARGET_TONNES, PER_CAPITA_AVERAGE_TONNES } from './emission-factors';
import { formatTonnes, formatCo2 } from './format';
import type { FootprintInput, FootprintResult } from './schemas';

export interface Narrative {
  /** One-sentence headline characterizing the overall footprint. */
  headline: string;
  /** Two or three sentences about the highest and lowest emission categories. */
  breakdown: string;
  /** One actionable sentence about the single most impactful change. */
  topAction: string;
  /** Context sentence comparing to regional average and 1.5°C target. */
  context: string;
}

type CategoryKey = 'transport' | 'home' | 'food' | 'consumption';

const CATEGORY_NAMES: Record<CategoryKey, string> = {
  transport: 'transport',
  home: 'home energy',
  food: 'food',
  consumption: 'shopping and goods',
};

function sortedCategories(
  categories: FootprintResult['categories'],
): Array<[CategoryKey, number]> {
  return (Object.entries(categories) as Array<[CategoryKey, number]>).sort((a, b) => b[1] - a[1]);
}

/** Describe a ratio in plain English without using "x times". */
function describeMagnitude(ratio: number): string {
  if (ratio < 1.1) return 'roughly equal to';
  if (ratio < 1.5) return 'around 30–50% higher than';
  if (ratio < 2.0) return 'about 1.5 times';
  if (ratio < 3.0) return `${ratio.toFixed(1)} times`;
  return `more than ${Math.floor(ratio)} times`;
}

function describeTargetGap(totalTonnes: number): string {
  const ratio = totalTonnes / TARGET_TONNES;
  if (ratio <= 1) {
    return `Your footprint is already within the 1.5°C-aligned personal target of ${formatTonnes(TARGET_TONNES)}.`;
  }
  if (ratio <= 1.2) {
    return `You are close to the 1.5°C-aligned personal target of ${formatTonnes(TARGET_TONNES)} — about ${formatCo2((totalTonnes - TARGET_TONNES) * 1000)} over.`;
  }
  return `The 1.5°C-aligned personal target is ${formatTonnes(TARGET_TONNES)}. You are ${describeMagnitude(ratio)} that figure, which means there is meaningful room to reduce.`;
}

/**
 * Generate a structured narrative for a completed footprint profile.
 *
 * The function is pure and throws no exceptions — it will always return a
 * valid Narrative regardless of input values.
 */
export function generateNarrative(input: FootprintInput, result: FootprintResult): Narrative {
  const sorted = sortedCategories(result.categories);
  const topEntry = sorted[0];
  const bottomEntry = sorted[sorted.length - 1];
  if (!topEntry || !bottomEntry) {
    return {
      headline: `Your estimated annual footprint is ${formatTonnes(result.totalTonnes)} CO₂e.`,
      breakdown: 'Complete the questionnaire to see a full category breakdown.',
      topAction: 'Review the tips section for personalized reduction opportunities.',
      context: `The 1.5°C-aligned personal target is ${formatTonnes(TARGET_TONNES)}.`,
    };
  }
  const [topCat, topKg] = topEntry;
  const [bottomCat, bottomKg] = bottomEntry;
  const regional = PER_CAPITA_AVERAGE_TONNES[input.region];
  const pct = Math.round((result.totalTonnes / regional) * 100);

  // Headline
  let headline: string;
  if (result.totalTonnes <= TARGET_TONNES) {
    headline = `Your estimated annual footprint of ${formatTonnes(result.totalTonnes)} is already below the 1.5°C science-based target.`;
  } else if (pct <= 70) {
    headline = `At ${formatTonnes(result.totalTonnes)} per year, your footprint is well below the average for your region.`;
  } else if (pct <= 100) {
    headline = `Your footprint of ${formatTonnes(result.totalTonnes)} is below your regional average, but there is still room to close the gap to the 1.5°C target.`;
  } else {
    headline = `Your footprint of ${formatTonnes(result.totalTonnes)} is above the regional average, driven primarily by ${CATEGORY_NAMES[topCat]}.`;
  }

  // Breakdown
  let breakdown: string;
  const topPct = result.totalKg > 0 ? Math.round((topKg / result.totalKg) * 100) : 0;

  if (topCat === bottomCat) {
    // Edge case: only one meaningful category
    breakdown = `${CATEGORY_NAMES[topCat as CategoryKey]} accounts for the majority of your footprint.`;
  } else {
    const topName = CATEGORY_NAMES[topCat as CategoryKey] ?? topCat;
    const bottomName = CATEGORY_NAMES[bottomCat as CategoryKey] ?? bottomCat;
    const topSentence = `${topName} is your largest source, making up ${topPct}% of your total (${formatCo2(topKg)}).`;

    let transportNote = '';
    if (topCat === 'transport' && input.transport.flightsLongHaulPerYear >= 2) {
      transportNote = ` Long-haul flights alone contribute ${formatCo2(input.transport.flightsLongHaulPerYear * 1100)}, more than most other single changes can recover.`;
    } else if (topCat === 'home' && input.home.renewablePercent < 50) {
      transportNote = ` Switching to a renewable electricity tariff would cut this significantly.`;
    } else if (topCat === 'food' && input.food.diet === 'high_meat') {
      transportNote = ` A high-meat diet has one of the largest dietary footprints available — shifting toward lower-meat options makes a measurable difference.`;
    }

    const bottomSentence =
      bottomKg < 100
        ? `${bottomName} contributes very little in comparison.`
        : `${bottomName} is your smallest source at ${formatCo2(bottomKg)}.`;

    breakdown = `${topSentence}${transportNote} ${bottomSentence}`;
  }

  // Top action
  let topAction: string;
  if (topCat === 'transport' && input.transport.flightsLongHaulPerYear >= 1) {
    topAction = `Removing one long-haul flight saves around ${formatCo2(1100)} — more than switching to a fully plant-based diet for a year.`;
  } else if (topCat === 'transport' && input.transport.carFuel !== 'electric' && input.transport.carFuel !== 'none') {
    topAction = `Switching your car to electric would cut your transport footprint by roughly ${formatCo2(result.details.car * 0.7)}.`;
  } else if (topCat === 'home' && input.home.renewablePercent < 100) {
    topAction = `Moving to a certified renewable electricity tariff would eliminate most of your home electricity emissions (${formatCo2(result.details.electricity)}/yr).`;
  } else if (topCat === 'food') {
    topAction = `Moving one diet tier lower — for example, from ${input.food.diet.replace('_', ' ')} to lower-meat — reduces food emissions by several hundred kilograms per year.`;
  } else if (topCat === 'consumption' && input.consumption.shopping === 'frequent') {
    topAction = `Reducing discretionary shopping from frequent to average could save around ${formatCo2(1500)}/yr in embodied goods emissions.`;
  } else {
    const topName = CATEGORY_NAMES[topCat as CategoryKey] ?? topCat;
    topAction = `Focus on ${topName}, which is where the largest reductions are available to you.`;
  }

  // Context
  const context = `${describeTargetGap(result.totalTonnes)} Compared to the ${input.region === 'GLOBAL' ? 'global' : input.region} average of ${formatTonnes(regional)}, you are at ${pct}%.`;

  return { headline, breakdown, topAction, context };
}
