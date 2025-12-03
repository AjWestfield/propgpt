/**
 * Environment Configuration
 *
 * Provides centralized access to environment variables.
 *
 * NOTE: In React Native/Expo, environment variables are accessed at build time.
 * For runtime configuration, consider using expo-constants or a similar solution.
 */

export const ENV = {
  // Odds-API.io Configuration
  ODDS_API_IO_KEY: '51aa7e0beef9c30b647419f26f369865d5b076983d25da219f71ecd82d38e3bc',

  // API Base URLs
  ODDS_API_IO_BASE_URL: 'https://api.odds-api.io/v3',

  // Rate Limiting
  ODDS_API_IO_RATE_LIMIT: 5000, // requests per hour
  ODDS_API_IO_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds (shorter due to better rate limits)
};

/**
 * Validates that required environment variables are set
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  // Check for API key (only warn, don't fail - allows using ESPN-only mode)
  if (!ENV.ODDS_API_IO_KEY) {
    console.warn('⚠️  ODDS_API_IO_KEY not set. Odds-API.io features will be disabled.');
    console.warn('   Visit https://odds-api.io to get your API key.');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
