/**
 * Sportsbook Logo URLs and Configuration
 *
 * Logo sources from public CDNs and official brand assets
 */

import { SportsbookConfig } from '../types/outlierEV';

/**
 * Sportsbook logo URLs from public CDNs
 * Using a mix of official sources and public logo repositories
 */
export const SPORTSBOOK_LOGO_URLS: Record<string, string> = {
  // Daily Fantasy Sports
  prizepicks: 'https://assets.prizepicks.com/images/prizepicks-logo.png',
  underdog: 'https://underdogfantasy.com/assets/logo.png',
  parlayplay: 'https://www.parlayplay.io/images/parlayplay-logo.png',

  // Traditional Sportsbooks
  fanduel: 'https://www.fanduel.com/assets/fanduel-logo.svg',
  draftkings: 'https://www.draftkings.com/dkjs/header/v1/assets/images/dk-logo.svg',
  betmgm: 'https://sports.on.betmgm.ca/assets/betmgm-logo.svg',
  caesars: 'https://www.williamhill.com/us/images/caesars-sportsbook-logo.svg',
  pointsbet: 'https://www.pointsbet.com/assets/pointsbet-logo.svg',
  bet365: 'https://www.bet365.com/assets/bet365-logo.svg',
  barstool: 'https://www.barstoolsportsbook.com/assets/barstool-logo.svg',
  wynnbet: 'https://www.wynnbet.com/assets/wynnbet-logo.svg',
  unibet: 'https://www.unibet.com/assets/unibet-logo.svg',
  foxbet: 'https://www.foxbet.com/assets/foxbet-logo.svg',

  // Additional books from Odds-API.io
  betrivers: 'https://www.betrivers.com/assets/betrivers-logo.svg',
  sugarhouse: 'https://www.playsugarhouse.com/assets/sugarhouse-logo.svg',
  betus: 'https://www.betus.com.pa/assets/betus-logo.svg',
  mybookie: 'https://mybookie.ag/assets/mybookie-logo.svg',
  bovada: 'https://www.bovada.lv/assets/bovada-logo.svg',
};

/**
 * Fallback: Generate placeholder image URL with brand name
 */
export function getPlaceholderLogoUrl(bookName: string): string {
  // Use UI Avatars API to generate text-based logo
  const cleanName = bookName.replace(/\s+/g, '+');
  return `https://ui-avatars.com/api/?name=${cleanName}&background=1C1C1E&color=FFFFFF&size=128&bold=true&format=svg`;
}

/**
 * Get logo URL for a sportsbook
 * Returns URL from map or generates placeholder
 */
export function getSportsbookLogoUrl(bookKey: string, bookName: string): string {
  const normalizedKey = bookKey.toLowerCase().replace(/[^a-z0-9]/g, '');
  return SPORTSBOOK_LOGO_URLS[normalizedKey] || getPlaceholderLogoUrl(bookName);
}

/**
 * Complete sportsbook configurations with priorities and metadata
 */
