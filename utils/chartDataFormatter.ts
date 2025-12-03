import { PlayerGameLog } from '../services/nbaStatsApiV2';

// Support both old and new game stat types
type GameStats = PlayerGameLog | any;

export interface ChartDataPoint {
  x: string; // Label (e.g., "3/17 vs DEN")
  y: number; // Stat value
  label?: string; // Optional value label
  color: string; // Bar color
  gameDate: string; // Full date for reference
  opponent: string; // Opponent team
  isHome: boolean; // Home or away game
}

export interface HitRateData {
  hitRate: number; // Percentage (0-100)
  hits: number; // Count of overs
  misses: number; // Count of unders
  pushes: number; // Count of exact matches
  streak: {
    count: number;
    type: 'over' | 'under' | 'none';
  };
}

/**
 * Extract stat value from game based on prop type
 */
export function extractStatFromGame(
  game: GameStats,
  propType: string
): number {
  const normalizedPropType = propType.toLowerCase();

  // Handle new PlayerGameLog format
  if ('pts' in game) {
    if (normalizedPropType.includes('point')) return game.pts || 0;
    if (normalizedPropType.includes('rebound')) return game.reb || 0;
    if (normalizedPropType.includes('assist')) return game.ast || 0;
    if (normalizedPropType.includes('3-pointer') || normalizedPropType.includes('three')) return game.fg3m || 0;
    if (normalizedPropType.includes('steal')) return game.stl || 0;
    if (normalizedPropType.includes('block')) return game.blk || 0;
    if (normalizedPropType.includes('turnover')) return game.tov || game.turnover || 0;
    if (normalizedPropType.includes('foul')) return game.pf || 0;
    if (normalizedPropType.includes('fg%') || normalizedPropType.includes('field goal')) return (game.fgPct || game.fg_pct || 0) * 100;
    if (normalizedPropType.includes('3pt%')) return (game.fg3Pct || game.fg3_pct || 0) * 100;
    if (normalizedPropType.includes('ft%') || normalizedPropType.includes('free throw')) return (game.ftPct || game.ft_pct || 0) * 100;
    return game.pts || 0;
  }

  // Default to 0 if no match
  return 0;
}

/**
 * Determine bar color based on value vs threshold
 */
export function getBarColor(value: number, line: number, tolerance: number = 0.5): string {
  if (value > line + tolerance) return '#10B981'; // Green - Over
  if (value < line - tolerance) return '#EF4444'; // Red - Under
  return '#F59E0B'; // Yellow - Push/At line
}

/**
 * Format game label for chart X-axis
 */
export function formatGameLabel(
  game: GameStats,
  compact: boolean = false,
  playerTeamId: number | string
): string {
  // Handle new PlayerGameLog format
  if ('gameDate' in game && 'matchup' in game) {
    // Parse date string - handle various formats
    let month: number = 0;
    let day: number = 0;

    if (game.gameDate) {
      console.log('[formatGameLabel] Raw gameDate:', game.gameDate, 'Type:', typeof game.gameDate);

      // NBA API returns dates in "MMM DD, YYYY" format (e.g., "NOV 18, 2024")
      // or sometimes "YYYY-MM-DD" format

      // Try direct Date parsing first
      let gameDate = new Date(game.gameDate);

      // Check if date is valid
      if (!isNaN(gameDate.getTime())) {
        month = gameDate.getMonth() + 1;
        day = gameDate.getDate();
        console.log('[formatGameLabel] Parsed via Date():', month, '/', day);
      } else {
        // Try parsing "MMM DD, YYYY" format manually
        const monthNames: { [key: string]: number } = {
          'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
          'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
        };

        const upperDate = game.gameDate.toUpperCase();
        const parts = upperDate.replace(/,/g, '').split(/\s+/);

        if (parts.length >= 2 && monthNames[parts[0]]) {
          month = monthNames[parts[0]];
          day = parseInt(parts[1], 10);
          console.log('[formatGameLabel] Parsed via month names:', month, '/', day);
        } else {
          // Try "YYYY-MM-DD" or "MM/DD/YYYY" format
          const dateParts = game.gameDate.includes('-')
            ? game.gameDate.split('-')
            : game.gameDate.split('/');

          if (dateParts.length >= 3) {
            if (dateParts[0].length === 4) {
              // YYYY-MM-DD format
              month = parseInt(dateParts[1], 10);
              day = parseInt(dateParts[2], 10);
            } else {
              // MM/DD/YYYY format
              month = parseInt(dateParts[0], 10);
              day = parseInt(dateParts[1], 10);
            }
            console.log('[formatGameLabel] Parsed via split:', month, '/', day);
          }
        }
      }
    }

    const dateStr = (month > 0 && day > 0) ? `${month}/${day}` : 'N/A';
    console.log('[formatGameLabel] Final dateStr:', dateStr);

    // Matchup format: "DET vs. ORL" or "DET @ ORL"
    const matchupParts = game.matchup.split(/\s+(?:vs\.|@)\s+/);
    const opponentAbbr = matchupParts[1] || 'OPP';
    const isHome = game.matchup.includes('vs.');
    const locationStr = compact ? (isHome ? 'H' : 'A') : (isHome ? 'Home' : 'Away');

    if (compact) {
      return `${dateStr}\n${opponentAbbr}`;
    }

    return `${dateStr}\n${locationStr}\nvs ${opponentAbbr}`;
  }

  // Fallback for old format
  if ('game' in game) {
    let month: number;
    let day: number;

    if (game.game.date) {
      const gameDate = new Date(game.game.date);

      // Check if date is valid
      if (!isNaN(gameDate.getTime())) {
        month = gameDate.getMonth() + 1;
        day = gameDate.getDate();
      } else {
        month = 0;
        day = 0;
      }
    } else {
      month = 0;
      day = 0;
    }

    const dateStr = (month && day) ? `${month}/${day}` : 'N/A';

    const isHome = game.game.home_team_id === playerTeamId;
    const locationStr = compact ? (isHome ? 'H' : 'A') : (isHome ? 'Home' : 'Away');
    const opponentAbbr = game.team.abbreviation || 'OPP';

    if (compact) {
      return `${dateStr}\n${opponentAbbr}`;
    }

    return `${dateStr}\n${locationStr}\nvs ${opponentAbbr}`;
  }

  return 'N/A';
}

