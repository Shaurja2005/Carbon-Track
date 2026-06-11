/**
 * Country per-capita CO₂e dataset.
 *
 * Sources:
 *  - Our World in Data — CO₂ and Greenhouse Gas Emissions (2023 figures)
 *  - IEA — CO₂ Emissions from Fuel Combustion (2023)
 *  - Global Carbon Project — Global Carbon Budget 2023
 *
 * Figures are annual per-capita tonnes CO₂e, consumption-based where available,
 * production-based otherwise (noted in comments). All values are approximate
 * and intended for relative comparison, not audit-grade accounting.
 *
 * Sorted descending by emissions for leaderboard display.
 */

export interface CountryData {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  name: string;
  /** Annual per-capita CO₂e in tonnes. */
  tonnesPerCapita: number;
  /** Population in millions (2023 estimate, for context display). */
  populationM: number;
  /** Source notes for transparency. */
  source: string;
}

export const COUNTRY_DATASET: ReadonlyArray<CountryData> = [
  { code: 'QA', name: 'Qatar',         tonnesPerCapita: 35.6, populationM: 2.7,   source: 'IEA 2023, production-based' },
  { code: 'AU', name: 'Australia',     tonnesPerCapita: 14.8, populationM: 26.5,  source: 'Our World in Data 2023' },
  { code: 'US', name: 'United States', tonnesPerCapita: 14.0, populationM: 334.0, source: 'Our World in Data 2023' },
  { code: 'CA', name: 'Canada',        tonnesPerCapita: 13.6, populationM: 38.2,  source: 'Our World in Data 2023' },
  { code: 'RU', name: 'Russia',        tonnesPerCapita: 11.5, populationM: 144.4, source: 'Global Carbon Project 2023' },
  { code: 'SA', name: 'Saudi Arabia',  tonnesPerCapita: 11.4, populationM: 36.4,  source: 'IEA 2023' },
  { code: 'KR', name: 'South Korea',   tonnesPerCapita: 11.1, populationM: 51.7,  source: 'IEA 2023' },
  { code: 'JP', name: 'Japan',         tonnesPerCapita: 8.5,  populationM: 125.1, source: 'Our World in Data 2023' },
  { code: 'DE', name: 'Germany',       tonnesPerCapita: 8.1,  populationM: 83.2,  source: 'Our World in Data 2023' },
  { code: 'ZA', name: 'South Africa',  tonnesPerCapita: 7.8,  populationM: 60.6,  source: 'IEA 2023, production-based' },
  { code: 'NL', name: 'Netherlands',   tonnesPerCapita: 7.6,  populationM: 17.8,  source: 'Our World in Data 2023' },
  { code: 'EU', name: 'EU Average',    tonnesPerCapita: 6.5,  populationM: 448.0, source: 'Our World in Data 2023' },
  { code: 'PL', name: 'Poland',        tonnesPerCapita: 6.3,  populationM: 37.9,  source: 'Our World in Data 2023' },
  { code: 'CN', name: 'China',         tonnesPerCapita: 8.2,  populationM: 1412,  source: 'Global Carbon Project 2023' },
  { code: 'FR', name: 'France',        tonnesPerCapita: 5.6,  populationM: 68.0,  source: 'Our World in Data 2023' },
  { code: 'IT', name: 'Italy',         tonnesPerCapita: 5.2,  populationM: 59.2,  source: 'Our World in Data 2023' },
  { code: 'GB', name: 'United Kingdom',tonnesPerCapita: 5.0,  populationM: 67.7,  source: 'Our World in Data 2023' },
  { code: 'MX', name: 'Mexico',        tonnesPerCapita: 3.8,  populationM: 128.0, source: 'Our World in Data 2023' },
  { code: 'AR', name: 'Argentina',     tonnesPerCapita: 3.7,  populationM: 46.2,  source: 'Our World in Data 2023' },
  { code: 'TR', name: 'Turkey',        tonnesPerCapita: 3.6,  populationM: 85.3,  source: 'Our World in Data 2023' },
  { code: 'GL', name: 'Global Average',tonnesPerCapita: 4.7,  populationM: 8000,  source: 'Global Carbon Project 2023' },
  { code: 'BR', name: 'Brazil',        tonnesPerCapita: 3.0,  populationM: 215.3, source: 'Our World in Data 2023' },
  { code: 'ID', name: 'Indonesia',     tonnesPerCapita: 2.7,  populationM: 277.5, source: 'Our World in Data 2023' },
  { code: 'IN', name: 'India',         tonnesPerCapita: 1.9,  populationM: 1417,  source: 'Our World in Data 2023' },
  { code: 'NG', name: 'Nigeria',       tonnesPerCapita: 0.7,  populationM: 223.8, source: 'Our World in Data 2023' },
  { code: 'ET', name: 'Ethiopia',      tonnesPerCapita: 0.2,  populationM: 126.5, source: 'Our World in Data 2023' },
];

/** Returns the dataset sorted by tonnes per capita descending (highest first). */
export function getLeaderboardData(): ReadonlyArray<CountryData> {
  return [...COUNTRY_DATASET].sort((a, b) => b.tonnesPerCapita - a.tonnesPerCapita);
}

/** Returns the maximum tonnes value across the dataset (for bar chart scaling). */
export function getLeaderboardMax(): number {
  return Math.max(...COUNTRY_DATASET.map((c) => c.tonnesPerCapita));
}
