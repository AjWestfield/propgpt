# How to Access Bar Charts in PropGPT 📊

## Navigation Flow

```
HomeScreen (Picks Tab)
    ↓ (Tap PlayerCard)
PlayerPropsModal
    ↓ (Tap any prop)
PlayerDetailScreen ← 🎯 FULL 10-GAME BAR CHART HERE!
```

## Step-by-Step Guide

### 1. Open the App
- Launch PropGPT
- You'll land on the **HomeScreen** (Picks tab)

### 2. Select a Player
- Scroll through the list of NBA players
- **Tap any PlayerCard** to open the props modal

### 3. View Player Props Modal
- Modal slides up showing all props for that player
- Each prop displays:
  - Line, Projection, Confidence
  - Last 5 game results
  - Over/Under recommendation

### 4. Access Full Chart Analysis
- **Tap any prop card** in the modal
- OR tap the **"View Full Analysis →"** button
- Modal closes and navigates to **PlayerDetailScreen**

### 5. PlayerDetailScreen - Bar Charts! 📈
You'll see:
- ✅ **Vertical bar chart** with last 10 games
- ✅ **Color-coded bars**:
  - 🟢 Green = Above the line (OVER)
  - 🔴 Red = Below the line (UNDER)
  - 🟡 Yellow = At the line
- ✅ **Dotted threshold line** showing the betting line
- ✅ Hit rate percentage
- ✅ Last 5 average vs Season average
- ✅ Trend indicators (↑ up, → stable, ↓ down)
- ✅ Full stats breakdown
- ✅ Pull-to-refresh for latest data

## Alternative: AnalyticsScreen

### Quick Access to Charts
1. Tap **"Tools"** tab in bottom navigation
2. See featured player with real-time bar chart
3. Tap **"Next Player"** to cycle through different players
4. Charts show last 10 games with color-coded performance

## Chart Features

### Real NBA Data
- Powered by BallDontLie NBA API
- Shows actual game statistics from last 10 games
- Automatically maps prop types (Points→pts, Rebounds→reb, etc.)
- 5-minute caching for performance

### Design Standards
- Matches industry-standard sports betting apps
- Dark theme with glassmorphism effects
- Professional color scheme:
  - Primary green: #10B981 (success/over)
  - Primary red: #EF4444 (under)
  - Warning yellow: #F59E0B (at line)
  - Accent blue: #007AFF (highlights)

### Interactive Elements
- Tap bars to see exact values
- Horizontal scroll for all 10 games
- Smooth spring animations
- Pull-to-refresh for latest data

## Troubleshooting

### "No charts visible"
✅ **Solution**: Make sure you:
1. Tapped a PlayerCard to open the modal
2. Tapped a prop within the modal
3. Waited for navigation to PlayerDetailScreen

### "Loading chart data..."
✅ **Solution**: 
- First load fetches real NBA data (may take 1-2 seconds)
- Check internet connection
- Data is cached for 5 minutes after first load

### "Player data not found"
✅ **Solution**:
- Pull down to refresh on PlayerDetailScreen
- Some players may not have recent game data
- Try selecting a different player/prop

## Chart Access Points Summary

| Location | Chart Type | Games Shown | Access Method |
|----------|-----------|-------------|---------------|
| **PlayerDetailScreen** | Full vertical bar chart | 10 games | Tap PlayerCard → Tap prop in modal |
| **AnalyticsScreen** | Featured player chart | 10 games | Tap "Tools" tab |
| **PropCard** (Coming Soon) | Mini chart | 5 games | Tap "View Trend" button |

---

**Ready to explore!** 🚀

All bar charts are live and accessible through the navigation flow above.
