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

import { 
  TARGET_TONNES, 
  PER_CAPITA_AVERAGE_TONNES,
  FLIGHT_FACTOR,
  SHOPPING_FACTOR 
} from './emission-factors';
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

// Helper: Build Headline
function buildHeadline(totalTonnes: number, pct: number, topCat: CategoryKey): string {
  if (totalTonnes <= TARGET_TONNES) {
    return `Your estimated annual footprint of ${formatTonnes(totalTonnes)} is already below the 1.5°C science-based target.`;
  }
  if (pct <= 70) {
    return `At ${formatTonnes(totalTonnes)} per year, your footprint is well below the average for your region.`;
  }
  if (pct <= 100) {
    return `Your footprint of ${formatTonnes(totalTonnes)} is below your regional average, but there is still room to close the gap to the 1.5°C target.`;
  }
  return `Your footprint of ${formatTonnes(totalTonnes)} is above the regional average, driven primarily by ${CATEGORY_NAMES[topCat]}.`;
}

// Helper: Build Breakdown
function buildBreakdown(
  result: FootprintResult,
  topCat: CategoryKey,
  bottomCat: CategoryKey,
  topKg: number,
  bottomKg: number,
  input: FootprintInput
): string {
  if (topCat === bottomCat) {
    return `${CATEGORY_NAMES[topCat]} accounts for the majority of your footprint.`;
  }

  const topPct = result.totalKg > 0 ? Math.round((topKg / result.totalKg) * 100) : 0;
  const topName = CATEGORY_NAMES[topCat] ?? topCat;
  const bottomName = CATEGORY_NAMES[bottomCat] ?? bottomCat;
  const topSentence = `${topName} is your largest source, making up ${topPct}% of your total (${formatCo2(topKg)}).`;

  let transportNote = '';
  if (topCat === 'transport' && input.transport.flightsLongHaulPerYear >= 2) {
    transportNote = ` Long-haul flights alone contribute ${formatCo2(input.transport.flightsLongHaulPerYear * FLIGHT_FACTOR.longHaul)}, more than most other single changes can recover.`;
  } else if (topCat === 'home' && input.home.renewablePercent < 50) {
    transportNote = ` Switching to a renewable electricity tariff would cut this significantly.`;
  } else if (topCat === 'food' && input.food.diet === 'high_meat') {
    transportNote = ` A high-meat diet has one of the largest dietary footprints available — shifting toward lower-meat options makes a measurable difference.`;
  }

  const bottomSentence =
    bottomKg < 100
      ? `${bottomName} contributes very little in comparison.`
      : `${bottomName} is your smallest source at ${formatCo2(bottomKg)}.`;

  return `${topSentence}${transportNote} ${bottomSentence}`;
}

// Helper: Build Top Action
function buildTopAction(topCat: CategoryKey, input: FootprintInput, result: FootprintResult): string {
  if (topCat === 'transport' && input.transport.flightsLongHaulPerYear >= 1) {
    return `Removing one long-haul flight saves around ${formatCo2(FLIGHT_FACTOR.longHaul)} — more than switching to a fully plant-based diet for a year.`;
  }
  if (topCat === 'transport' && input.transport.carFuel !== 'electric' && input.transport.carFuel !== 'none') {
    return `Switching your car to electric would cut your transport footprint by roughly ${formatCo2(result.details.car * 0.7)}.`;
  }
  if (topCat === 'home' && input.home.renewablePercent < 100) {
    return `Moving to a certified renewable electricity tariff would eliminate most of your home electricity emissions (${formatCo2(result.details.electricity)}/yr).`;
  }
  if (topCat === 'food') {
    return `Moving one diet tier lower — for example, from ${input.food.diet.replace('_', ' ')} to lower-meat — reduces food emissions by several hundred kilograms per year.`;
  }
  if (topCat === 'consumption' && input.consumption.shopping === 'frequent') {
    const shoppingDiff = SHOPPING_FACTOR.frequent - SHOPPING_FACTOR.average;
    return `Reducing discretionary shopping from frequent to average could save around ${formatCo2(shoppingDiff)}/yr in embodied goods emissions.`;
  }
  
  const topName = CATEGORY_NAMES[topCat] ?? topCat;
  return `Focus on ${topName}, which is where the largest reductions are available to you.`;
}

// Helper: Build Context
function buildContext(totalTonnes: number, regional: number, pct: number, regionRaw: string): string {
  const regionName = regionRaw === 'GLOBAL' ? 'global' : regionRaw;
  return `${describeTargetGap(totalTonnes)} Compared to the ${regionName} average of ${formatTonnes(regional)}, you are at ${pct}%.`;
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

  return {
    headline: buildHeadline(result.totalTonnes, pct, topCat),
    breakdown: buildBreakdown(result, topCat, bottomCat, topKg, bottomKg, input),
    topAction: buildTopAction(topCat, input, result),
    context: buildContext(result.totalTonnes, regional, pct, input.region),
  };
}
