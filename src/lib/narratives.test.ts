import { expect, test, describe } from 'vitest';
import { generateNarrative } from './narratives';
import type { FootprintInput, FootprintResult } from './schemas';

describe('generateNarrative', () => {
  const baseInput: FootprintInput = {
    region: 'UK',
    transport: { carFuel: 'petrol', carKmPerWeek: 100, publicTransitKmPerWeek: 50, flightsShortHaulPerYear: 0, flightsLongHaulPerYear: 2 },
    home: { householdSize: 2, heatingFuel: 'gas', heatingAmountPerMonth: 100, electricityKwhPerMonth: 300, renewablePercent: 0 },
    food: { diet: 'high_meat', foodWaste: 'high' },
    consumption: { shopping: 'frequent', recycles: false }
  };
  
  const baseResult: FootprintResult = {
    totalKg: 10000,
    totalTonnes: 10.0,
    categories: { transport: 4000, home: 1000, food: 2000, consumption: 3000 },
    details: { car: 1000, transit: 500, flights: 2500, electricity: 500, heating: 500 }
  };

  test('covers transport top action and long flight note', () => {
    const res = generateNarrative(baseInput, baseResult);
    expect(res.breakdown).toContain('Long-haul flights alone');
    expect(res.topAction).toContain('Removing one long-haul flight');
  });

  test('covers below target headline', () => {
    const res = generateNarrative(baseInput, { ...baseResult, totalTonnes: 1.5 });
    expect(res.headline).toContain('already below the 1.5°C');
    expect(res.context).toContain('within the 1.5°C');
  });

  test('covers low footprint relative to region', () => {
    const res = generateNarrative(baseInput, { ...baseResult, totalTonnes: 3.0 });
    expect(res.headline).toContain('well below the average');
    expect(res.context).toContain('meaningful room');
  });

  test('covers below region average but above 70%', () => {
    const res = generateNarrative(baseInput, { ...baseResult, totalTonnes: 4.5 }); 
    expect(res.headline).toContain('below your regional average');
  });
  
  test('covers above region average', () => {
    const res = generateNarrative(baseInput, { ...baseResult, totalTonnes: 6.0 }); 
    expect(res.headline).toContain('above the regional average');
  });



  test('covers car electric top action', () => {
    const input = { ...baseInput, transport: { ...baseInput.transport, flightsLongHaulPerYear: 0 } };
    const res = generateNarrative(input, baseResult);
    expect(res.topAction).toContain('Switching your car to electric');
  });
  
  test('covers home top action and note', () => {
    const result = { ...baseResult, categories: { transport: 0, home: 4000, food: 0, consumption: 0 }};
    const res = generateNarrative(baseInput, result);
    expect(res.breakdown).toContain('Switching to a renewable electricity tariff');
    expect(res.topAction).toContain('Moving to a certified renewable electricity');
  });
  
  test('covers food top action and note', () => {
    const result = { ...baseResult, categories: { transport: 0, home: 0, food: 4000, consumption: 0 }};
    const res = generateNarrative(baseInput, result);
    expect(res.breakdown).toContain('shifting toward lower-meat options');
    expect(res.topAction).toContain('Moving one diet tier lower');
  });
  
  test('covers consumption top action', () => {
    const result = { ...baseResult, categories: { transport: 0, home: 0, food: 0, consumption: 4000 }};
    const res = generateNarrative(baseInput, result);
    expect(res.topAction).toContain('Reducing discretionary shopping');
  });

  test('covers zeroed footprint edge case', () => {
    const result = { ...baseResult, totalKg: 0, totalTonnes: 0, categories: { transport: 0, home: 0, food: 0, consumption: 0 }};
    const res = generateNarrative(baseInput, result);
    expect(res.headline).toContain('already below');
  });
});
