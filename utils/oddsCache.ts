/**
 * Odds API Cache Utility
 *
 * Implements intelligent caching for Odds-API.io to optimize quota usage.
 * Rate limit: 5,000 requests/hour
 *
 * Caching Strategy:
 * - Cache duration: 5 minutes (shorter due to better rate limits)
 * - Store in AsyncStorage for persistence
 * - Track API quota usage (hourly)
 * - Automatic cache expiration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
import type { OddsAPICacheEntry } from '../types/playerProp';
import type { Sport } from '../types/game';

const CACHE_PREFIX = '@odds_cache:';
const CACHE_METADATA_KEY = '@odds_cache:metadata';
const QUOTA_USAGE_KEY = '@odds_cache:quota';

export interface CacheMetadata {
  lastCleanup: number;
  totalCacheHits: number;
  totalCacheMisses: number;
  totalAPICalls: number;
}

export interface QuotaUsage {
  requestsUsed: number;
  requestsRemaining: number | null;
  lastUpdated: number;
  resetDate: number | null; // Hourly reset timestamp
}

/**
 * Generate cache key for a specific request
 */
function generateCacheKey(sport: Sport, marketType: string): string {
  return `${CACHE_PREFIX}${sport}_${marketType}`;
}

/**
 * Get cached data if valid, otherwise return null
 */
export async function getCachedOdds(
  sport: Sport,
  marketType: string = 'player_props'
): Promise<any | null> {
  try {
    const cacheKey = generateCacheKey(sport, marketType);
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      await incrementCacheMisses();
      return null;
    }

    const entry: OddsAPICacheEntry = JSON.parse(cached);

    // Check if cache is still valid
    if (Date.now() > entry.expiresAt) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(cacheKey);
      await incrementCacheMisses();
      return null;
    }

    await incrementCacheHits();
    console.log(`✅ Cache HIT for ${sport} ${marketType} (age: ${Math.round((Date.now() - entry.timestamp) / 1000)}s)`);
    return entry.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Store data in cache with expiration
 */
export async function setCachedOdds(
  sport: Sport,
  marketType: string,
  data: any,
  requestsRemaining: number | null = null
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(sport, marketType);
    const now = Date.now();

    const entry: OddsAPICacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + ENV.ODDS_API_IO_CACHE_DURATION,
      requestsRemaining,
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    console.log(`💾 Cached ${sport} ${marketType} (expires in ${ENV.ODDS_API_IO_CACHE_DURATION / 1000}s)`);

    // Update quota usage if provided
    if (requestsRemaining !== null) {
      await updateQuotaUsage(requestsRemaining);
    }
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

/**
 * Clear all cached odds data
 */
export async function clearAllOddsCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🗑️  Cleared ${cacheKeys.length} cache entries`);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Clear expired cache entries (automatic cleanup)
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_METADATA_KEY && key !== QUOTA_USAGE_KEY);

    let removedCount = 0;
    const now = Date.now();

    for (const key of cacheKeys) {
      try {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const entry: OddsAPICacheEntry = JSON.parse(cached);
          if (now > entry.expiresAt) {
            await AsyncStorage.removeItem(key);
            removedCount++;
          }
        }
      } catch (error) {
        // If parsing fails, remove the corrupted entry
        await AsyncStorage.removeItem(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired cache entries`);
    }

    // Update metadata
    await updateCacheMetadata({ lastCleanup: now });

    return removedCount;
  } catch (error) {
    console.error('Error during cache cleanup:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  metadata: CacheMetadata;
  quotaUsage: QuotaUsage | null;
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_METADATA_KEY && key !== QUOTA_USAGE_KEY);

    let validCount = 0;
    let expiredCount = 0;
    const now = Date.now();

    for (const key of cacheKeys) {
      try {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const entry: OddsAPICacheEntry = JSON.parse(cached);
          if (now > entry.expiresAt) {
            expiredCount++;
          } else {
            validCount++;
          }
        }
      } catch (error) {
        expiredCount++;
      }
    }

    const metadata = await getCacheMetadata();
    const quotaUsage = await getQuotaUsage();

    return {
      totalEntries: cacheKeys.length,
      validEntries: validCount,
      expiredEntries: expiredCount,
      metadata,
      quotaUsage,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalEntries: 0,
      validEntries: 0,
      expiredEntries: 0,
      metadata: {
        lastCleanup: 0,
        totalCacheHits: 0,
        totalCacheMisses: 0,
        totalAPICalls: 0,
      },
      quotaUsage: null,
    };
  }
}

