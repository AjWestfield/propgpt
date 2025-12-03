# PropGPT Design System

## Apple Liquid Glass Aesthetic - Dark Mode

This app implements Apple's signature liquid glass/frosted glass design language with a premium dark mode aesthetic featuring charcoal black backgrounds and crisp white text.

## Color Palette

### Primary Colors (Dark Mode)
- **Deep Charcoal**: `#0A0A0A` - Main background
- **Dark Gray**: `#121212` - Secondary background gradient
- **Darker Gray**: `#1C1C1E` - Tertiary background gradient

### Text Colors
- **Pure White**: `#FFFFFF` - Primary text, headings
- **Light Gray**: `#E5E5E7` - Secondary text, descriptions
- **Medium Gray**: `#AEAEB2` - Tertiary text, subtitles, footer

### Transparent Layers (Dark)
- **Card Background**: `rgba(28, 28, 30, 0.7)` - Dark frosted glass
- **Logo Background**: `rgba(28, 28, 30, 0.8)` - Enhanced dark glass
- **Icon Background**: `rgba(18, 18, 18, 0.6)` - Subtle dark glass
- **Inner Glass**: `rgba(10, 10, 10, 0.4)` to `rgba(18, 18, 18, 0.5)` - Layered depth

## Blur Effects

### BlurView Intensities (Dark Mode)
- **Logo**: 80 intensity, dark tint
- **Cards**: 60 intensity, dark tint
- **Icons**: 80 intensity, extraDark tint

All blur effects use native `expo-blur` for optimal performance on iOS and Android. Dark tints provide the signature frosted glass effect with dark translucent backgrounds.

## Typography

### System Fonts
- Uses native iOS "System" font family when available
- Falls back to platform defaults on Android

### Font Sizes
- **Logo**: 44pt, weight 700
- **Title**: 44pt, weight 700
- **Card Title**: 24pt, weight 700
- **Subtitle**: 17pt, weight 400
- **Description**: 16pt, weight 400
- **Footer**: 13pt, weight 400

### Letter Spacing
- **Large Text**: -1 to -0.5 (tighter, Apple style)
- **Body Text**: -0.2 to -0.1 (subtle compression)

## Shadows (Dark Mode)

### iOS Shadows
- **Logo**: 12pt offset, 0.15 opacity, 24pt radius (white glow)
- **Cards**: 8pt offset, 0.08 opacity, 16pt radius (subtle white glow)
- **Icons**: 4pt offset, 0.06 opacity, 8pt radius (minimal white glow)

### Android Elevation
- **Logo**: 12
- **Cards**: 8
- **Icons**: 4

All shadows use white (`#FFFFFF`) with reduced opacity to create subtle glows and depth in dark mode. Text shadows on the logo use white with 0.2 opacity for enhanced visibility.

## Border Radius

- **Cards**: 24pt - Generous rounding
- **Logo**: 28pt - Extra rounded
- **Icons**: 18pt - Medium rounding

## Border Colors (Dark Mode)

- **Primary Border**: `rgba(255, 255, 255, 0.12)` - Card borders with subtle definition
- **Secondary Border**: `rgba(255, 255, 255, 0.1)` - Logo and icon borders with minimal separation

## Spacing

### Padding
- **Container**: 24pt horizontal
- **Card Content**: 28pt all sides
- **Vertical Spacing**: 80pt top, 40pt bottom

### Margins
- **Header**: 48pt bottom
- **Logo**: 24pt bottom
- **Cards**: 16pt gap between items
- **Footer**: 24pt top

## Animations

### Timing
- **Fade**: 800ms
- **Slide**: 600ms
- **Spring**: friction 12, tension 50

### Values
- **Initial Scale**: 0.95
- **Initial Translate**: 30pt
- **Initial Opacity**: 0

All animations use native driver for optimal performance.

## Design Principles

1. **Minimal & Clean**: Focus on content, remove unnecessary elements
2. **Depth & Layering**: Use blur and transparency to create hierarchy
3. **Subtle Motion**: Refined, gentle animations
4. **Proper Whitespace**: Generous spacing for readability
5. **Glass Aesthetic**: Translucent dark overlays with blur effects
6. **Platform-Specific**: iOS white glows, Android elevation
7. **Accessible**: High contrast white text on charcoal black backgrounds for excellent readability

## Implementation Notes

### BlurView Usage (Dark Mode)
```tsx
<BlurView
  intensity={60}
  tint="dark"
  style={styles.cardBlur}
>
  {/* Content */}
</BlurView>
```

### Layered Glass Effect
Achieve depth by stacking:
1. Background color with low opacity
2. BlurView with medium intensity
3. Inner view with even lower opacity
4. Content on top

### Platform-Specific Styling (Dark Mode)
```tsx
...Platform.select({
  ios: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  android: {
    elevation: 8,
  },
}),
```

## Dark Mode Implementation

The app now features a **premium dark mode** with:
- Charcoal black backgrounds (#0A0A0A, #121212, #1C1C1E)
- Pure white text (#FFFFFF) with light gray accents
- Dark blur tints for frosted glass effect
- White glows instead of black shadows
- High contrast for excellent readability
- Maintains all Apple liquid glass aesthetic principles

## Future Enhancements

- Implement haptic feedback for interactions
- Add more sophisticated animations
- Create reusable component library
- Add accessibility features (VoiceOver, TalkBack)
- Implement gesture-based interactions
- Add theme toggle to switch between light and dark modes
