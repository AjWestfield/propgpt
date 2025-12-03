// Season Detection Service for College Sports
// Determines if college sports are currently in season

import { Sport } from '../types/game';

export type SeasonStatus = 'active' | 'off-season' | 'postseason';

export interface CollegeSeasonInfo {
  isInSeason: boolean;
  status: SeasonStatus;
  currentWeek?: number; // For football
  phase?: string; // e.g., "Regular Season", "Conference Championships", "Bowl Season"
}

/**
 * College Football Season:
 * - Regular Season: Late August - Late November (Weeks 0-13)
 * - Conference Championships: Early December
 * - Bowl Season: Mid-December - Early January
 * - College Football Playoff: Late December - Early January
 */
export function isCollegeFootballSeason(): boolean {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  // August (8) through January (1)
  return month >= 8 || month <= 1;
}

/**
 * Get detailed College Football season information
 */
export function getCollegeFootballSeasonInfo(): CollegeSeasonInfo {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Off-season: February through July
  if (month >= 2 && month <= 7) {
    return {
      isInSeason: false,
      status: 'off-season',
      phase: 'Off-Season',
    };
  }

  // Regular Season: Late August - Late November
  if ((month === 8 && day >= 20) || (month >= 9 && month <= 11)) {
    // Estimate current week (rough approximation)
    let weekNumber = 1;
    if (month === 9) weekNumber = Math.min(4 + Math.floor(day / 7), 4);
    else if (month === 10) weekNumber = Math.min(5 + Math.floor(day / 7), 9);
    else if (month === 11) weekNumber = Math.min(10 + Math.floor(day / 7), 13);

    return {
      isInSeason: true,
      status: 'active',
      currentWeek: weekNumber,
      phase: 'Regular Season',
    };
  }

  // Conference Championships & Postseason: December - Early January
  if (month === 12 || month === 1) {
    const isEarlyDecember = month === 12 && day <= 10;
    const phase = isEarlyDecember
      ? 'Conference Championships'
      : month === 12
      ? 'Bowl Season'
      : 'College Football Playoff';

    return {
      isInSeason: true,
      status: 'postseason',
      phase,
    };
  }

  // Late August before season starts
  return {
    isInSeason: false,
    status: 'off-season',
    phase: 'Pre-Season',
  };
}

/**
 * College Basketball Season:
 * - Regular Season: Early November - Early March
 * - Conference Tournaments: Early March - Mid March
 * - NCAA Tournament (March Madness): Mid March - Early April
 */
export function isCollegeBasketballSeason(): boolean {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  // November (11) through April (4)
  return month >= 11 || month <= 4;
}

/**
 * Get detailed College Basketball season information
 */
export function getCollegeBasketballSeasonInfo(): CollegeSeasonInfo {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Off-season: May through October
  if (month >= 5 && month <= 10) {
    return {
      isInSeason: false,
      status: 'off-season',
      phase: 'Off-Season',
    };
  }

  // Regular Season: November - Early March
  if (month === 11 || month === 12 || (month >= 1 && month <= 2) || (month === 3 && day <= 7)) {
    return {
      isInSeason: true,
      status: 'active',
      phase: 'Regular Season',
    };
  }

  // Conference Tournaments: Early March (typically March 8-15)
  if (month === 3 && day >= 8 && day <= 15) {
    return {
      isInSeason: true,
      status: 'postseason',
      phase: 'Conference Tournaments',
    };
  }

  // NCAA Tournament (March Madness): Mid March - Early April (typically March 16 - April 8)
  if ((month === 3 && day >= 16) || (month === 4 && day <= 8)) {
    return {
      isInSeason: true,
      status: 'postseason',
      phase: 'March Madness',
    };
  }

  return {
    isInSeason: false,
    status: 'off-season',
    phase: 'Off-Season',
  };
}

/**
 * Get season information for any sport
 */
export function getSeasonInfo(sport: Sport): CollegeSeasonInfo {
  switch (sport) {
    case 'NCAAF':
      return getCollegeFootballSeasonInfo();
    case 'NCAAB':
      return getCollegeBasketballSeasonInfo();
    case 'NBA':
    case 'NFL':
    case 'MLB':
    case 'NHL':
      // Pro sports are always "in season" for the purposes of this app
      // (We show them year-round)
      return {
        isInSeason: true,
        status: 'active',
        phase: 'Season',
      };
    default:
      return {
        isInSeason: false,
        status: 'off-season',
        phase: 'Unknown',
      };
  }
}

/**
 * Get all currently active college sports
 */
export function getCurrentCollegeSports(): Sport[] {
  const activeSports: Sport[] = [];

  if (isCollegeFootballSeason()) {
    activeSports.push('NCAAF');
  }

  if (isCollegeBasketballSeason()) {
    activeSports.push('NCAAB');
  }

  return activeSports;
}

/**
 * Check if a specific sport is currently in season
 */
export function isSportInSeason(sport: Sport): boolean {
  const info = getSeasonInfo(sport);
  return info.isInSeason;
}

/**
 * Get a human-readable season status message
 */
export function getSeasonStatusMessage(sport: Sport): string {
  const info = getSeasonInfo(sport);

  if (!info.isInSeason) {
    return `${sport} is currently in the off-season`;
  }

  if (info.phase) {
    return info.phase;
  }

  return 'In Season';
}

/**
 * Get current week number for college football
 * Returns null if not in regular season
 */
export function getCurrentFootballWeek(): number | null {
  const info = getCollegeFootballSeasonInfo();
  return info.currentWeek || null;
}