export const SPORTSBOOK_CONFIGS: SportsbookConfig[] = [
  // Daily Fantasy Sports (DFS) - Highest priority
  {
    key: 'prizepicks',
    name: 'PrizePicks',
    logoUrl: SPORTSBOOK_LOGO_URLS.prizepicks,
    type: 'dfs',
    priority: 1,
    deepLinkBase: 'https://app.prizepicks.com',
    isActive: true,
  },
  {
    key: 'underdog',
    name: 'Underdog Fantasy',
    logoUrl: SPORTSBOOK_LOGO_URLS.underdog,
    type: 'dfs',
    priority: 2,
    deepLinkBase: 'https://underdogfantasy.com',
    isActive: true,
  },
  {
    key: 'parlayplay',
    name: 'ParlayPlay',
    logoUrl: SPORTSBOOK_LOGO_URLS.parlayplay,
    type: 'dfs',
    priority: 3,
    deepLinkBase: 'https://www.parlayplay.io',
    isActive: true,
  },

  // Traditional Sportsbooks - Major Books
  {
    key: 'fanduel',
    name: 'FanDuel',
    logoUrl: SPORTSBOOK_LOGO_URLS.fanduel,
    type: 'traditional',
    priority: 4,
    deepLinkBase: 'https://sportsbook.fanduel.com',
    isActive: true,
  },
  {
    key: 'draftkings',
    name: 'DraftKings',
    logoUrl: SPORTSBOOK_LOGO_URLS.draftkings,
    type: 'traditional',
    priority: 5,
    deepLinkBase: 'https://sportsbook.draftkings.com',
    isActive: true,
  },
  {
    key: 'betmgm',
    name: 'BetMGM',
    logoUrl: SPORTSBOOK_LOGO_URLS.betmgm,
    type: 'traditional',
    priority: 6,
    deepLinkBase: 'https://sports.on.betmgm.ca',
    isActive: true,
  },
  {
    key: 'caesars',
    name: 'Caesars',
    logoUrl: SPORTSBOOK_LOGO_URLS.caesars,
    type: 'traditional',
    priority: 7,
    deepLinkBase: 'https://www.caesars.com/sportsbook',
    isActive: true,
  },
  {
    key: 'pointsbet',
    name: 'PointsBet',
    logoUrl: SPORTSBOOK_LOGO_URLS.pointsbet,
    type: 'traditional',
    priority: 8,
    deepLinkBase: 'https://www.pointsbet.com',
    isActive: true,
  },
  {
    key: 'bet365',
    name: 'Bet365',
    logoUrl: SPORTSBOOK_LOGO_URLS.bet365,
    type: 'traditional',
    priority: 9,
    deepLinkBase: 'https://www.bet365.com',
    isActive: true,
  },

  // Secondary Traditional Books
  {
    key: 'barstool',
    name: 'Barstool',
    logoUrl: SPORTSBOOK_LOGO_URLS.barstool,
    type: 'traditional',
    priority: 10,
    deepLinkBase: 'https://www.barstoolsportsbook.com',
    isActive: true,
  },
  {
    key: 'wynnbet',
    name: 'WynnBET',
    logoUrl: SPORTSBOOK_LOGO_URLS.wynnbet,
    type: 'traditional',
    priority: 11,
    deepLinkBase: 'https://www.wynnbet.com',
    isActive: true,
  },
  {
    key: 'unibet',
    name: 'Unibet',
    logoUrl: SPORTSBOOK_LOGO_URLS.unibet,
    type: 'traditional',
    priority: 12,
    deepLinkBase: 'https://www.unibet.com',
    isActive: true,
  },
  {
    key: 'betrivers',
    name: 'BetRivers',
    logoUrl: SPORTSBOOK_LOGO_URLS.betrivers,
    type: 'traditional',
    priority: 13,
    deepLinkBase: 'https://www.betrivers.com',
    isActive: true,
  },
];

/**
 * Get sportsbook config by key
 */
export function getSportsbookConfig(key: string): SportsbookConfig | undefined {
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  return SPORTSBOOK_CONFIGS.find(
    (config) => config.key === normalizedKey || config.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey
  );
}

/**
 * Get top N sportsbooks by priority
 */
export function getTopSportsbooks(count: number = 10): SportsbookConfig[] {
  return SPORTSBOOK_CONFIGS
    .filter((config) => config.isActive)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, count);
}

/**
 * Get sportsbooks by type (DFS or Traditional)
 */
export function getSportsbooksByType(type: 'dfs' | 'traditional'): SportsbookConfig[] {
  return SPORTSBOOK_CONFIGS
    .filter((config) => config.isActive && config.type === type)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get all active sportsbook keys for API calls
 */
export function getActiveSportsbookKeys(): string[] {
  return SPORTSBOOK_CONFIGS
    .filter((config) => config.isActive)
    .map((config) => config.key);
}

/**
 * Create deep link to sportsbook (if available)
 */
export function createSportsbookDeepLink(
  bookKey: string,
  sportType?: string,
  gameId?: string
): string | null {
  const config = getSportsbookConfig(bookKey);
  if (!config || !config.deepLinkBase) return null;

  // Basic deep link construction
  // Can be enhanced based on each book's URL structure
  let url = config.deepLinkBase;

  if (sportType) {
    url += `/${sportType.toLowerCase()}`;
  }

  if (gameId) {
    url += `/${gameId}`;
  }

  return url;
}
