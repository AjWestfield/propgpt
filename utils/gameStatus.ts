import { Sport } from '../types/game';

const HALF_TIME_SPORTS: Sport[] = ['NBA', 'NFL'];
const ZERO_CLOCK_PATTERNS = [
  /^0+:0{2}(?:\.0+)?$/,
  /^0+(?:\.0+)?$/,
];

const containsHalftimeKeyword = (text?: string | null): boolean => {
  if (!text) return false;
  return text.toLowerCase().includes('half');
};

const isZeroClockValue = (clock: string): boolean => {
  const normalized = clock.trim().toLowerCase().replace(/\s/g, '');
  return ZERO_CLOCK_PATTERNS.some((pattern) => pattern.test(normalized));
};

export function isHalftime(
  sport: Sport,
  period?: number | null,
  clock?: string | null,
  statusDescription?: string | null
): boolean {
  if (!period) return false;
  if (!HALF_TIME_SPORTS.includes(sport)) return false;

  if (period === 2 && containsHalftimeKeyword(statusDescription)) {
    return true;
  }

  if (!clock) return false;

  return period === 2 && isZeroClockValue(clock);
}
