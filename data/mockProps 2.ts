export interface PlayerProp {
  id: string;
  playerId: string;
  playerName: string;
  team: string;
  teamLogo: string;
  opponent: string;
  opponentLogo: string;
  sport: 'NBA' | 'NFL' | 'MLB' | 'NHL';
  propType: string;
  line: number;
  projection: number;
  confidence: number; // 0-100
  over: boolean; // true = over, false = under
  gameTime: string;
  recentGames: number[];
  seasonAverage: number;
  vsOpponentAverage: number;
  trend: 'up' | 'down' | 'stable';
  hitRate: number; // percentage
  reasoning: string;
}

export const mockPlayerProps: PlayerProp[] = [
  // NBA Props
  {
    id: '1',
    playerId: 'lebron-james',
    playerName: 'LeBron James',
    team: 'Lakers',
    teamLogo: '🏀',
    opponent: 'Warriors',
    opponentLogo: '⚡',
    sport: 'NBA',
    propType: 'Points',
    line: 27.5,
    projection: 29.8,
    confidence: 87,
    over: true,
    gameTime: 'Today 7:30 PM',
    recentGames: [31, 28, 35, 26, 29],
    seasonAverage: 28.4,
    vsOpponentAverage: 30.2,
    trend: 'up',
    hitRate: 73,
    reasoning: 'LeBron has averaged 30.2 points against GSW this season. Warriors rank 23rd in defensive efficiency. He\'s hit the over in 4 of his last 5 games.'
  },
  {
    id: '2',
    playerId: 'stephen-curry',
    playerName: 'Stephen Curry',
    team: 'Warriors',
    teamLogo: '⚡',
    opponent: 'Lakers',
    opponentLogo: '🏀',
    sport: 'NBA',
    propType: '3-Pointers Made',
    line: 4.5,
    projection: 5.2,
    confidence: 82,
    over: true,
    gameTime: 'Today 7:30 PM',
    recentGames: [6, 5, 4, 7, 5],
    seasonAverage: 5.1,
    vsOpponentAverage: 5.8,
    trend: 'up',
    hitRate: 68,
    reasoning: 'Curry averages 5.8 threes vs LAL. Lakers allow 4th most 3PM per game. High pace matchup favors volume.'
  },
  {
    id: '3',
    playerId: 'anthony-davis',
    playerName: 'Anthony Davis',
    team: 'Lakers',
    teamLogo: '🏀',
    opponent: 'Warriors',
    opponentLogo: '⚡',
    sport: 'NBA',
    propType: 'Rebounds',
    line: 11.5,
    projection: 13.2,
    confidence: 91,
    over: true,
    gameTime: 'Today 7:30 PM',
    recentGames: [14, 13, 12, 15, 13],
    seasonAverage: 12.8,
    vsOpponentAverage: 13.5,
    trend: 'up',
    hitRate: 81,
    reasoning: 'AD dominates the glass vs GSW. Warriors play small, allowing high rebound rates. He\'s averaging 13.5 RPG in this matchup.'
  },

  // NFL Props
  {
    id: '4',
    playerId: 'patrick-mahomes',
    playerName: 'Patrick Mahomes',
    team: 'Chiefs',
    teamLogo: '🏈',
    opponent: 'Bills',
    opponentLogo: '🦬',
    sport: 'NFL',
    propType: 'Passing Yards',
    line: 287.5,
    projection: 305.3,
    confidence: 85,
    over: true,
    gameTime: 'Sunday 1:00 PM',
    recentGames: [320, 298, 285, 312, 290],
    seasonAverage: 295.4,
    vsOpponentAverage: 310.2,
    trend: 'up',
    hitRate: 71,
    reasoning: 'Mahomes averages 310+ vs Buffalo\'s secondary. Expected to be a high-scoring shootout. Chiefs are 7-point favorites.'
  },
  {
    id: '5',
    playerId: 'travis-kelce',
    playerName: 'Travis Kelce',
    team: 'Chiefs',
    teamLogo: '🏈',
    opponent: 'Bills',
    opponentLogo: '🦬',
    sport: 'NFL',
    propType: 'Receptions',
    line: 6.5,
    projection: 7.8,
    confidence: 79,
    over: true,
    gameTime: 'Sunday 1:00 PM',
    recentGames: [8, 7, 6, 9, 7],
    seasonAverage: 7.2,
    vsOpponentAverage: 8.1,
    trend: 'up',
    hitRate: 65,
    reasoning: 'Kelce sees 9+ targets in big games. Bills struggle covering elite TEs. High game total (O/U 54.5) suggests volume.'
  },

  // MLB Props
  {
    id: '6',
    playerId: 'aaron-judge',
    playerName: 'Aaron Judge',
    team: 'Yankees',
    teamLogo: '⚾',
    opponent: 'Red Sox',
    opponentLogo: '🧦',
    sport: 'MLB',
    propType: 'Total Bases',
    line: 1.5,
    projection: 2.3,
    confidence: 76,
    over: true,
    gameTime: 'Today 7:05 PM',
    recentGames: [3, 2, 1, 4, 2],
    seasonAverage: 2.1,
    vsOpponentAverage: 2.5,
    trend: 'up',
    hitRate: 62,
    reasoning: 'Judge mashes vs Red Sox pitching. Facing a struggling RHP with 5.20 ERA. Fenway Park favors power hitters.'
  },
  {
    id: '7',
    playerId: 'shohei-ohtani',
    playerName: 'Shohei Ohtani',
    team: 'Dodgers',
    teamLogo: '⭐',
    opponent: 'Padres',
    opponentLogo: '🌴',
    sport: 'MLB',
    propType: 'Hits',
    line: 1.5,
    projection: 2.1,
    confidence: 71,
    over: true,
    gameTime: 'Today 9:40 PM',
    recentGames: [2, 3, 1, 2, 2],
    seasonAverage: 1.8,
    vsOpponentAverage: 2.0,
    trend: 'stable',
    hitRate: 58,
    reasoning: 'Ohtani has positive history vs today\'s pitcher (.350 BA). Good weather conditions. Hitting .320 in last 10 games.'
  },

  // NHL Props
  {
    id: '8',
    playerId: 'connor-mcdavid',
    playerName: 'Connor McDavid',
    team: 'Oilers',
    teamLogo: '🛢️',
    opponent: 'Maple Leafs',
    opponentLogo: '🍁',
    sport: 'NHL',
    propType: 'Points',
    line: 1.5,
    projection: 2.2,
    confidence: 83,
    over: true,
    gameTime: 'Today 7:00 PM',
    recentGames: [3, 2, 1, 3, 2],
    seasonAverage: 2.1,
    vsOpponentAverage: 2.4,
    trend: 'up',
    hitRate: 69,
    reasoning: 'McDavid on fire with 11 points in last 5 games. Toronto\'s defense allows 3.2 goals/game. High-scoring rivalry matchup expected.'
  },
  {
    id: '9',
    playerId: 'auston-matthews',
    playerName: 'Auston Matthews',
    team: 'Maple Leafs',
    teamLogo: '🍁',
    opponent: 'Oilers',
    opponentLogo: '🛢️',
    sport: 'NHL',
    propType: 'Shots on Goal',
    line: 4.5,
    projection: 5.3,
    confidence: 77,
    over: true,
    gameTime: 'Today 7:00 PM',
    recentGames: [6, 5, 4, 6, 5],
    seasonAverage: 5.2,
    vsOpponentAverage: 5.6,
    trend: 'up',
    hitRate: 64,
    reasoning: 'Matthews averages 5.6 SOG vs Edmonton. High-tempo game expected with O/U at 7.5 goals. He\'s shooting 22% more than season average lately.'
  },

  // More trending props
  {
    id: '10',
    playerId: 'kevin-durant',
    playerName: 'Kevin Durant',
    team: 'Suns',
    teamLogo: '☀️',
    opponent: 'Nuggets',
    opponentLogo: '⛰️',
    sport: 'NBA',
    propType: 'Points',
    line: 28.5,
    projection: 31.2,
    confidence: 89,
    over: true,
    gameTime: 'Today 10:00 PM',
    recentGames: [33, 30, 29, 35, 31],
    seasonAverage: 29.8,
    vsOpponentAverage: 32.1,
    trend: 'up',
    hitRate: 78,
    reasoning: 'KD averages 32+ vs Denver. Nuggets defense ranks 18th. He\'s in elite form, hitting over in 9 of last 10 games.'
  },
  {
    id: '11',
    playerId: 'josh-allen',
    playerName: 'Josh Allen',
    team: 'Bills',
    teamLogo: '🦬',
    opponent: 'Chiefs',
    opponentLogo: '🏈',
    sport: 'NFL',
    propType: 'Passing TDs',
    line: 1.5,
    projection: 2.4,
    confidence: 74,
    over: true,
    gameTime: 'Sunday 1:00 PM',
    recentGames: [3, 2, 2, 3, 2],
    seasonAverage: 2.3,
    vsOpponentAverage: 2.6,
    trend: 'up',
    hitRate: 61,
    reasoning: 'Allen throws 2.6 TDs vs KC historically. High game total suggests multiple scoring drives. Chiefs defense vulnerable to big plays.'
  },
  {
    id: '12',
    playerId: 'gerrit-cole',
    playerName: 'Gerrit Cole',
    team: 'Yankees',
    teamLogo: '⚾',
    opponent: 'Red Sox',
    opponentLogo: '🧦',
    sport: 'MLB',
    propType: 'Strikeouts',
    line: 7.5,
    projection: 8.9,
    confidence: 86,
    over: true,
    gameTime: 'Today 7:05 PM',
    recentGames: [10, 9, 7, 9, 8],
    seasonAverage: 8.4,
    vsOpponentAverage: 9.2,
    trend: 'up',
    hitRate: 72,
    reasoning: 'Cole dominates Red Sox lineup with 9.2 K/9. Boston strikes out at 24% clip. He\'s gone over in 7 of last 8 starts.'
  }
];

export const featuredProps = mockPlayerProps.filter(prop => prop.confidence >= 80);
export const trendingProps = mockPlayerProps.filter(prop => prop.trend === 'up');

export const getPropsBySport = (sport: 'NBA' | 'NFL' | 'MLB' | 'NHL') => {
  return mockPlayerProps.filter(prop => prop.sport === sport);
};

export const getHighConfidenceProps = (minConfidence: number = 80) => {
  return mockPlayerProps.filter(prop => prop.confidence >= minConfidence);
};
