# PropGPT Component Reference Guide

Quick reference for all new UI components added in the UI/UX improvement phase.

---

## 🎯 FilterPills Component

**Location:** `/components/FilterPills.tsx`

**Purpose:** Advanced filtering for EV+, Boosts, Arbitrage, and Middle Bets

**Props:**
```typescript
interface FilterPillsProps {
  activeFilters: FilterType[];
  onToggleFilter: (filter: FilterType) => void;
}

type FilterType = 'ev+' | 'boosts' | 'arbitrage' | 'middle';
```

**Example:**
```tsx
const [evFilters, setEvFilters] = useState<FilterType[]>([]);

<FilterPills
  activeFilters={evFilters}
  onToggleFilter={(filter) => {
    setEvFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }}
/>
```

**Features:**
- Horizontal scrolling
- Active state with colored dots
- "Clear All" button
- Icon + label design
- Glassmorphism styling

**Colors:**
- EV+: Cyan (#00D9FF)
- Boosts: Amber (#F59E0B)
- Arbitrage: Green (#10B981)
- Middle Bets: Purple (#8B5CF6)

---

## ⭐ EVRating Component

**Location:** `/components/EVRating.tsx`

**Purpose:** Display Expected Value ratings with stars and percentage badge

**Props:**
```typescript
interface EVRatingProps {
  evPercentage: number;      // EV% (e.g., 4.2 = +4.2%)
  size?: 'small' | 'medium' | 'large';
  showStars?: boolean;
}
```

**Example:**
```tsx
<EVRating
  evPercentage={4.2}
  size="medium"
  showStars={true}
/>
```

**Star Calculation:**
- < 0%: 1 star
- 0-2%: 2 stars
- 2-4%: 3 stars
- 4-6%: 4 stars
- 6%+: 5 stars

**Colors:**
- Positive EV: Green (#10B981)
- Negative EV: Red (#EF4444)
- Stars: Amber (#F59E0B) / Gray (#3A3A3C)

**Sizes:**
```typescript
small:  { text: 11, star: 12, badge: 18, badgeText: 10 }
medium: { text: 13, star: 14, badge: 22, badgeText: 11 }
large:  { text: 15, star: 16, badge: 26, badgeText: 12 }
```

---

## 📊 BarChart Component

**Location:** `/components/BarChart.tsx`

**Purpose:** Professional bar charts using Victory Native

**Props:**
```typescript
interface BarChartProps {
  data: BarChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  showValues?: boolean;
  positiveColor?: string;
  negativeColor?: string;
  threshold?: number;
}

interface BarChartDataPoint {
  x: string;      // Label (e.g., "10/27")
  y: number;      // Value
  label?: string; // Optional display label
  color?: string; // Optional color override
}
```

**Example:**
```tsx
const performanceData = [
  { x: '10/27', y: 159, label: '159' },
  { x: '11/03', y: 159, label: '159' },
  { x: '11/10', y: 66, label: '66' },
  // ... more data
];

<BarChart
  data={performanceData}
  title="Player Performance"
  subtitle="Last 10 Games"
  height={280}
  showValues={true}
  positiveColor="#10B981"
  negativeColor="#EF4444"
  threshold={100}
/>
```

**Features:**
- Victory Native integration
- X/Y axes with grid lines
- Value labels on bars
- Color coding by threshold
- Legend included
- Glassmorphism container
- Responsive width

**Default Values:**
- height: 300
- showValues: true
- positiveColor: '#10B981' (Green)
- negativeColor: '#EF4444' (Red)
- threshold: 0

---

## ⚖️ ComparisonBars Component

**Location:** `/components/ComparisonBars.tsx`

**Purpose:** Side-by-side horizontal comparison bars

**Props:**
```typescript
interface ComparisonBarsProps {
  data: ComparisonBarData[];
  title?: string;
  subtitle?: string;
  label1?: string;
  label2?: string;
}

interface ComparisonBarData {
  label: string;
  value1: number;
  value2: number;
  color1?: string;
  color2?: string;
}
```

**Example:**
```tsx
const comparisonData = [
  {
    label: 'Projected Fantasy Points',
    value1: 11.98,
    value2: 18.67
  },
  {
    label: 'Avg Fantasy Points',
    value1: 14.40,
    value2: 21.61
  },
];

<ComparisonBars
  data={comparisonData}
  title="Player Comparison"
  subtitle="Projected & Average"
  label1="Player A"
  label2="Player B"
/>
```

**Features:**
- Horizontal bars
- Automatic scaling to max value
- Value labels inside bars
- Color-coded comparison
- Legend at top
- Glassmorphism container

**Default Colors:**
- Value 1: Green (#10B981)
- Value 2: Red (#EF4444)

**Use Cases:**
- Player A vs Player B
- Projected vs Actual
- Over vs Under
- Season vs Game average

---

## 🧭 Enhanced Navigation

**Location:** `/navigation/MainNavigator.tsx`

**Tabs:**
1. **Picks** - Basketball icon (solid/outline)
2. **Tools** - Construct icon (solid/outline)
3. **Feed** - Newspaper icon (solid/outline)
4. **Profile** - Person icon (solid/outline)

**Features:**
- Ionicons from @expo/vector-icons
- Active state with iOS blue (#007AFF)
- Glassmorphism blur background
- Platform-specific shadows
- Smooth transitions

**Icon Sizes:**
- Inactive: 22px
- Active: 26px

**Active State:**
- Background: rgba(0, 122, 255, 0.15)
- Shadow: #007AFF with 25% opacity
- Larger icon size

---

## 🎨 Design Tokens

### Colors (New Additions)
```typescript
// EV Indicators
const EV_CYAN = '#00D9FF';
const EV_PURPLE = '#8B5CF6';
const EV_AMBER = '#F59E0B';

// Existing (preserved)
const GREEN = '#10B981';
const RED = '#EF4444';
const BLUE = '#007AFF';
const DARK_BG = '#0A0A0A';
const CARD_BG = 'rgba(28, 28, 30, 0.7)';
```

### Border Radius
- Pills/Badges: 20px
- Cards: 16-20px
- Buttons: 10-12px

### Blur Intensity
- Active filters: 70
- Inactive filters: 50
- Cards: 60
- Navigation: 80

---

## 📱 Responsive Behavior

All components are mobile-first and responsive:

**FilterPills:**
- Horizontal scroll on mobile
- Auto-hide scrollbar
- Touch-optimized tap targets (44x44pt min)

**Charts:**
- Width calculated from screen dimensions
- Padding adjusts for small screens
- Labels scale appropriately

**Navigation:**
- iOS safe area handling
- Platform-specific heights (88pt iOS, 68pt Android)
- Adaptive padding for notches

---

## 🔧 Integration Checklist

When integrating components:

1. **Import the component:**
   ```tsx
   import { ComponentName } from '../components/ComponentName';
   ```

2. **Add required dependencies:**
   ```bash
   npm install victory-native react-native-svg @expo/vector-icons
   ```

3. **Prepare data:**
   - Ensure data matches interface requirements
   - Use TypeScript types for type safety

4. **Handle state:**
   - Use useState for interactive components
   - Implement callbacks for user actions

5. **Test on device:**
   - Check iOS and Android
   - Verify touch targets
   - Test horizontal scrolling

---

## 💡 Best Practices

**Performance:**
- Memoize chart data with useMemo
- Avoid re-rendering on every state change
- Use React.memo for pure components

**Accessibility:**
- All components have high contrast (21:1)
- Touch targets meet 44x44pt minimum
- Text is readable at all sizes

**Consistency:**
- Use existing color tokens
- Follow naming conventions
- Maintain glassmorphism style

---

## 🐛 Common Issues & Solutions

**Issue:** Victory Native not rendering
- **Solution:** Ensure react-native-svg is installed
- **Check:** Import from 'victory-native' not 'victory'

**Issue:** Icons not showing
- **Solution:** Verify @expo/vector-icons is installed
- **Check:** Icon names match Ionicons.glyphMap

**Issue:** Blur not working on Android
- **Solution:** expo-blur has limited Android support
- **Fallback:** Use solid background colors

**Issue:** Chart labels cut off
- **Solution:** Adjust padding in chart config
- **Increase:** left/right padding values

---

## 📚 Additional Resources

**Victory Native Docs:** https://commerce.nearform.com/open-source/victory-native
**Ionicons Reference:** https://ionic.io/ionicons
**Expo Blur:** https://docs.expo.dev/versions/latest/sdk/blur-view/

---

**Last Updated:** November 18, 2025
**Version:** 1.0
**Status:** Production Ready ✅
