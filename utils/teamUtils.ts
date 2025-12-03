/**
 * Extracts the team name from a full display name
 * Example: "Golden State Warriors" -> "Warriors"
 *          "Orlando Magic" -> "Magic"
 *          "Miami Heat" -> "Heat"
 */
export function getTeamNameOnly(displayName: string): string {
  if (!displayName) return '';

  // Split the display name by spaces
  const parts = displayName.split(' ');

  // Handle edge cases
  if (parts.length === 1) {
    return displayName; // Single word team name
  }

  // Special cases for multi-word team names
  const multiWordTeams = ['Trail Blazers', 'Timberwolves', 'Clippers'];
  const lastTwoWords = parts.slice(-2).join(' ');

  if (multiWordTeams.includes(lastTwoWords)) {
    return lastTwoWords;
  }

  // Default: return the last word (team name)
  return parts[parts.length - 1];
}
