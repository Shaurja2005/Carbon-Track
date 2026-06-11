import { expect, test, describe } from 'vitest';
import { getLeaderboardData, getLeaderboardMax } from './country-data';

describe('country-data', () => {
  test('getLeaderboardData returns an array sorted descending by tonnesPerCapita', () => {
    const data = getLeaderboardData();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].tonnesPerCapita).toBeGreaterThanOrEqual(data[1].tonnesPerCapita);
    expect(data[0].code).toBe('QA'); // Qatar is highest
  });
  
  test('getLeaderboardMax returns the highest emissions value', () => {
    const max = getLeaderboardMax();
    expect(max).toBe(35.6); // Qatar's value
  });
});
