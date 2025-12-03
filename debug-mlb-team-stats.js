const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

async function debugMLBTeamStats() {
  console.log('Debugging MLB Team Stats...\n');

  const scoreboardUrl = `${ESPN_BASE}/baseball/mlb/scoreboard`;
  const scoreboardRes = await fetch(scoreboardUrl);
  const scoreboard = await scoreboardRes.json();

  if (!scoreboard.events || scoreboard.events.length === 0) {
    console.log('No MLB games found (off-season)');
    return;
  }

  const gameId = scoreboard.events[0].id;
  console.log('Game:', scoreboard.events[0].shortName);

  const boxScoreUrl = `${ESPN_BASE}/baseball/mlb/summary?event=${gameId}`;
  const boxScoreRes = await fetch(boxScoreUrl);
  const data = await boxScoreRes.json();

  if (data.boxscore && data.boxscore.teams) {
    const team = data.boxscore.teams[0];

    console.log('\nTeam:', team.team.displayName);
    console.log('\nAll available team stats:');

    if (team.statistics && Array.isArray(team.statistics)) {
      team.statistics.forEach(stat => {
        const key = stat.label || stat.abbreviation || stat.name;
        console.log(`  "${key}": "${stat.displayValue}"`);
      });
    }
  }
}

debugMLBTeamStats();
