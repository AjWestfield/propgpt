const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

async function inspectNBABoxScore() {
  try {
    // Get a live NBA game
    const scoreboardUrl = `${ESPN_BASE}/basketball/nba/scoreboard`;
    const scoreboardRes = await fetch(scoreboardUrl);
    const scoreboard = await scoreboardRes.json();

    if (!scoreboard.events || scoreboard.events.length === 0) {
      console.log('No NBA games found');
      return;
    }

    const gameId = scoreboard.events[0].id;
    console.log('Testing game ID:', gameId);
    console.log('Game:', scoreboard.events[0].shortName);
    console.log('');

    // Get box score
    const boxScoreUrl = `${ESPN_BASE}/basketball/nba/summary?event=${gameId}`;
    const boxScoreRes = await fetch(boxScoreUrl);
    const data = await boxScoreRes.json();

    console.log('='.repeat(60));
    console.log('BOX SCORE DATA STRUCTURE');
    console.log('='.repeat(60));

    // Check if boxscore exists
    if (data.boxscore) {
      console.log('✅ boxscore exists');
      console.log('');

      // Team stats
      if (data.boxscore.teams) {
        console.log('TEAM STATS:');
        console.log('Number of teams:', data.boxscore.teams.length);
        if (data.boxscore.teams[0]) {
          const team = data.boxscore.teams[0];
          console.log('Team name:', team.team.displayName);
          console.log('Statistics count:', team.statistics?.length || 0);
          if (team.statistics && team.statistics[0]) {
            console.log('Sample stat:', JSON.stringify(team.statistics[0], null, 2));
          }
        }
        console.log('');
      }

      // Player stats
      if (data.boxscore.players) {
        console.log('PLAYER STATS:');
        console.log('Number of teams with players:', data.boxscore.players.length);
        if (data.boxscore.players[0]) {
          const teamPlayers = data.boxscore.players[0];
          console.log('Team:', teamPlayers.team.displayName);
          console.log('Statistics groups:', teamPlayers.statistics?.length || 0);

          if (teamPlayers.statistics && teamPlayers.statistics[0]) {
            const statGroup = teamPlayers.statistics[0];
            console.log('Stat group name:', statGroup.name);
            console.log('Stat keys:', statGroup.keys);
            console.log('Stat labels:', statGroup.labels);
            console.log('Number of athletes:', statGroup.athletes?.length || 0);

            if (statGroup.athletes && statGroup.athletes[0]) {
              const athlete = statGroup.athletes[0];
              console.log('');
              console.log('SAMPLE PLAYER:');
              console.log('Name:', athlete.athlete.displayName);
              console.log('Position:', athlete.athlete.position?.abbreviation);
              console.log('Stats:', athlete.stats);
              console.log('Starter:', athlete.starter);
            }
          }
        }
      }
    } else {
      console.log('❌ No boxscore data');
    }

    // Save full response for inspection
    console.log('\n\n='.repeat(60));
    console.log('Full boxscore structure keys:');
    console.log(Object.keys(data.boxscore));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectNBABoxScore();
