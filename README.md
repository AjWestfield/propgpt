# 🎯 PropGPT - AI-Powered Player Props Analytics

PropGPT is a modern React Native Expo application that provides AI-powered analytics and predictions for sports player props across NBA, NFL, MLB, and NHL.

![PropGPT](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.76.5-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-52.0.31-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6.svg)

## ✨ Features

### 🏠 Home Screen
- **Sports Selector**: Filter props by NBA, NFL, MLB, NHL, or view all
- **Featured Props**: High-confidence picks (85%+)
- **Trending Section**: Players on hot streaks with upward momentum
- **Comprehensive Props List**: All available player props with detailed stats

### 💬 AI Chat Interface
- Natural language queries: "Show me NBA props tonight"
- Smart responses with prop recommendations
- Interactive suggestions for quick navigation
- Player-specific analysis with reasoning
- Mock AI implementation (ready for real AI integration)

### 📊 Analytics Dashboard
- **Overview Stats**: Total props, high confidence count, average confidence, trending count
- **Sport Breakdown**: Props distribution across all sports
- **Top Performers**: Highest confidence props ranked
- **Confidence Distribution**: Visual breakdown of prop confidence levels

### 👤 Profile Screen
- User stats tracking (picks made, win rate, ROI)
- Settings management (notifications, dark mode, favorites)
- Account options (subscription, privacy, terms)
- Support center and help resources

## 🎨 Design

### Dark Theme with Apple Liquid Glass Aesthetic
- **Charcoal black backgrounds** (#0A0A0A, #121212, #1C1C1E)
- **Pure white text** (#FFFFFF) with light gray accents (#E5E5E7, #AEAEB2)
- **Liquid glass blur effects** using expo-blur
- **Translucent layered UI** with depth and shadows
- **Smooth animations** with native driver for 60fps performance
- **High contrast** for excellent readability (21:1 ratio, WCAG AAA)

### Components
- **PropCard**: Comprehensive prop display with stats, confidence, trends
- **ConfidenceIndicator**: Visual confidence meter with color coding
- **Sport Badges**: Quick sport identification
- **Glassmorphic Buttons**: iOS-style frosted glass effect

## 🏗️ Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs)
- **Language**: TypeScript
- **UI**: expo-blur for glass effects
- **Icons**: Emoji-based (no icon library needed)
- **State**: React hooks (ready for Zustand/Context if needed)

## 📂 Project Structure

```
propgpt/
├── App.tsx                      # Main app entry with navigation
├── screens/
│   ├── HomeScreen.tsx          # Main props discovery screen
│   ├── ChatScreen.tsx          # AI conversational interface
│   ├── AnalyticsScreen.tsx     # Stats and data visualizations
│   └── ProfileScreen.tsx       # User profile and settings
├── components/
│   ├── PropCard.tsx            # Reusable prop display card
│   └── ConfidenceIndicator.tsx # Confidence visualization
├── navigation/
│   └── MainNavigator.tsx       # Bottom tab navigation
├── data/
│   └── mockProps.ts            # Mock player props data
└── utils/                      # Utility functions (future)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your mobile device (optional)

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd /Users/andersonwestfield/Desktop/propgpt
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Run the app**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app

## 📱 Screens Overview

### Home Screen
The main discovery screen featuring:
- Horizontal sports selector (ALL, NBA, NFL, MLB, NHL)
- Featured high-confidence props section
- Trending props with momentum indicators
- Complete props list with filtering

### Chat Screen
AI-powered conversational interface:
- Natural language prop queries
- Smart suggestion chips
- Player-specific deep dives
- Real-time prop recommendations

### Analytics Screen
Data visualization dashboard:
- Key metrics overview (4 stat cards)
- Sport-by-sport breakdown
- Top 5 confidence props ranked
- Confidence distribution chart

### Profile Screen
User management and settings:
- Profile stats (picks, win rate, ROI)
- App settings (notifications, dark mode)
- Account management
- Support and help center

## 🎯 Mock Data

The app includes comprehensive mock data for all sports:

- **12 player props** across NBA, NFL, MLB, NHL
- **Realistic projections** with confidence scores
- **Recent game history** (last 5 games)
- **Matchup analysis** with opponent stats
- **Reasoning** for each prediction

## 🔮 Future Enhancements

### Near-Term (MVP+)
- [ ] Real API integration for live props
- [ ] Actual AI/GPT integration for chat
- [ ] User authentication and profiles
- [ ] Saved props and favorites
- [ ] Push notifications for game times

### Mid-Term
- [ ] Advanced data visualizations (charts library)
- [ ] Historical prop tracking and ROI
- [ ] Social features (share picks)
- [ ] Multi-platform odds comparison
- [ ] Bankroll management tools

### Long-Term
- [ ] Machine learning predictions
- [ ] Video highlights integration
- [ ] Live game tracking
- [ ] Community leaderboards
- [ ] Premium subscription features

## 🎨 Color System

```typescript
// Backgrounds
Primary: '#0A0A0A'      // Deep charcoal
Secondary: '#121212'    // Dark gray
Tertiary: '#1C1C1E'     // Light charcoal

// Text
Primary: '#FFFFFF'      // Pure white
Secondary: '#E5E5E7'    // Light gray
Tertiary: '#AEAEB2'     // Medium gray
Disabled: '#6E6E73'     // Dark gray

// Confidence Colors
High: '#10B981'         // Green (85%+)
Medium: '#F59E0B'       // Yellow (70-84%)
Low: '#EF4444'          // Red (<70%)

// Accents
Over: '#10B981'         // Green for OVER picks
Under: '#EF4444'        // Red for UNDER picks
Trend Up: '#10B981'     // Green for upward trends
```

## 🏀 Sports Coverage

- **NBA**: Basketball player props (points, rebounds, assists, 3PM)
- **NFL**: Football player props (passing yards, TDs, receptions)
- **MLB**: Baseball player props (hits, total bases, strikeouts)
- **NHL**: Hockey player props (points, shots on goal)

## 📊 Confidence System

PropGPT uses a 3-tier confidence system:

- **🟢 HIGH (85-100%)**: Elite picks with strong historical data
- **🟡 MEDIUM (70-84%)**: Solid picks with good reasoning
- **🔴 LOW (0-69%)**: Riskier picks, proceed with caution

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

© 2025 PropGPT. All rights reserved.

## 🙏 Acknowledgments

- Built with React Native and Expo
- Design inspired by Apple's iOS Human Interface Guidelines
- Mock data created for demonstration purposes

---

**PropGPT v1.0.0** - Your AI-Powered Sports Props Assistant 🎯
