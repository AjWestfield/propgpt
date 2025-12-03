# Quick Start Guide

Get your PropGPT app running in 3 easy steps!

## Step 1: Install Dependencies

```bash
cd /Users/andersonwestfield/Desktop/propgpt
npm install
```

This will install all required packages including `expo-blur` for the glass effects.

## Step 2: Start the Development Server

```bash
npm start
```

or

```bash
npx expo start
```

You'll see a QR code in the terminal.

## Step 3: Run on Your Device

### Option A: iOS Simulator (Mac only)
Press `i` in the terminal, or run:
```bash
npm run ios
```

### Option B: Android Emulator
Press `a` in the terminal, or run:
```bash
npm run android
```

### Option C: Physical Device (Recommended for best glass effects)
1. Download **Expo Go** from App Store (iOS) or Play Store (Android)
2. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Option D: Web Browser (Limited blur support)
Press `w` in the terminal, or run:
```bash
npm run web
```

**Note**: Blur effects work best on iOS and Android. Web uses opacity fallback.

---

## What You'll See

A beautiful PropGPT home screen with:
- White/light gray background
- Frosted glass logo at the top
- 4 feature cards with glass effect:
  - Smart Search
  - Market Insights
  - Virtual Tours
  - AI Assistant
- Smooth fade-in and slide-up animations
- Apple-style design language

---

## Troubleshooting

### Metro bundler won't start
```bash
npx expo start -c
```
The `-c` flag clears the cache.

### Blur effects not showing
1. Make sure you're testing on a device (not web)
2. Try clearing cache: `npx expo start -c`
3. Restart the app completely

### iOS Simulator not opening
Make sure you have Xcode installed and iOS Simulator set up.

### Android Emulator not opening
Make sure you have Android Studio installed with an AVD (Android Virtual Device) configured.

---

## Next Steps

### Read the Documentation
- **README.md** - Main project overview
- **DESIGN_SYSTEM.md** - Complete design reference
- **USAGE_GUIDE.md** - Customization guide
- **EXAMPLES.md** - Reusable components
- **BEFORE_AFTER.md** - See what changed

### Customize the Design
1. Open `/Users/andersonwestfield/Desktop/propgpt/App.tsx`
2. Modify colors, blur intensity, or text
3. Save and see changes instantly (hot reload)

### Common Customizations

**Change blur intensity:**
```tsx
<BlurView intensity={60} tint="light">
// Try: 40 (lighter), 60 (medium), 80 (heavier)
```

**Change background color:**
```tsx
backgroundColor: '#FAFAFA'
// Try: '#FFFFFF' (pure white), '#F5F5F7' (light gray)
```

**Change text color:**
```tsx
color: '#000000'  // Black
color: '#6E6E73'  // Gray
color: '#86868B'  // Light gray
```

**Adjust animation speed:**
```tsx
duration: 800  // milliseconds
// Try: 600 (faster), 1000 (slower)
```

---

## Tips for Best Experience

1. Test on a physical device for best glass effects
2. iOS has the most polished blur effects
3. Use light mode for best visibility
4. Clear cache if you see any issues
5. Hot reload is enabled - just save files to see changes

---

## File Structure

```
propgpt/
├── App.tsx                 # Main app (edit this for customizations)
├── app.json               # Expo config
├── package.json           # Dependencies
├── README.md              # Project overview
├── DESIGN_SYSTEM.md       # Design reference
├── USAGE_GUIDE.md         # Customization guide
├── EXAMPLES.md            # Code examples
├── CHANGELOG.md           # Version history
├── BEFORE_AFTER.md        # Design comparison
├── SUMMARY.txt            # Quick reference
└── QUICK_START.md         # This file
```

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm start` | Start dev server |
| `npm run ios` | Open in iOS Simulator |
| `npm run android` | Open in Android Emulator |
| `npm run web` | Open in web browser |
| `npx expo start -c` | Clear cache and start |

---

## Support

If you encounter issues:

1. **Clear cache**: `npx expo start -c`
2. **Reinstall**: `rm -rf node_modules && npm install`
3. **Check Expo Go version**: Update to latest version
4. **Read troubleshooting**: See USAGE_GUIDE.md

---

## Design Credits

This design implements:
- Apple's liquid glass aesthetic
- iOS Human Interface Guidelines
- Native blur effects via expo-blur
- Modern black and white color scheme
- Premium iOS-style animations

Inspired by:
- iOS Control Center
- Apple Music glass cards
- macOS Big Sur UI elements

---

Enjoy your beautiful PropGPT app with Apple liquid glass aesthetic!
