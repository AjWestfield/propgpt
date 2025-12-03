const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

// Simulate the parsing
function parseTeamStats(teamData) {
  if (!teamData) {
    return { teamId: '', teamName: '', stats: {} };
  }

  const stats = {};

  if (teamData.statistics && Array.isArray(teamData.statistics)) {
    teamData.statistics.forEach(stat => {
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

async function debugTeamStats() {
  console.log('Debugging NBA Team Stats...\n');

  const scoreboardUrl = `${ESPN_BASE}/basketball/nba/scoreboard`;
  const scoreboardRes = await fetch(scoreboardUrl);
  const scoreboard = await scoreboardRes.json();

  const gameId = scoreboard.events[0].id;
  console.log('Game:', scoreboard.events[0].shortName);

  const boxScoreUrl = `${ESPN_BASE}/basketball/nba/summary?event=${gameId}`;
  const boxScoreRes = await fetch(boxScoreUrl);
  const data = await boxScoreRes.json();

  if (data.boxscore && data.boxscore.teams) {
    const team = data.boxscore.teams[0];
    const parsedStats = parseTeamStats(team);

    console.log('\nTeam:', parsedStats.teamName);
    console.log('Total stats:', Object.keys(parsedStats.stats).length);
    console.log('\nActual stat keys in the parsed stats object:');
    console.log(Object.keys(parsedStats.stats));

    console.log('\n\nPredefined NBA_TEAM_STATS keys that TeamBoxScore looks for:');
    const NBA_TEAM_STATS = [
      'PTS', 'FG%', '3P%', 'FT%', 'REB', 'AST', 'TO', 'STL', 'BLK'
    ];
    console.log(NBA_TEAM_STATS);

    console.log('\n\nMatching analysis:');
    NBA_TEAM_STATS.forEach(key => {
      const found = parsedStats.stats[key] !== undefined;
      console.log(`${key}: ${found ? '✅ FOUND' : '❌ MISSING'} - Value: ${parsedStats.stats[key] || 'N/A'}`);
    });

    console.log('\n\nAll available stats:');
    Object.entries(parsedStats.stats).forEach(([key, value]) => {
      console.log(`  "${key}": "${value}"`);
    });
  }
}

debugTeamStats();