/**
 * Convert game log to chart data points
 */
export function formatGameLogToChartData(
  gameLog: GameStats[],
  propType: string,
  line: number,
  playerTeamId: number | string,
  compact: boolean = false
): ChartDataPoint[] {
  return gameLog.map(game => {
    const value = extractStatFromGame(game, propType);
    const color = getBarColor(value, line);

    // Handle new PlayerGameLog format
    if ('gameDate' in game && 'matchup' in game) {
      const isHome = game.matchup.includes('vs.');
      const matchupParts = game.matchup.split(/\s+(?:vs\.|@)\s+/);
      const opponent = matchupParts[1] || 'OPP';

      return {
        x: formatGameLabel(game, compact, playerTeamId),
        y: value,
        label: value.toFixed(1),
        color,
        gameDate: game.gameDate,
        opponent,
        isHome,
      };
    }

    // Fallback for old format
    const isHome = game.game?.home_team_id === playerTeamId;
    const opponent = game.team?.abbreviation || 'OPP';

    return {
      x: formatGameLabel(game, compact, playerTeamId),
      y: value,
      label: value.toFixed(1),
      color,
      gameDate: game.game?.date || '',
      opponent,
      isHome,
    };
  });
}

/**
 * Calculate hit rate from recent games
 */
export function calculateHitRate(
  values: number[],
  line: number,
  tolerance: number = 0.5
): HitRateData {
  let hits = 0;
  let misses = 0;
  let pushes = 0;

  values.forEach(value => {
    if (value > line + tolerance) {
      hits++;
    } else if (value < line - tolerance) {
      misses++;
    } else {
      pushes++;
    }
  });

  const total = values.length;
  const hitRate = total > 0 ? Math.round((hits / total) * 100) : 0;

  // Calculate current streak
  const streak = calculateStreak(values, line, tolerance);

  return {
    hitRate,
    hits,
    misses,
    pushes,
    streak,
  };
}

/**
 * Calculate current streak (consecutive overs or unders)
 */
function calculateStreak(
  values: number[],
  line: number,
  tolerance: number = 0.5
): { count: number; type: 'over' | 'under' | 'none' } {
  if (values.length === 0) {
    return { count: 0, type: 'none' };
  }

  const firstValue = values[0];
  let streakType: 'over' | 'under' | 'none';

  if (firstValue > line + tolerance) {
    streakType = 'over';
  } else if (firstValue < line - tolerance) {
    streakType = 'under';
  } else {
    return { count: 0, type: 'none' };
  }

  let count = 0;
  for (const value of values) {
    const isOver = value > line + tolerance;
    const isUnder = value < line - tolerance;

    if ((streakType === 'over' && isOver) || (streakType === 'under' && isUnder)) {
      count++;
    } else {
      break;
    }
  }

  return { count, type: streakType };
}

/**
 * Get chart Y-axis range (min/max)
 */
export function getChartYRange(values: number[], line: number): { min: number; max: number } {
  const allValues = [...values, line];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues, 0);

  // Add 10% padding
  const range = maxValue - minValue;
  const padding = range * 0.1;

  return {
    min: Math.max(0, Math.floor(minValue - padding)),
    max: Math.ceil(maxValue + padding),
  };
}

/**
 * Format stat value for display
 */
export function formatStatValue(value: number, propType: string): string {
  const normalizedPropType = propType.toLowerCase();

  // Percentages show 1 decimal
  if (normalizedPropType.includes('%')) {
    return `${value.toFixed(1)}%`;
  }

  // Whole numbers for counting stats
  return Math.round(value).toString();
}

/**
 * Get trend direction from recent games
 */
export function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 3) return 'stable';

  // Compare first half vs second half
  const midpoint = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  const threshold = firstAvg * 0.05; // 5% change threshold

  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
}

/**
 * Calculate average from array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((total, val) => total + val, 0);
  return sum / values.length;
}

/**
 * Get color for trend indicator
 */
export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return '#10B981'; // Green
  if (trend === 'down') return '#EF4444'; // Red
  return '#AEAEB2'; // Gray
}

/**
 * Get emoji for trend indicator
 */
export function getTrendEmoji(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return '📈';
  if (trend === 'down') return '📉';
  return '➡️';
}
