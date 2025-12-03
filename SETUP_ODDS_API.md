# Quick Setup: Odds-API.io Integration

## ⚡ Already Configured!

**Your PropGPT app is already set up with Odds-API.io!** 🎉

The API key is already configured in your `.env` file. Just restart the app and you're good to go!

### Quick Start

```bash
npm start
```

## ✅ You Now Have Access To:

- ✅ **250+ sportsbooks** (FanDuel, DraftKings, BetMGM, Caesars, and more)
- ✅ **5,000 requests/hour** (vs 500/month with The Odds API)
- ✅ **Low latency** (<150ms response times)
- ✅ **All major sports** (NBA, NFL, MLB, NHL)
- ✅ **Player props** support
- ✅ **Batch requests** (up to 10 events at once)
- ✅ **WebSocket support** (for real-time updates)

## 🎯 What You Get

**Rate Limit:**
- 5,000 requests/hour (~120,000 per day)
- Hourly reset (much better than monthly)
- No credit card required

**Features:**
- Real-time odds updates
- 250+ bookmakers supported
- Player props for all major sports
- Batch API requests

## 📊 How to Use

The integration works automatically! Just open any game in your app and you'll see:

1. **ESPN Consensus Odds** (always available)
2. **FanDuel Odds** (from The Odds API)
3. **DraftKings Odds** (from The Odds API)
4. **BetMGM Odds** (from The Odds API)
5. And more...

## 🔧 Verify It's Working

Open the app and check the console logs:

```
✅ Cache HIT for NBA game_odds (age: 45s)
📡 Fetching fresh odds for NBA from Odds-API.io...
💾 Cached NBA game_odds (expires in 300s)
Remaining requests: 4998/5000
```

If you see these logs, it's working! 🎉

## 🆘 Troubleshooting

**Not seeing sportsbook odds?**

1. Check your `.env` file:
   ```bash
   ODDS_API_IO_KEY=51aa7e0beef9c30b647419f26f369865d5b076983d25da219f71ecd82d38e3bc
   ```
2. Restart the dev server (`npm start`)
3. Check console for errors

**"Rate limit exceeded" error?**

You've used all 5,000 requests this hour (very unlikely with caching!). Options:
- Wait for hourly reset (resets every hour on the hour)
- App will automatically fallback to ESPN odds
- With 5-min caching, this should rarely happen

## 📖 Full Documentation

See `ODDS_API_IO_MIGRATION_COMPLETE.md` for complete guide.

---

**Questions?** Check the full docs or open an issue!
