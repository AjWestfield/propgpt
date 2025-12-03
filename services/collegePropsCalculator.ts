// College Props Calculator Service
// Generates player prop estimates for college sports with conference and ranking adjustments

import { RealPlayer } from './sportsApi';

export interface CollegePlayerEstimate {
  playerId: string;
  statType: string;
  estimatedValue: number;
  confidence: number; // 0-100
  factors: {
    classYearModifier: number;
    conferenceStrength: number;
    rankingBonus: number;
    positionBaseline: number;
  };
}

// Major conference strength ratings (1.0 = baseline, higher = stronger)
const CONFERENCE_STRENGTH: Record<string, number> = {
  // Power 5 Conferences (Football)
  'SEC': 1.15,
  'Big Ten': 1.12,
  'ACC': 1.08,
  'Big 12': 1.10,
  'Pac-12': 1.08,
  // Other notable conferences
  'American Athletic': 0.95,
  'Mountain West': 0.90,
  'Sun Belt': 0.85,
  'Conference USA': 0.83,
  'MAC': 0.82,
  // Independent
  'Independent': 1.00,
  // Default for unknown conferences
  'DEFAULT': 0.90,
};

// Class year modifiers (experience factor)
const CLASS_YEAR_MODIFIER: Record<string, number> = {
  'FR': 0.80,  // Freshman - 80% of average
  'SO': 0.90,  // Sophomore - 90% of average
  'JR': 1.05,  // Junior - 105% of average (peak performance often)
  'SR': 1.10,  // Senior - 110% of average (most experienced)
  'RS-FR': 0.85, // Redshirt Freshman
  'RS-SO': 0.95, // Redshirt Sophomore
  'RS-JR': 1.08, // Redshirt Junior
  'RS-SR': 1.12, // Redshirt Senior (most experienced)
};

// Ranking bonus multipliers (for ranked teams)
function getRankingBonus(ranking?: number): number {
  if (!ranking) return 1.0;

  if (ranking <= 5) return 1.12;    // Top 5: 12% bonus
  if (ranking <= 10) return 1.08;   // Top 10: 8% bonus
  if (ranking <= 15) return 1.05;   // Top 15: 5% bonus
  if (ranking <= 25) return 1.03;   // Top 25: 3% bonus

  return 1.0; // Unranked
}

// Get conference strength multiplier
function getConferenceStrength(conference?: string): number {
  if (!conference) return CONFERENCE_STRENGTH['DEFAULT'];

  // Try exact match first
  if (CONFERENCE_STRENGTH[conference]) {
    return CONFERENCE_STRENGTH[conference];
  }

  // Try partial match (e.g., "Southeastern Conference" -> "SEC")
  const conferenceKey = Object.keys(CONFERENCE_STRENGTH).find(key =>
    conference.toLowerCase().includes(key.toLowerCase())
  );

  return conferenceKey ? CONFERENCE_STRENGTH[conferenceKey] : CONFERENCE_STRENGTH['DEFAULT'];
}

// Get class year modifier
function getClassYearModifier(classYear?: string): number {
  if (!classYear) return 1.0; // Default to average if unknown

  const normalizedYear = classYear.toUpperCase();
  return CLASS_YEAR_MODIFIER[normalizedYear] || 1.0;
}

/**
 * College Football Position Baselines
 */
export const NCAAF_BASELINES = {
  // Quarterback
  QB: {
    passingYards: 250,
    passingTDs: 2.2,
    completions: 20,
    rushingYards: 25,
  },
  // Running Back
  RB: {
    rushingYards: 85,
    rushingTDs: 0.8,
    receptions: 3,
    receivingYards: 25,
  },
  // Wide Receiver
  WR: {
    receptions: 5,
    receivingYards: 70,
    receivingTDs: 0.6,
  },
  // Tight End
  TE: {
    receptions: 4,
    receivingYards: 45,
    receivingTDs: 0.5,
  },
};

/**
 * College Basketball Position Baselines
 */
export const NCAAB_BASELINES = {
  // Guard
  G: {
    points: 14,
    assists: 4,
    rebounds: 3.5,
    threePointers: 2,
  },
  // Forward
  F: {
    points: 13,
    rebounds: 6,
    assists: 2,
    blocks: 0.8,
  },
  // Center
  C: {
    points: 12,
    rebounds: 8,
    blocks: 1.5,
    assists: 1.5,
  },
};

