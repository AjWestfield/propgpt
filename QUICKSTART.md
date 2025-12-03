# 🚀 PropGPT - Quick Start Guide

Get up and running with PropGPT in minutes!

## Prerequisites

- **Node.js 18+** installed
- **Expo CLI** (optional but recommended)
- **iOS Simulator** (Mac only) or **Android Emulator**
- **Expo Go app** on your phone (optional)

## Installation

```bash
# Navigate to project
cd /Users/andersonwestfield/Desktop/propgpt

# Dependencies are already installed!
# If you need to reinstall:
npm install
```

## Run the App

### Option 1: Start Development Server

```bash
npx expo start
```

Then choose your platform:
- Press **`i`** for iOS Simulator
- Press **`a`** for Android Emulator
- Press **`w`** for Web Browser
- Scan QR code with **Expo Go** app

### Option 2: Direct Platform Launch

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android

# Web
npx expo start --web
```

## What You'll See

### 🏠 Home Tab
- Sports selector at top (ALL, NBA, NFL, MLB, NHL)
- Featured props (85%+ confidence)
- Trending props (upward momentum)
- All available props with stats

### 💬 Chat Tab
- AI conversational interface
- Try: "Show me NBA props tonight"
- Tap suggestion chips for quick queries
- Get player-specific analysis

### 📊 Analytics Tab
- Overview stats dashboard
- Sport-by-sport breakdown
- Top 5 highest confidence props
- Confidence distribution chart

### 👤 Profile Tab
- User stats (coming soon)
- App settings
- Account management
- Support center

## Features to Explore

1. **Filter by Sport**: Tap NBA, NFL, MLB, or NHL buttons
2. **Check Confidence**: Green (85%+), Yellow (70-84%), Red (<70%)
3. **View Recent Form**: Last 5 games shown for each prop
4. **Ask the AI**: Natural language queries in Chat tab
5. **Track Trends**: Look for 📈 indicators

## Mock Data Included

The app comes with **12 player props**:
- LeBron James, Stephen Curry, Anthony Davis (NBA)
- Patrick Mahomes, Travis Kelce, Josh Allen (NFL)
- Aaron Judge, Shohei Ohtani, Gerrit Cole (MLB)
- Connor McDavid, Auston Matthews (NHL)

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npx expo start -c
```

### Navigation Not Working
- Make sure React Navigation is installed
- Check console for errors
- Try clearing cache

### Blur Effects Not Showing
- Works best on native (iOS/Android)
- Web has fallback styles
- Emulator may have limited support

### TypeScript Errors
```bash
# Rebuild TypeScript
npm run tsc
```

## Next Steps

1. ✅ **Explore all 4 tabs** to see the full app
2. ✅ **Try the AI chat** with different queries
3. ✅ **Filter props** by different sports
4. ✅ **Check the analytics** dashboard

## Ready for Production

To prepare for production:

1. **Add Real API**: Replace mockProps.ts with live data
2. **Integrate AI**: Connect real GPT/Claude API to chat
3. **Add Auth**: Implement user authentication
4. **Enable Persistence**: Add local storage for favorites
5. **Push Notifications**: Set up game time alerts

## Need Help?

- Check the main **README.md** for full documentation
- Review **package.json** for all dependencies
- Inspect **App.tsx** for navigation structure
- Look at **data/mockProps.ts** for data format

---

**PropGPT v1.0.0** - Happy prop hunting! 🎯
