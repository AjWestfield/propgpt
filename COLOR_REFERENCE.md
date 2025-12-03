# PropGPT Dark Theme - Color Reference

Quick reference for all colors used in the dark theme.

## Background Colors

```
Main Container:     #0A0A0A  (Deep Charcoal)
Gradient Top:       #121212  (Dark Gray)
Gradient Bottom:    #1C1C1E  (Darker Gray)
```

## Text Colors

```
Primary Headings:   #FFFFFF  (Pure White)
Secondary Text:     #E5E5E7  (Light Gray)
Tertiary Text:      #AEAEB2  (Medium Gray)
```

## Glass Layer Colors

```
Card Background:    rgba(28, 28, 30, 0.7)
Logo Container:     rgba(28, 28, 30, 0.8)
Logo Inner:         rgba(18, 18, 18, 0.5)
Icon Container:     rgba(18, 18, 18, 0.6)
Icon Inner:         rgba(10, 10, 10, 0.4)
```

## Border Colors

```
Card Borders:       rgba(255, 255, 255, 0.12)
Logo/Icon Borders:  rgba(255, 255, 255, 0.1)
```

## Shadow/Glow Colors

```
iOS Shadow Color:   #FFFFFF
Logo Shadow:        opacity 0.15, radius 24
Card Shadow:        opacity 0.08, radius 16
Icon Shadow:        opacity 0.06, radius 8
Text Shadow:        rgba(255, 255, 255, 0.2), radius 8
```

## BlurView Tints

```
Logo:               tint="dark"      intensity={80}
Cards:              tint="dark"      intensity={60}
Icons:              tint="extraDark" intensity={80}
```

## Hex to RGBA Conversions

For reference when creating new components:

```
#0A0A0A  = rgb(10, 10, 10)
#121212  = rgb(18, 18, 18)
#1C1C1E  = rgb(28, 28, 30)
#FFFFFF  = rgb(255, 255, 255)
#E5E5E7  = rgb(229, 229, 231)
#AEAEB2  = rgb(174, 174, 178)
```

## Usage Examples

### Creating a New Card
```tsx
<BlurView intensity={60} tint="dark" style={{
  backgroundColor: 'rgba(28, 28, 30, 0.7)',
  borderColor: 'rgba(255, 255, 255, 0.12)',
  borderWidth: 1,
  borderRadius: 24,
}}>
  <Text style={{ color: '#FFFFFF' }}>Card Title</Text>
  <Text style={{ color: '#E5E5E7' }}>Card Description</Text>
</BlurView>
```

### Adding iOS Shadow (Glow)
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

### Text Styles
```tsx
// Primary heading
{ fontSize: 44, fontWeight: '700', color: '#FFFFFF' }

// Secondary text
{ fontSize: 17, fontWeight: '400', color: '#AEAEB2' }

// Body text
{ fontSize: 16, fontWeight: '400', color: '#E5E5E7' }
```

## Color Contrast Ratios

For accessibility compliance (WCAG AA):

```
#FFFFFF on #0A0A0A:  21:1  ✓ Excellent (AAA)
#E5E5E7 on #0A0A0A:  17.5:1 ✓ Excellent (AAA)
#AEAEB2 on #0A0A0A:  9.8:1  ✓ Very Good (AAA)
```

All text colors meet WCAG AAA standards for contrast ratio!
