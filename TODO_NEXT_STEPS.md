# Next Steps: Get The Odds API Running

## ✅ Integration Complete!

All the code is implemented. Now you just need to configure your API key and test it.

---

## 🎯 Your To-Do List

### 1. Sign Up for The Odds API (5 minutes)

- [ ] Go to **https://the-odds-api.com**
- [ ] Click **"Get API Key"** or **"Sign Up"**
- [ ] Create account (email + password)
- [ ] Verify email if required
- [ ] Copy your API key (long string like: `1a2b3c4d5e6f...`)

**Your API Key:** `_________________________` (paste here for reference)

---

### 2. Configure Your Project (2 minutes)

- [ ] Open `/Users/andersonwestfield/Desktop/propgpt/.env`
- [ ] Find this line:
  ```bash
  THE_ODDS_API_KEY=
  ```
- [ ] Paste your API key:
  ```bash
  THE_ODDS_API_KEY=1a2b3c4d5e6f...
  ```
- [ ] Save the file

---

### 3. Restart Your App (1 minute)

- [ ] Stop the dev server (Ctrl+C)
- [ ] Start it again:
  ```bash
  npm start
  ```
- [ ] Wait for app to load

---

### 4. Test It Works (5 minutes)

Open your app and test:

#### Test 1: Check Console Logs
- [ ] Open Console/Terminal where app is running
- [ ] Look for messages like:
  ```
  ℹ️  The Odds API not configured, using ESPN odds only
  ```
  OR (if key is set):
  ```
  📡 Fetching fresh odds for NBA from The Odds API...
  💾 Cached NBA game_odds (expires in 600s)
  ```

#### Test 2: View a Game
- [ ] Navigate to a game (NBA, NFL, MLB, or NHL)
- [ ] Check if you see odds displayed
- [ ] If API key is working, you should see:
  - ESPN Consensus odds (always there)
  - FanDuel odds (from The Odds API)
  - DraftKings odds (from The Odds API)
  - BetMGM odds (from The Odds API)

#### Test 3: Check Cache
- [ ] View the same game again (close and reopen)
- [ ] Console should show:
  ```
  ✅ Cache HIT for NBA game_odds (age: 45s)
  ```
- [ ] This means caching is working (saves API quota!)

#### Test 4: Check Quota
- [ ] In your code, add this temporarily:
  ```typescript
  import { TheOddsAPI } from './services/theOddsApi';
  console.log('Remaining requests:', TheOddsAPI.getRemainingRequests());
  ```
- [ ] Should see: `Remaining requests: 499` (or similar)

---

### 5. Troubleshooting (if needed)

#### Problem: "The Odds API not configured"
**Solution:**
- [ ] Check `.env` file has API key
- [ ] Make sure there's no space after `THE_ODDS_API_KEY=`
- [ ] Restart app completely

#### Problem: "Invalid API key" error
**Solution:**
- [ ] Double-check you copied the entire API key
- [ ] Make sure key doesn't have extra spaces
- [ ] Try generating a new key at https://the-odds-api.com

#### Problem: No sportsbook odds showing
**Possible causes:**
- [ ] API key not set correctly
- [ ] Network connectivity issue
- [ ] The Odds API is down (check https://status.the-odds-api.com)
- [ ] You've used all 500 free requests (check console for "Rate limit exceeded")

**Check:**
```typescript
import { TheOddsAPI } from './services/theOddsApi';

if (!TheOddsAPI.isConfigured()) {
  console.log('❌ API key not configured');
} else {
  console.log('✅ API key is set');
}
```

---

## 📊 Monitor Your Usage

### Check Quota Regularly

Add this to a debug panel in your app:

```typescript
import { getQuotaUsage } from './utils/oddsCache';

const quota = await getQuotaUsage();
console.log(`Used: ${quota.requestsUsed}/500`);
console.log(`Remaining: ${quota.requestsRemaining}`);
```

### Free Tier Allowance
- **Total:** 500 requests/month
- **Daily:** ~16 requests/day
- **Per Request:** Odds for one sport

### How Long Will 500 Requests Last?

With our 10-minute caching:
```
1 user checks NBA games 10 times/day:
- Without caching: 10 requests/day = 300/month (per user)
- With caching: 1-2 requests/day = 30-60/month (per user)

Free tier supports: ~8-15 active users
```

---

## 🎉 Success Criteria

You'll know it's working when you see:

✅ Console shows "Fetching fresh odds from The Odds API"
✅ Multiple sportsbooks displayed in your app
✅ Cache messages appear on subsequent views
✅ Quota tracking shows remaining requests

---

## 📚 Documentation

### Quick Reference
- **Setup Guide:** `/SETUP_ODDS_API.md`
- **Full Documentation:** `/docs/THE_ODDS_API_INTEGRATION.md`
- **Implementation Summary:** `/INTEGRATION_SUMMARY.md`

### The Odds API Resources
- **Dashboard:** https://the-odds-api.com/account
- **Documentation:** https://the-odds-api.com/liveapi/guides/v4/
- **Supported Sports:** https://the-odds-api.com/sports-odds-data/sports-apis.html
- **Pricing (if you need more):** https://the-odds-api.com/pricing

---

## 🚀 After Testing

Once everything works:

### Update Your Team
- [ ] Share setup instructions (`SETUP_ODDS_API.md`)
- [ ] Add API key to team's shared secrets (securely)
- [ ] Document any app-specific configuration

### Deploy
- [ ] Add API key to production environment
- [ ] Test in production
- [ ] Monitor quota usage
- [ ] Set up alerts for low quota

### Plan for Growth
- [ ] Monitor monthly usage
- [ ] If approaching 500 requests, consider:
  - Optimizing cache duration (increase to 15-20 minutes)
  - Upgrading to Starter tier ($35/month for 20,000 requests)
  - Implementing lazy loading (only fetch on demand)

---

## 💡 Pro Tips

### Tip 1: Maximize Free Tier
```typescript
// Increase cache duration if quota is tight
// In config/env.ts:
THE_ODDS_API_CACHE_DURATION: 15 * 60 * 1000, // 15 minutes instead of 10
```

### Tip 2: Lazy Load Odds
```typescript
// Only fetch when user explicitly views game details
// Don't fetch for all games on feed screen
```

### Tip 3: Monitor Closely at First
```typescript
// First week: check quota daily
// Make sure caching is working well
// Adjust cache duration if needed
```

---

## ✅ Completion Checklist

Mark these off as you go:

- [ ] ✅ Signed up for The Odds API
- [ ] ✅ API key added to `.env`
- [ ] ✅ App restarted
- [ ] ✅ Console shows API integration working
- [ ] ✅ Sportsbook odds displaying in app
- [ ] ✅ Cache working (confirmed in console)
- [ ] ✅ Quota tracking visible
- [ ] ✅ Tested with NBA games
- [ ] ✅ Tested with NFL games
- [ ] ✅ Tested with MLB games (if in season)
- [ ] ✅ Tested with NHL games (if in season)
- [ ] ✅ Verified graceful fallback (ESPN odds work when API disabled)
- [ ] ✅ Documented any issues or questions
- [ ] ✅ Ready for production!

---

**🎉 You're all set! Enjoy your real sportsbook odds integration!**

*Last Updated: 2025-01-21*