// =============================================================================
// METADATA & QUOTA TRACKING
// =============================================================================

/**
 * Get cache metadata
 */
async function getCacheMetadata(): Promise<CacheMetadata> {
  try {
    const metadata = await AsyncStorage.getItem(CACHE_METADATA_KEY);
    if (metadata) {
      return JSON.parse(metadata);
    }
  } catch (error) {
    console.error('Error reading cache metadata:', error);
  }

  // Return default metadata
  return {
    lastCleanup: 0,
    totalCacheHits: 0,
    totalCacheMisses: 0,
    totalAPICalls: 0,
  };
}

/**
 * Update cache metadata
 */
async function updateCacheMetadata(updates: Partial<CacheMetadata>): Promise<void> {
  try {
    const current = await getCacheMetadata();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating cache metadata:', error);
  }
}

/**
 * Increment cache hits counter
 */
async function incrementCacheHits(): Promise<void> {
  const metadata = await getCacheMetadata();
  await updateCacheMetadata({ totalCacheHits: metadata.totalCacheHits + 1 });
}

/**
 * Increment cache misses counter
 */
async function incrementCacheMisses(): Promise<void> {
  const metadata = await getCacheMetadata();
  await updateCacheMetadata({ totalCacheMisses: metadata.totalCacheMisses + 1 });
}

/**
 * Get quota usage information
 */
export async function getQuotaUsage(): Promise<QuotaUsage | null> {
  try {
    const usage = await AsyncStorage.getItem(QUOTA_USAGE_KEY);
    if (usage) {
      return JSON.parse(usage);
    }
  } catch (error) {
    console.error('Error reading quota usage:', error);
  }
  return null;
}

/**
 * Update quota usage
 */
export async function updateQuotaUsage(requestsRemaining: number): Promise<void> {
  try {
    const current = await getQuotaUsage();
    const now = Date.now();

    // Calculate requests used
    const requestsUsed = current
      ? ENV.THE_ODDS_API_FREE_TIER_LIMIT - requestsRemaining
      : ENV.THE_ODDS_API_FREE_TIER_LIMIT - requestsRemaining;

    // Estimate reset date (monthly reset, assume 1st of next month)
    const resetDate = current?.resetDate || getNextMonthReset();

    const usage: QuotaUsage = {
      requestsUsed,
      requestsRemaining,
      lastUpdated: now,
      resetDate,
    };

    await AsyncStorage.setItem(QUOTA_USAGE_KEY, JSON.stringify(usage));

    // Log warning if quota is low
    if (requestsRemaining < 50) {
      console.warn(`⚠️  Low API quota: ${requestsRemaining} requests remaining`);
    }

    // Update metadata
    const metadata = await getCacheMetadata();
    await updateCacheMetadata({ totalAPICalls: metadata.totalAPICalls + 1 });
  } catch (error) {
    console.error('Error updating quota usage:', error);
  }
}

/**
 * Get timestamp for next monthly reset (1st of next month at midnight UTC)
 */
function getNextMonthReset(): number {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return nextMonth.getTime();
}

/**
 * Check if we should fetch fresh data or use cache
 */
export async function shouldFetchFreshOdds(
  sport: Sport,
  marketType: string,
  forceRefresh: boolean = false
): Promise<boolean> {
  // Always fetch if force refresh requested
  if (forceRefresh) {
    return true;
  }

  // Check if cached data exists and is valid
  const cached = await getCachedOdds(sport, marketType);
  if (cached) {
    return false; // Use cached data
  }

  // Check quota before fetching
  const quota = await getQuotaUsage();
  if (quota && quota.requestsRemaining !== null && quota.requestsRemaining < 10) {
    console.warn(`⚠️  Very low quota (${quota.requestsRemaining} requests), consider using cached data only`);
    // Still allow fetch, but warn user
  }

  return true; // Fetch fresh data
}

/**
 * Reset quota usage (for testing or after monthly reset)
 */
export async function resetQuotaUsage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUOTA_USAGE_KEY);
    console.log('✅ Quota usage reset');
  } catch (error) {
    console.error('Error resetting quota usage:', error);
  }
}
