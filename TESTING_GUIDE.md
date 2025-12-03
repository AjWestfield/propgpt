# Dark Theme Testing Guide

Quick guide to test the new dark theme implementation.

## Start the App

```bash
# Start Expo development server
npm start

# Or run directly on iOS
npm run ios

# Or run on Android
npm run android
```

## What to Test

### 1. Visual Appearance ✓

**Background:**
- Main screen should be deep charcoal black (#0A0A0A)
- Subtle gradient from #121212 (top) to #1C1C1E (bottom)

**Logo:**
- PG logo in white text on dark glass container
- Subtle white glow around the logo
- Dark blur effect visible

**Text:**
- "PropGPT" title in crisp white (#FFFFFF)
- Subtitle in light gray (#AEAEB2)
- All text clearly readable

**Cards:**
- 4 feature cards with dark frosted glass effect
- White borders (rgba(255, 255, 255, 0.12))
- White card titles
- Light gray descriptions
- Icons in nested dark glass containers

### 2. Glass Morphism Effect ✓

**Check for:**
- Translucent cards showing gradient background beneath
- Blur effect on all BlurView components
- Layered depth (multiple glass layers)
- Smooth transitions between layers

**iOS Specific:**
- White glows around cards, logo, and icons
- Shadow radius visible and subtle
- No harsh edges

**Android Specific:**
- Elevation creating depth
- Blur effects working correctly

### 3. Animations ✓

**On App Load:**
- Fade in animation (0 to 1 opacity over 800ms)
- Slide up animation (30pt to 0 over 600ms)
- Scale animation (0.95 to 1.0 with spring)
- All animations smooth and synchronized

### 4. Scrolling ✓

**Scroll Behavior:**
- Smooth scrolling on all devices
- No vertical scroll indicator (hidden)
- Content properly padded
- All cards visible when scrolling

### 5. Status Bar ✓

**Check:**
- Status bar shows light content (white)
- Time, battery, signal in white
- Proper contrast with dark background

## Platform-Specific Testing

### iOS (iPhone/iPad)

```bash
npm run ios
```

**Verify:**
- [ ] White glows around all components
- [ ] Blur effects working perfectly
- [ ] System font rendering correctly
- [ ] Status bar light style
- [ ] Animations buttery smooth
- [ ] Text shadows on logo visible

### Android

```bash
npm run android
```

**Verify:**
- [ ] Elevation creating depth
- [ ] Blur effects rendering (may vary by device)
- [ ] Text clearly visible
- [ ] Status bar light style
- [ ] Animations smooth

### Expo Go

```bash
npm start
```
Then scan QR code with Expo Go app

**Verify:**
- [ ] All features work in Expo Go
- [ ] No console errors
- [ ] Blur effects supported
- [ ] Colors render correctly

## Expected Console Output

```
✓ No errors
✓ No warnings about BlurView
✓ No color-related warnings
✓ No layout warnings
```

## Screenshot Checklist

Take screenshots to verify:

1. **Full screen view** - Shows gradient and all cards
2. **Logo close-up** - Shows white glow and dark glass
3. **Card detail** - Shows blur effect and text contrast
4. **Icon containers** - Shows nested glass layers
5. **Scrolled view** - Shows footer text

## Common Issues & Solutions

### Issue: Blur effects not showing
**Solution:** Ensure expo-blur@15.0.7 is installed
```bash
npm install expo-blur@15.0.7
```

### Issue: White text not visible
**Solution:** Check text color is `#FFFFFF` not `#000000`

### Issue: Cards look flat
**Solution:** Verify BlurView tint is "dark" not "light"

### Issue: Shadows not visible
**Solution:** iOS shadows should use `shadowColor: '#FFFFFF'`

### Issue: Status bar is dark
**Solution:** Verify `<StatusBar style="light" />`

## Performance Testing

### FPS Check
- [ ] Animations run at 60fps
- [ ] No dropped frames during scroll
- [ ] Smooth transitions

### Memory Usage
- [ ] No memory leaks
- [ ] App responsive throughout
- [ ] No lag or stuttering

## Accessibility Testing

### VoiceOver (iOS)
```
Enable: Settings > Accessibility > VoiceOver
```
- [ ] All text readable by VoiceOver
- [ ] Card titles announced
- [ ] Proper navigation order

### TalkBack (Android)
```
Enable: Settings > Accessibility > TalkBack
```
- [ ] All content accessible
- [ ] Clear element descriptions
- [ ] Logical focus order

## Device Testing Matrix

Test on multiple devices for best coverage:

| Device | Screen Size | iOS Version | Status |
|--------|-------------|-------------|--------|
| iPhone 15 Pro | 6.1" | iOS 17+ | ⬜ |
| iPhone SE | 4.7" | iOS 15+ | ⬜ |
| iPad Pro | 12.9" | iPadOS 17+ | ⬜ |
| Pixel 7 | 6.3" | Android 13+ | ⬜ |
| Galaxy S23 | 6.1" | Android 13+ | ⬜ |

## Final Checklist

Before considering testing complete:

- [ ] All colors match DARK_THEME_UPDATE.md specifications
- [ ] Blur effects visible on all BlurView components
- [ ] Text contrast excellent (WCAG AAA compliant)
- [ ] Animations smooth and performant
- [ ] No console errors or warnings
- [ ] Works on both iOS and Android
- [ ] Works in Expo Go
- [ ] Status bar properly configured
- [ ] Screenshots taken for documentation

## Success Criteria

The dark theme is successfully implemented when:

1. ✅ Deep charcoal black backgrounds throughout
2. ✅ Crisp white text with excellent readability
3. ✅ Dark frosted glass effect on all cards
4. ✅ Subtle white glows create depth
5. ✅ Smooth animations on app load
6. ✅ No visual bugs or layout issues
7. ✅ Maintains Apple liquid glass aesthetic
8. ✅ Feels like a premium iOS dark mode app

---

**Testing Complete!** The app should look stunning with the new dark theme! 🌙
