# The Odds API Integration Guide

## Overview

PropGPT now integrates with **The Odds API** to provide real-time sportsbook-specific odds from 40+ bookmakers including:

- ✅ **FanDuel**
- ✅ **DraftKings**
- ✅ **BetMGM**
- ✅ **Caesars**
- ✅ **PointsBet**
- And 35+ more sportsbooks

This integration uses a **hybrid approach**:
1. **ESPN Consensus Odds** - Always available, no limits
2. **The Odds API** - Sportsbook-specific odds with intelligent caching

---

## 🚀 Quick Start

### 1. Sign Up for The Odds API

1. Visit [https://the-odds-api.com](https://the-odds-api.com)
2. Click "Get API Key"
3. Sign up for the **FREE tier** (500 requests/month)
4. Copy your API key

### 2. Configure Your API Key

Add your API key to the `.env` file in the project root:

```bash
# .env
THE_ODDS_API_KEY=your_actual_api_key_here
```

**⚠️ IMPORTANT:** Never commit your `.env` file to git! It's already in `.gitignore`.

### 3. Restart the App

```bash
# Stop the dev server if running, then:
npm start
```

That's it! The app will now fetch real sportsbook odds automatically.

---

## 📊 How It Works

### Hybrid Odds System

```
User opens game details
        ↓
┌───────────────────────────┐
│   OddsAPI.getGameOdds()   │
└───────────┬───────────────┘
            │
     ┌──────┴──────┐
     ↓             ↓
┌─────────┐   ┌──────────────┐
│  ESPN   │   │ The Odds API │
│  Odds   │   │ (Cached 10min)│
└────┬────┘   └──────┬───────┘
     │              │
     └──────┬───────┘
            ↓
    ┌──────────────────┐
    │ Combined Results │
    │ - ESPN Consensus │
    │ - FanDuel        │
    │ - DraftKings     │
    │ - BetMGM         │
    │ - etc.           │
    └──────────────────┘
```

### Intelligent Caching

To stay within the free tier (500 requests/month ≈ 16 requests/day), we use aggressive caching:

- **Cache Duration**: 10 minutes
- **Cache Storage**: AsyncStorage (persists across app restarts)
- **Cache Key**: `sport_market_type` (e.g., `NBA_player_props`)
- **Quota Tracking**: Monitors remaining requests and warns at low levels

#### Cache Flow:

```typescript
// Example: User opens NBA game
OddsAPI.getGameOdds('game123', 'NBA')
  ↓
Check cache for 'NBA_game_odds'
  ↓
If cached & valid (< 10 min old)
  → Return cached data (no API call)
  ✅ Quota preserved!

If expired or missing
  → Fetch from The Odds API
  → Cache for 10 minutes
  → Use 1 API request
```

---

## 🔧 API Configuration

### Environment Variables

All configuration is in `/config/env.ts`:

```typescript
export const ENV = {
  THE_ODDS_API_KEY: process.env.THE_ODDS_API_KEY || '',
  THE_ODDS_API_BASE_URL: 'https://api.the-odds-api.com/v4',
  THE_ODDS_API_FREE_TIER_LIMIT: 500, // requests per month
  THE_ODDS_API_CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
};
```

### Supported Sports

| Sport | The Odds API Key | PropGPT Support |
|-------|------------------|-----------------|
| NBA | `basketball_nba` | ✅ |
| NFL | `americanfootball_nfl` | ✅ |
| MLB | `baseball_mlb` | ✅ |
| NHL | `icehockey_nhl` | ✅ |
| NCAAF | `americanfootball_ncaaf` | ✅ |
| NCAAB | `basketball_ncaab` | ✅ |

---

## 📖 Usage Examples

### Fetch Game Odds

```typescript
import { OddsAPI } from './services/oddsApi';

// Get odds for a specific game
const odds = await OddsAPI.getGameOdds('401584875', 'NBA');

console.log(odds);
// {
//   gameId: '401584875',
//   sportsbooks: [
//     {
//       name: 'ESPN Consensus',
//       spread: { home: 'LAL -5.5', away: 'GSW +5.5' },
//       moneyline: { home: '-200', away: '+170' },
//       total: { over: '-110', under: '-110', line: '225.5' }
//     },
//     {
//       name: 'FanDuel',
//       spread: { home: 'LAL -5.0 (-110)', away: 'GSW +5.0 (-110)' },
//       moneyline: { home: '-195', away: '+165' },
//       total: { over: '-112', under: '-108', line: '226.0' }
//     },
//     {
//       name: 'DraftKings',
//       spread: { home: 'LAL -5.5 (-108)', away: 'GSW +5.5 (-112)' },
//       moneyline: { home: '-200', away: '+170' },
//       total: { over: '-110', under: '-110', line: '225.5' }
//     }
//   ],
//   lastUpdated: 1738267200000
// }
```

### Fetch Player Props

```typescript
import { TheOddsAPI } from './services/theOddsApi';

// Get NBA player props
const props = await TheOddsAPI.getPlayerProps('NBA');

console.log(props);
// [
//   {
//     id: 'event123',
//     sport_key: 'basketball_nba',
//     home_team: 'Los Angeles Lakers',
//     away_team: 'Golden State Warriors',
//     bookmakers: [
//       {
//         key: 'fanduel',
//         title: 'FanDuel',
//         markets: [
//           {
//             key: 'player_points',
//             outcomes: [
//               {
//                 name: 'LeBron James',
//                 description: 'Over',
//                 price: -110,
//                 point: 27.5
//               },
//               // ... more outcomes
//             ]
//           }
//         ]
//       }
//     ]
//   }
// ]
```

### Check Quota Usage

```typescript
import { TheOddsAPI } from './services/theOddsApi';
import { getQuotaUsage, getCacheStats } from './utils/oddsCache';

// Check remaining API requests
const remaining = TheOddsAPI.getRemainingRequests();
console.log(`Requests remaining: ${remaining}/500`);

// Get detailed quota info
const quota = await getQuotaUsage();
console.log(quota);
// {
//   requestsUsed: 145,
//   requestsRemaining: 355,
//   lastUpdated: 1738267200000,
//   resetDate: 1741046400000 // Next month
// }

// Get cache statistics
const stats = await getCacheStats();
console.log(stats);
// {
//   totalEntries: 12,
//   validEntries: 10,
//   expiredEntries: 2,
//   metadata: {
//     totalCacheHits: 245,
//     totalCacheMisses: 45,
//     totalAPICalls: 45
//   }
// }
```

---

## 🎯 Best Practices

### 1. **Minimize API Calls**

❌ **Bad** - Fetches odds on every screen render:
```typescript
useEffect(() => {
  // This runs on EVERY render!
  fetchOdds();
}, []);
```

✅ **Good** - Uses caching and only fetches when needed:
```typescript
// The OddsAPI service handles caching automatically
const odds = await OddsAPI.getGameOdds(gameId, sport);
```

### 2. **Use Batch Requests**

❌ **Bad** - Multiple sequential API calls:
```typescript
for (const game of games) {
  await OddsAPI.getGameOdds(game.id, game.sport); // 10 games = 10 API calls
}
```

✅ **Good** - Single batch request:
```typescript
const oddsMap = await OddsAPI.getBatchGameOdds(games); // 1 API call for all games
```

### 3. **Handle Quota Limits Gracefully**

```typescript
try {
  const odds = await OddsAPI.getGameOdds(gameId, sport);
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    // Show user-friendly message
    Alert.alert(
      'Daily Limit Reached',
      'We\'ve reached our daily odds limit. Showing ESPN consensus odds instead.'
    );
  }
}
```

### 4. **Force Refresh Only When Necessary**

```typescript
// Normal fetch (uses cache if available)
const odds = await OddsAPI.getGameOdds(gameId, sport);

// Force fresh fetch (bypasses cache, uses API quota)
const freshOdds = await OddsAPI.getGameOdds(gameId, sport, undefined, true);
```

---

## 🐛 Troubleshooting

### Issue: "The Odds API not configured"

**Solution:** Make sure your API key is set in `.env`:

```bash
# .env
THE_ODDS_API_KEY=your_api_key_here
```

Then restart the app.

---

### Issue: "Rate limit exceeded"

**Cause:** You've used all 500 free requests for the month.

**Solutions:**
1. Wait until next month (resets on 1st)
2. Upgrade to paid tier ($35/month for 20,000 requests)
3. App will fallback to ESPN consensus odds automatically

---

### Issue: Odds seem outdated

**Cause:** Cache might be returning old data.

**Solutions:**
1. Wait 10 minutes for cache to expire
2. Clear cache manually:
   ```typescript
   import { clearAllOddsCache } from './utils/oddsCache';
   await clearAllOddsCache();
   ```
3. Force refresh:
   ```typescript
   await OddsAPI.getGameOdds(gameId, sport, undefined, true);
   ```

---

### Issue: No sportsbook odds showing (only ESPN)

**Possible causes:**
1. API key not configured
2. Quota exhausted
3. The Odds API is down (rare)
4. Network connectivity issues

**Check:**
```typescript
import { TheOddsAPI } from './services/theOddsApi';

// Check if API is configured
if (!TheOddsAPI.isConfigured()) {
  console.log('❌ API key not set');
}

// Check remaining quota
const remaining = TheOddsAPI.getRemainingRequests();
if (remaining !== null && remaining === 0) {
  console.log('❌ Quota exhausted');
}
```

---

## 📈 Monitoring & Analytics

### View Cache Performance

```typescript
import { getCacheStats } from './utils/oddsCache';

const stats = await getCacheStats();

const hitRate = (stats.metadata.totalCacheHits /
  (stats.metadata.totalCacheHits + stats.metadata.totalCacheMisses)) * 100;

console.log(`Cache hit rate: ${hitRate.toFixed(1)}%`);
// Target: > 80% hit rate

const apiSavings = stats.metadata.totalCacheHits;
console.log(`API calls saved by caching: ${apiSavings}`);
```

### Monitor Quota Usage

Add to your app's debug panel:

```typescript
const quota = await getQuotaUsage();
const percentUsed = (quota.requestsUsed / 500) * 100;

if (percentUsed > 80) {
  console.warn(`⚠️  ${percentUsed}% of monthly quota used`);
}
```

---

## 🚀 Upgrade to Paid Tier

When your app grows and needs more than 500 requests/month:

### Paid Plans

| Plan | Requests/Month | Price | Best For |
|------|----------------|-------|----------|
| Free | 500 | $0 | Testing, prototyping |
| Starter | 20,000 | $35/mo | Small apps (< 1000 DAU) |
| Professional | 100,000 | $150/mo | Growing apps |
| Enterprise | Custom | Custom | Large scale |

### How to Upgrade

1. Visit [https://the-odds-api.com/pricing](https://the-odds-api.com/pricing)
2. Choose a plan
3. No code changes needed - just use the same API key!

---

## 🔐 Security Best Practices

### 1. **Never Commit API Keys**

✅ **Good:**
```bash
# .env (in .gitignore)
THE_ODDS_API_KEY=sk_abc123...
```

❌ **Bad:**
```typescript
// config.ts (committed to git)
export const API_KEY = 'sk_abc123...'; // ❌ NEVER DO THIS
```

### 2. **Use Environment Variables**

Always access keys via environment:

```typescript
import { ENV } from '../config/env';

const apiKey = ENV.THE_ODDS_API_KEY; // ✅ Good
```

### 3. **Rotate Keys Regularly**

If your key is ever exposed:
1. Generate new key at https://the-odds-api.com/account
2. Update `.env`
3. Restart app

---

## 📚 Additional Resources

- **The Odds API Docs**: https://the-odds-api.com/liveapi/guides/v4/
- **Supported Bookmakers**: https://the-odds-api.com/sports-odds-data/bookmaker-apis.html
- **API Status**: https://status.the-odds-api.com
- **Pricing**: https://the-odds-api.com/pricing

---

## 🤝 Support

Need help? Check these resources:

1. **PropGPT Issues**: [Open an issue](https://github.com/yourrepo/propgpt/issues)
2. **The Odds API Support**: support@the-odds-api.com
3. **Documentation**: Read this guide thoroughly

---

## 📝 Changelog

### v1.0.0 (2025-01-21)
- ✅ Initial integration with The Odds API
- ✅ Intelligent caching system (10-minute TTL)
- ✅ Quota tracking and monitoring
- ✅ Hybrid approach (ESPN + sportsbook-specific odds)
- ✅ Support for NBA, NFL, MLB, NHL, NCAAF, NCAAB
- ✅ Graceful fallback to ESPN odds

---

**🎉 You're all set! Your PropGPT app now has real sportsbook odds from FanDuel, DraftKings, and more!**
