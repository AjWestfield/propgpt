// Test the box score parsing logic
const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

// Simulate the parsing functions
function parsePlayerStats(playerData) {
  if (!playerData || !playerData.statistics?.[0]) {
    return [];
  }

  const statGroup = playerData.statistics[0];
  const { keys, labels, athletes } = statGroup;

  if (!athletes || athletes.length === 0) {
    return [];
  }

  return athletes.map(athlete => {
    const stats = {};

    // Map stat labels to values (use labels, not keys)
    labels.forEach((label, index) => {
      const value = athlete.stats[index];
      stats[label] = value || '0';
    });

    return {
      playerId: athlete.athlete.id,
      name: athlete.athlete.displayName,
      headshot: athlete.athlete.headshot?.href,
      position: athlete.athlete.position?.abbreviation || '',
      jerseyNumber: athlete.athlete.jersey,
      starter: athlete.starter,
      stats,
    };
  });
}

function parseTeamStats(teamData) {
  if (!teamData) {
    return {
      teamId: '',
      teamName: '',
      stats: {},
    };
  }

  const stats = {};

  if (teamData.statistics && Array.isArray(teamData.statistics)) {
    teamData.statistics.forEach(stat => {
      // Use label if available, otherwise use name
      const key = stat.label || stat.abbreviation || stat.name;
      stats[key] = stat.displayValue;
    });
  }

  return {
    teamId: teamData.team.id,
    teamName: teamData.team.displayName,
    teamLogo: teamData.team.logo,
    stats,
  };
}

async function testBoxScoreParsing() {
  try {
    console.log('Testing NBA Box Score Parsing...\n');

    // Get a live NBA game
    const scoreboardUrl = `${ESPN_BASE}/basketball/nba/scoreboard`;
    const scoreboardRes = await fetch(scoreboardUrl);
    const scoreboard = await scoreboardRes.json();

    if (!scoreboard.events || scoreboard.events.length === 0) {
      console.log('No NBA games found');
      return;
    }

    const gameId = scoreboard.events[0].id;
    console.log('Game:', scoreboard.events[0].shortName);
    console.log('Game ID:', gameId);
    console.log('');

    // Get box score
    const boxScoreUrl = `${ESPN_BASE}/basketball/nba/summary?event=${gameId}`;
    const boxScoreRes = await fetch(boxScoreUrl);
    const data = await boxScoreRes.json();

    if (!data.boxscore) {
      console.log('❌ No boxscore data');
      return;
    }

    // Parse team stats
    console.log('='.repeat(60));
    console.log('TEAM STATS PARSING');
    console.log('='.repeat(60));

    const homeTeamData = data.boxscore.teams.find(t =>
      data.header.competitions[0].competitors.find(c =>
        c.homeAway === 'home' && c.team.id === t.team.id
      )
    );

    const awayTeamData = data.boxscore.teams.find(t =>
      data.header.competitions[0].competitors.find(c =>
        c.homeAway === 'away' && c.team.id === t.team.id
      )
    );

    const homeTeamStats = parseTeamStats(homeTeamData);
    const awayTeamStats = parseTeamStats(awayTeamData);

    console.log('\nHome Team:', homeTeamStats.teamName);
    console.log('Stats count:', Object.keys(homeTeamStats.stats).length);
    console.log('Sample stats:', Object.entries(homeTeamStats.stats).slice(0, 5));

    console.log('\nAway Team:', awayTeamStats.teamName);
    console.log('Stats count:', Object.keys(awayTeamStats.stats).length);
    console.log('Sample stats:', Object.entries(awayTeamStats.stats).slice(0, 5));

    // Parse player stats
    console.log('\n' + '='.repeat(60));
    console.log('PLAYER STATS PARSING');
    console.log('='.repeat(60));

    const homePlayersData = data.boxscore.players.find(p =>
      data.header.competitions[0].competitors.find(c =>
        c.homeAway === 'home' && c.team.id === p.team.id
      )
    );

    const awayPlayersData = data.boxscore.players.find(p =>
      data.header.competitions[0].competitors.find(c =>
        c.homeAway === 'away' && c.team.id === p.team.id
      )
    );

    const homePlayers = parsePlayerStats(homePlayersData);
    const awayPlayers = parsePlayerStats(awayPlayersData);

    console.log('\nHome Team Players:', homePlayers.length);
    if (homePlayers.length > 0) {
      console.log('Sample player:', homePlayers[0].name);
      console.log('Position:', homePlayers[0].position);
      console.log('Starter:', homePlayers[0].starter);
      console.log('Stats:', homePlayers[0].stats);
    }

    console.log('\nAway Team Players:', awayPlayers.length);
    if (awayPlayers.length > 0) {
      console.log('Sample player:', awayPlayers[0].name);
      console.log('Position:', awayPlayers[0].position);
      console.log('Starter:', awayPlayers[0].starter);
      console.log('Stats:', awayPlayers[0].stats);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ PARSING SUCCESSFUL');
    console.log('='.repeat(60));
    console.log('Team stats: ✅');
    console.log('Player stats: ✅');
    console.log('Total players parsed:', homePlayers.length + awayPlayers.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testBoxScoreParsing();
