# PropGPT Usage Guide

## Getting Started

### Installation
The app now includes `expo-blur` for native blur effects:

```bash
npm install
```

### Running the App

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Web (Limited blur support)
```bash
npm run web
```

**Note**: Blur effects work best on iOS and Android. Web fallback uses opacity-based styling.

## Design System Overview

### Color Scheme
The app uses a **modern black and white** aesthetic with:
- White/light gray backgrounds (#FAFAFA, #FFFFFF, #F5F5F7)
- Black text (#000000)
- Gray secondary text (#6E6E73, #86868B)
- Subtle borders with low opacity (rgba(0, 0, 0, 0.04-0.06))

### Apple Liquid Glass Effect
Achieved through:
1. **BlurView components** from expo-blur
2. **Translucent backgrounds** (white with 0.4-0.8 opacity)
3. **Layered depth** (multiple transparent layers)
4. **Subtle shadows** (iOS) and elevation (Android)
5. **Rounded corners** (18-28pt radius)

## Component Structure

### App Container
```
View (Main Container)
├── StatusBar (dark mode)
├── Background (subtle gradient)
└── ScrollView
    ├── Header (Logo + Title + Subtitle)
    ├── Cards Container (4 feature cards)
    └── Footer
```

### Feature Card Anatomy
```
View (Outer Container - shadow wrapper)
└── BlurView (Card blur container)
    └── View (Card content)
        ├── BlurView (Icon container)
        │   └── View (Icon inner)
        │       └── Text (Emoji icon)
        ├── Text (Title)
        └── Text (Description)
```

## Customization

### Adding New Cards

```tsx
<FeatureCard
  title="Your Feature"
  description="Your description here"
  icon="📱" // Use emoji or create custom icon component
/>
```

### Adjusting Blur Intensity
Change the `intensity` prop on BlurView:
- **Light blur**: 40-50
- **Medium blur**: 60-70 (recommended for cards)
- **Heavy blur**: 80-100 (recommended for logo)

### Changing Tints
BlurView supports these tints:
- `light` - Best for light backgrounds
- `dark` - For dark mode (future)
- `default` - System default
- `extraLight` - Very subtle (good for icons)

### Modifying Colors
All colors are defined in StyleSheet constants:
- Background: `#FAFAFA`
- White: `#FFFFFF`
- Text: `#000000`
- Secondary: `#6E6E73`
- Tertiary: `#86868B`

### Adjusting Shadows
iOS shadows in Platform.select:
```tsx
ios: {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
}
```

Android elevation:
```tsx
android: {
  elevation: 8,
}
```

## Animations

### Current Animations
- **Fade in**: Opacity 0 → 1 (800ms)
- **Slide up**: TranslateY 30 → 0 (600ms)
- **Scale up**: Scale 0.95 → 1 (spring animation)

### Modifying Animation Speed
In the `useEffect` hook:
```tsx
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 800, // Change this value
  useNativeDriver: true,
})
```

### Adding New Animations
1. Create animation value: `const newAnim = useRef(new Animated.Value(0)).current;`
2. Add to parallel animation block
3. Apply to component: `transform: [{ yourTransform: newAnim }]`

## Best Practices

### Performance
- ✅ Always use `useNativeDriver: true` for animations
- ✅ Avoid animating layout properties (width, height, padding)
- ✅ Use transform and opacity for smooth animations
- ✅ Limit BlurView nesting (max 2-3 levels)

### Styling
- ✅ Use StyleSheet.create for better performance
- ✅ Keep consistent border radius (18, 24, 28pt)
- ✅ Maintain consistent spacing (multiples of 4 or 8)
- ✅ Use platform-specific shadows/elevation

### Accessibility
- ✅ Ensure text contrast ratio meets WCAG standards (black on white is excellent)
- ✅ Add accessibilityLabel to interactive elements
- ✅ Use semantic font sizes (17pt for body, 24pt+ for headers)
- ✅ Provide sufficient touch targets (44x44pt minimum)

## Troubleshooting

### Blur not showing on iOS
- Ensure you have installed expo-blur: `npm install expo-blur`
- Run `npx expo prebuild --clean` if using custom dev client
- Restart the app completely

### Blur not showing on Android
- Android blur requires native modules
- Test on physical device (emulator may have limited support)
- Consider fallback styling for older Android versions

### Performance issues
- Reduce BlurView intensity (try 40-50 instead of 80)
- Limit number of BlurView components on screen
- Use `removeClippedSubviews` on ScrollView for long lists
- Profile with React DevTools Performance tab

### Styling inconsistencies
- Clear Metro bundler cache: `npx expo start -c`
- Check Platform.select is working correctly
- Verify StyleSheet is imported from 'react-native'

## Next Steps

### Recommended Enhancements
1. **Add Dark Mode**: Invert color scheme, use dark BlurView tints
2. **Interactive Elements**: Add buttons, inputs with same glass aesthetic
3. **Haptic Feedback**: Use expo-haptics for touch interactions
4. **Animated Transitions**: Add screen navigation with glass morphism
5. **Gesture Handling**: Use react-native-gesture-handler for swipes

### Component Library
Consider extracting reusable components:
- `GlassCard` - Reusable card with blur
- `GlassButton` - Interactive button with glass effect
- `GlassHeader` - Consistent header styling
- `GlassModal` - Modal with backdrop blur

## Support

For issues specific to:
- **Expo Blur**: See [expo-blur docs](https://docs.expo.dev/versions/latest/sdk/blur-view/)
- **React Native**: See [React Native docs](https://reactnative.dev/)
- **Animations**: See [Animated API docs](https://reactnative.dev/docs/animated)

## License

This design system is part of PropGPT and follows the same license as the main project.
