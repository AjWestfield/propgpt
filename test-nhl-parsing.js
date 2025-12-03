// Test NHL box score parsing
const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

async function testNHLParsing() {
  try {
    console.log('Testing NHL Box Score Parsing...\n');

    const scoreboardUrl = `${ESPN_BASE}/hockey/nhl/scoreboard`;
    const scoreboardRes = await fetch(scoreboardUrl);
    const scoreboard = await scoreboardRes.json();

    if (!scoreboard.events || scoreboard.events.length === 0) {
      console.log('No NHL games found');
      return;
    }

    const gameId = scoreboard.events[0].id;
    console.log('Game:', scoreboard.events[0].shortName);
    console.log('Game ID:', gameId);
    console.log('');

    const boxScoreUrl = `${ESPN_BASE}/hockey/nhl/summary?event=${gameId}`;
    const boxScoreRes = await fetch(boxScoreUrl);
    const data = await boxScoreRes.json();

    if (!data.boxscore) {
      console.log('❌ No boxscore data');
      return;
    }

    console.log('='.repeat(60));
    console.log('NHL BOX SCORE STRUCTURE');
    console.log('='.repeat(60));

    // Check player stats structure
    if (data.boxscore.players && data.boxscore.players[0]) {
      const teamPlayers = data.boxscore.players[0];
      console.log('\nTeam:', teamPlayers.team.displayName);
      console.log('Statistics groups:', teamPlayers.statistics?.length || 0);

      if (teamPlayers.statistics) {
        teamPlayers.statistics.forEach((statGroup, idx) => {
          console.log(`\nStat Group ${idx + 1}:`);
          console.log('Name:', statGroup.name);
          console.log('Labels:', statGroup.labels);
          console.log('Athletes:', statGroup.athletes?.length || 0);

          if (statGroup.athletes && statGroup.athletes[0]) {
            const athlete = statGroup.athletes[0];
            console.log('\nSample player:', athlete.athlete.displayName);
            console.log('Position:', athlete.athlete.position?.abbreviation);
            console.log('Stats:', athlete.stats);
          }
        });
      }
    }

    // Check team stats
    if (data.boxscore.teams && data.boxscore.teams[0]) {
      console.log('\n' + '='.repeat(60));
      console.log('TEAM STATS');
      console.log('='.repeat(60));
      const team = data.boxscore.teams[0];
      console.log('Team:', team.team.displayName);
      console.log('Stats count:', team.statistics?.length || 0);
      if (team.statistics) {
        console.log('Sample stats:');
        team.statistics.slice(0, 5).forEach(stat => {
          const label = stat.label || stat.abbreviation || stat.name;
          console.log(`  ${label}: ${stat.displayValue}`);
        });
      }
    }

    console.log('\n✅ NHL data structure verified');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNHLParsing();
