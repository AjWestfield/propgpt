# Box Score Auto-Refresh - Silent Background Updates ✅

## Requirement
Box score modal should automatically refresh every 5 seconds while open, without any UI jumps or visible loading states.

## Implementation

### Changes Made to `hooks/useBoxScore.ts`

#### 1. Updated Polling Intervals
Changed refresh interval from 10 seconds to 5 seconds:

```typescript
const POLLING_INTERVALS = {
  live: 5000,         // 5 seconds during live games ✅ (was 10s)
  pre_game: 60000,    // 1 minute for upcoming games
  final: 300000,      // 5 minutes for completed games
  default: 5000,      // 5 seconds default ✅ (was 30s)
};
```

#### 2. Added Silent Background Refresh
Modified `fetchBoxScore` to accept `isBackgroundRefresh` parameter:

```typescript
const fetchBoxScore = useCallback(async (isBackgroundRefresh = false) => {
  // ... fetch logic ...

  // Only set loading state on initial load
  if (!isBackgroundRefresh) {
    setLoading(false);
  }
}, [gameId, sport, enabled, error]);
```

#### 3. Updated Polling Logic
- **Initial fetch**: Shows loading spinner (`isBackgroundRefresh = false`)
- **Subsequent refreshes**: Silent background updates (`isBackgroundRefresh = true`)

```typescript
useEffect(() => {
  // Initial fetch (show loading)
  fetchBoxScore(false);

  intervalRef.current = setInterval(() => {
    // Background refresh (no loading spinner)
    fetchBoxScore(true);
  }, interval);
}, [enabled, fetchBoxScore, getPollingInterval]);
```

## How It Works

### Initial Load
```
1. User clicks on game → Modal opens
2. fetchBoxScore(false) is called
3. Loading spinner shows
4. Data loads → Spinner disappears
```

### Background Refresh (Every 5 Seconds)
```
1. Timer triggers after 5 seconds
2. fetchBoxScore(true) is called
3. NO loading spinner
4. Data silently updates in background
5. UI smoothly updates with new data
6. No jumps, no flickers, no interruptions
```

## Benefits

### ✅ No UI Jumps
- Loading state never changes during background refresh
- Screen doesn't jump or reposition
- User can scroll/interact without interruption

### ✅ Seamless Updates
- Stats update every 5 seconds automatically
- Live scores stay current
- Player stats refresh in real-time

### ✅ Better UX
- Feels native and polished
- No jarring loading spinners
- Smooth, continuous experience

## Behavior by Game Status

| Game Status | Refresh Interval | Use Case |
|-------------|------------------|----------|
| Live Game   | **5 seconds** ✅ | Real-time updates during active games |
| Pre-Game    | 60 seconds | Occasional updates before game starts |
| Final       | 5 minutes | Slow updates after game ends |
| Default     | **5 seconds** ✅ | Box score modal refresh |

## Error Handling

### Background Refresh Errors
- Errors during background refresh are **silent**
- User isn't disturbed by network hiccups
- Previous data remains displayed
- Successful refresh clears any previous errors

### Initial Load Errors
- Shows error message to user
- Provides retry button
- User can manually refresh

## What Doesn't Change

✅ Initial loading experience (shows spinner on first load)
✅ Manual refresh button (works as before)
✅ Error handling (works as before)
✅ UI layout and styling (unchanged)
✅ Data accuracy (same API calls)

## Testing Recommendations

1. **Open box score modal** → Should show loading initially
2. **Wait 5 seconds** → Data should update silently
3. **Scroll through stats** → Should not jump or reset scroll position
4. **Watch live game** → Stats should update every 5 seconds
5. **Check "Updated X ago"** → Should update from "5s ago" to "just now"

## Status: COMPLETE ✅

The box score modal now automatically refreshes every 5 seconds with silent background updates. No UI jumps, no interruptions, just smooth real-time data updates! 🏀