/**
 * Generate college football player prop estimate
 */
export function generateCollegeFootballPropEstimate(
  player: RealPlayer,
  statType: string,
  ranking?: number
): CollegePlayerEstimate {
  const position = player.position?.toUpperCase() || 'RB';
  const classYearMod = getClassYearModifier(player.classYear);
  const conferenceMod = getConferenceStrength(player.conference);
  const rankingBonus = getRankingBonus(ranking);

  // Get baseline value for position and stat type
  let baselineValue = 0;

  if (position === 'QB') {
    if (statType === 'Passing Yards') baselineValue = NCAAF_BASELINES.QB.passingYards;
    else if (statType === 'Passing TDs') baselineValue = NCAAF_BASELINES.QB.passingTDs;
    else if (statType === 'Completions') baselineValue = NCAAF_BASELINES.QB.completions;
    else if (statType === 'Rushing Yards') baselineValue = NCAAF_BASELINES.QB.rushingYards;
  } else if (position === 'RB') {
    if (statType === 'Rushing Yards') baselineValue = NCAAF_BASELINES.RB.rushingYards;
    else if (statType === 'Rushing TDs') baselineValue = NCAAF_BASELINES.RB.rushingTDs;
    else if (statType === 'Receptions') baselineValue = NCAAF_BASELINES.RB.receptions;
    else if (statType === 'Receiving Yards') baselineValue = NCAAF_BASELINES.RB.receivingYards;
  } else if (position === 'WR') {
    if (statType === 'Receptions') baselineValue = NCAAF_BASELINES.WR.receptions;
    else if (statType === 'Receiving Yards') baselineValue = NCAAF_BASELINES.WR.receivingYards;
    else if (statType === 'Receiving TDs') baselineValue = NCAAF_BASELINES.WR.receivingTDs;
  } else if (position === 'TE') {
    if (statType === 'Receptions') baselineValue = NCAAF_BASELINES.TE.receptions;
    else if (statType === 'Receiving Yards') baselineValue = NCAAF_BASELINES.TE.receivingYards;
    else if (statType === 'Receiving TDs') baselineValue = NCAAF_BASELINES.TE.receivingTDs;
  }

  // Apply all modifiers
  const estimatedValue = baselineValue * classYearMod * conferenceMod * rankingBonus;

  // Calculate confidence (higher for seniors in strong conferences)
  let confidence = 65; // Base confidence
  if (player.classYear === 'SR' || player.classYear === 'RS-SR') confidence += 10;
  if (conferenceMod > 1.0) confidence += 5;
  if (ranking && ranking <= 25) confidence += 10;

  confidence = Math.min(95, confidence); // Cap at 95%

  return {
    playerId: player.id,
    statType,
    estimatedValue: Math.round(estimatedValue * 10) / 10, // Round to 1 decimal
    confidence,
    factors: {
      classYearModifier: classYearMod,
      conferenceStrength: conferenceMod,
      rankingBonus,
      positionBaseline: baselineValue,
    },
  };
}

/**
 * Generate college basketball player prop estimate
 */
