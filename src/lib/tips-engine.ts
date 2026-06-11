import {
  CAR_FUEL_FACTOR,
  FLIGHT_FACTOR,
  TRANSIT_FACTOR,
  DIET_FACTOR,
  FOOD_WASTE_MULTIPLIER,
  SHOPPING_FACTOR,
  RECYCLING_MULTIPLIER,
  WEEKS_PER_YEAR,
  type Diet,
  type Shopping,
} from './emission-factors';
import { round } from './number';
import type { CategoryKey, FootprintInput, FootprintResult } from './schemas';

export type Effort = 'low' | 'medium' | 'high';

export interface Tip {
  id: string;
  category: CategoryKey;
  title: string;
  description: string;
  estimatedSavingKg: number;
  effort: Effort;
}

const MODAL_SHIFT_CAR_THRESHOLD_KG = 500;
const MODAL_SHIFT_FRACTION = 0.25;
const FULL_RENEWABLE_PERCENT = 100;

const LOWER_IMPACT_DIET: Record<Diet, Diet | null> = {
  high_meat: 'medium_meat',
  medium_meat: 'low_meat',
  low_meat: 'pescatarian',
  pescatarian: 'vegetarian',
  vegetarian: 'vegan',
  vegan: null,
};

function humanizeDiet(diet: Diet): string {
  return diet.replace('_', ' ');
}

export interface GenerateTipsOptions {
  limit?: number;
}

type TipGenerator = (input: FootprintInput, result: FootprintResult) => Tip | null;

const checkEvSwitch: TipGenerator = (input, result) => {
  const { transport } = input;
  if (transport.carFuel !== 'electric' && transport.carFuel !== 'none' && result.details.car > 0) {
    const km = transport.carKmPerWeek * WEEKS_PER_YEAR;
    const saving = km * (CAR_FUEL_FACTOR[transport.carFuel] - CAR_FUEL_FACTOR.electric);
    return {
      id: 'switch-ev',
      category: 'transport',
      title: 'Switch to an electric vehicle',
      description: 'Replacing your current car with an EV removes most of its direct driving emissions.',
      estimatedSavingKg: round(saving),
      effort: 'high',
    };
  }
  return null;
};

const checkLongHaulFlight: TipGenerator = (input) => {
  if (input.transport.flightsLongHaulPerYear >= 1) {
    return {
      id: 'cut-longhaul-flight',
      category: 'transport',
      title: 'Replace one long-haul flight',
      description: 'Swapping a single long-haul return trip for rail, a closer destination, or a virtual meeting.',
      estimatedSavingKg: round(FLIGHT_FACTOR.longHaul),
      effort: 'medium',
    };
  }
  return null;
};

const checkTransitShift: TipGenerator = (input, result) => {
  const { transport } = input;
  if (result.details.car > MODAL_SHIFT_CAR_THRESHOLD_KG && transport.publicTransitKmPerWeek < transport.carKmPerWeek) {
    const shiftedKm = transport.carKmPerWeek * MODAL_SHIFT_FRACTION * WEEKS_PER_YEAR;
    const saving = shiftedKm * (CAR_FUEL_FACTOR[transport.carFuel] - TRANSIT_FACTOR);
    if (saving > 0) {
      return {
        id: 'shift-to-transit',
        category: 'transport',
        title: 'Shift a quarter of car trips to transit or cycling',
        description: 'Moving short, regular journeys from the car to public transport, walking, or cycling.',
        estimatedSavingKg: round(saving),
        effort: 'medium',
      };
    }
  }
  return null;
};

const checkRenewableTariff: TipGenerator = (input, result) => {
  const { home } = input;
  if (home.renewablePercent < FULL_RENEWABLE_PERCENT && result.details.electricity > 0) {
    const saving = result.details.electricity * (1 - home.renewablePercent / FULL_RENEWABLE_PERCENT);
    return {
      id: 'renewable-tariff',
      category: 'home',
      title: 'Switch to a renewable electricity tariff',
      description: 'A certified green tariff or rooftop solar can cut your electricity emissions toward zero.',
      estimatedSavingKg: round(saving),
      effort: 'low',
    };
  }
  return null;
};

const checkDietShift: TipGenerator = (input) => {
  const { food } = input;
  const lower = LOWER_IMPACT_DIET[food.diet];
  if (lower) {
    const saving = (DIET_FACTOR[food.diet] - DIET_FACTOR[lower]) * FOOD_WASTE_MULTIPLIER[food.foodWaste];
    if (saving > 0) {
      return {
        id: 'diet-shift',
        category: 'food',
        title: 'Shift toward a lower-impact diet',
        description: `Moving from a ${humanizeDiet(food.diet)} to a ${humanizeDiet(lower)} diet meaningfully lowers food emissions.`,
        estimatedSavingKg: round(saving),
        effort: 'medium',
      };
    }
  }
  return null;
};

const checkFoodWaste: TipGenerator = (input) => {
  const { food } = input;
  if (food.foodWaste !== 'low') {
    const current = DIET_FACTOR[food.diet] * FOOD_WASTE_MULTIPLIER[food.foodWaste];
    const reduced = DIET_FACTOR[food.diet] * FOOD_WASTE_MULTIPLIER.low;
    return {
      id: 'cut-food-waste',
      category: 'food',
      title: 'Reduce food waste',
      description: 'Planning meals and storing food well cuts the emissions embedded in food that gets thrown away.',
      estimatedSavingKg: round(current - reduced),
      effort: 'low',
    };
  }
  return null;
};

const checkConsumption: TipGenerator = (input) => {
  const { consumption } = input;
  if (consumption.shopping !== 'minimal') {
    const reducedLevel: Shopping = consumption.shopping === 'frequent' ? 'average' : 'minimal';
    const multiplier = consumption.recycles ? RECYCLING_MULTIPLIER : 1;
    const saving = (SHOPPING_FACTOR[consumption.shopping] - SHOPPING_FACTOR[reducedLevel]) * multiplier;
    return {
      id: 'buy-less',
      category: 'consumption',
      title: 'Buy less and choose secondhand',
      description: 'Extending the life of what you own and buying used avoids the emissions of new products.',
      estimatedSavingKg: round(saving),
      effort: 'medium',
    };
  }
  return null;
};

const checkRecycling: TipGenerator = (input) => {
  const { consumption } = input;
  if (!consumption.recycles) {
    const saving = SHOPPING_FACTOR[consumption.shopping] * (1 - RECYCLING_MULTIPLIER);
    return {
      id: 'start-recycling',
      category: 'consumption',
      title: 'Recycle consistently',
      description: 'Routine recycling lowers the lifecycle emissions of your household goods.',
      estimatedSavingKg: round(saving),
      effort: 'low',
    };
  }
  return null;
};

const TIP_GENERATORS: TipGenerator[] = [
  checkEvSwitch,
  checkLongHaulFlight,
  checkTransitShift,
  checkRenewableTariff,
  checkDietShift,
  checkFoodWaste,
  checkConsumption,
  checkRecycling,
];

export function generateTips(
  input: FootprintInput,
  result: FootprintResult,
  options: GenerateTipsOptions = {},
): Tip[] {
  const tips = TIP_GENERATORS.map((gen) => gen(input, result)).filter((tip): tip is Tip => tip !== null);
  tips.sort((a, b) => b.estimatedSavingKg - a.estimatedSavingKg);
  const limit = options.limit ?? tips.length;
  return tips.slice(0, Math.max(0, limit));
}