export function generateCollegeBasketballPropEstimate(
  player: RealPlayer,
  statType: string,
  ranking?: number
): CollegePlayerEstimate {
  const position = player.position?.toUpperCase() || 'G';
  const classYearMod = getClassYearModifier(player.classYear);
  const conferenceMod = getConferenceStrength(player.conference);
  const rankingBonus = getRankingBonus(ranking);

  // Get baseline value for position and stat type
  let baselineValue = 0;

  // Normalize position (G, F, C)
  const normalizedPos = position.includes('G') ? 'G' :
                       position.includes('F') ? 'F' :
                       position.includes('C') ? 'C' : 'G';

  if (normalizedPos === 'G') {
    if (statType === 'Points') baselineValue = NCAAB_BASELINES.G.points;
    else if (statType === 'Assists') baselineValue = NCAAB_BASELINES.G.assists;
    else if (statType === 'Rebounds') baselineValue = NCAAB_BASELINES.G.rebounds;
    else if (statType === '3-Pointers') baselineValue = NCAAB_BASELINES.G.threePointers;
  } else if (normalizedPos === 'F') {
    if (statType === 'Points') baselineValue = NCAAB_BASELINES.F.points;
    else if (statType === 'Rebounds') baselineValue = NCAAB_BASELINES.F.rebounds;
    else if (statType === 'Assists') baselineValue = NCAAB_BASELINES.F.assists;
    else if (statType === 'Blocks') baselineValue = NCAAB_BASELINES.F.blocks;
  } else if (normalizedPos === 'C') {
    if (statType === 'Points') baselineValue = NCAAB_BASELINES.C.points;
    else if (statType === 'Rebounds') baselineValue = NCAAB_BASELINES.C.rebounds;
    else if (statType === 'Blocks') baselineValue = NCAAB_BASELINES.C.blocks;
    else if (statType === 'Assists') baselineValue = NCAAB_BASELINES.C.assists;
  }

  // Apply all modifiers
  const estimatedValue = baselineValue * classYearMod * conferenceMod * rankingBonus;

  // Calculate confidence (higher for seniors in strong conferences)
  let confidence = 70; // Base confidence (slightly higher than football)
  if (player.classYear === 'SR' || player.classYear === 'RS-SR') confidence += 10;
  if (conferenceMod > 1.0) confidence += 5;
  if (ranking && ranking <= 25) confidence += 8;

  confidence = Math.min(95, confidence); // Cap at 95%

  return {
    playerId: player.id,
    statType,
    estimatedValue: Math.round(estimatedValue * 10) / 10, // Round to 1 decimal
    confidence,
    factors: {
      classYearModifier: classYearMod,
      conferenceStrength: conferenceMod,
      rankingBonus,
      positionBaseline: baselineValue,
    },
  };
}

/**
 * Generate multiple prop estimates for a player
 */
export function generateMultiplePropsForPlayer(
  player: RealPlayer,
  sport: 'NCAAF' | 'NCAAB',
  ranking?: number
): CollegePlayerEstimate[] {
  const estimates: CollegePlayerEstimate[] = [];

  if (sport === 'NCAAF') {
    const position = player.position?.toUpperCase() || 'RB';

    if (position === 'QB') {
      estimates.push(generateCollegeFootballPropEstimate(player, 'Passing Yards', ranking));
      estimates.push(generateCollegeFootballPropEstimate(player, 'Passing TDs', ranking));
      estimates.push(generateCollegeFootballPropEstimate(player, 'Completions', ranking));
    } else if (position === 'RB') {
      estimates.push(generateCollegeFootballPropEstimate(player, 'Rushing Yards', ranking));
      estimates.push(generateCollegeFootballPropEstimate(player, 'Rushing TDs', ranking));
      estimates.push(generateCollegeFootballPropEstimate(player, 'Receptions', ranking));
    } else if (position === 'WR' || position === 'TE') {
      estimates.push(generateCollegeFootballPropEstimate(player, 'Receptions', ranking));
      estimates.push(generateCollegeFootballPropEstimate(player, 'Receiving Yards', ranking));
      estimates.push(generateCollegeFootballPropEstimate(player, 'Receiving TDs', ranking));
    }
  } else if (sport === 'NCAAB') {
    const position = player.position?.toUpperCase() || 'G';
    const normalizedPos = position.includes('G') ? 'G' :
                         position.includes('F') ? 'F' :
                         position.includes('C') ? 'C' : 'G';

    // All positions get points
    estimates.push(generateCollegeBasketballPropEstimate(player, 'Points', ranking));

    if (normalizedPos === 'G') {
      estimates.push(generateCollegeBasketballPropEstimate(player, 'Assists', ranking));
      estimates.push(generateCollegeBasketballPropEstimate(player, 'Rebounds', ranking));
      estimates.push(generateCollegeBasketballPropEstimate(player, '3-Pointers', ranking));
    } else if (normalizedPos === 'F') {
      estimates.push(generateCollegeBasketballPropEstimate(player, 'Rebounds', ranking));
      estimates.push(generateCollegeBasketballPropEstimate(player, 'Assists', ranking));
      estimates.push(generateCollegeBasketballPropEstimate(player, 'Blocks', ranking));
    } else if (normalizedPos === 'C') {
      estimates.push(generateCollegeBasketballPropEstimate(player, 'Rebounds', ranking));
      estimates.push(generateCollegeBasketballPropEstimate(player, 'Blocks', ranking));
      estimates.push(generateCollegeBasketballPropEstimate(player, 'Assists', ranking));
    }
  }

  return estimates;
}
