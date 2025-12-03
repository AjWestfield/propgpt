const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

async function debugNBAPlayerStats() {
  console.log('Debugging NBA Player Stats...\n');

  const scoreboardUrl = `${ESPN_BASE}/basketball/nba/scoreboard`;
  const scoreboardRes = await fetch(scoreboardUrl);
  const scoreboard = await scoreboardRes.json();

  const gameId = scoreboard.events[0].id;
  console.log('Game:', scoreboard.events[0].shortName);

  const boxScoreUrl = `${ESPN_BASE}/basketball/nba/summary?event=${gameId}`;
  const boxScoreRes = await fetch(boxScoreUrl);
  const data = await boxScoreRes.json();

  if (data.boxscore && data.boxscore.players) {
    const playerData = data.boxscore.players[0];

    console.log('\nTeam:', playerData.team.displayName);

    if (playerData.statistics && playerData.statistics[0]) {
      const statGroup = playerData.statistics[0];

      console.log('\nStat Labels (what we display):');
      console.log(statGroup.labels);

      console.log('\nSample Player Stats:');
      const samplePlayer = statGroup.athletes[0];
      console.log('Player:', samplePlayer.athlete.displayName);
      console.log('Stats array:', samplePlayer.stats);

      console.log('\nMapped Stats:');
      statGroup.labels.forEach((label, index) => {
        console.log(`  ${label}: ${samplePlayer.stats[index]}`);
      });

      console.log('\n\nPredefined NBA_PLAYER_STATS we look for:');
      const NBA_PLAYER_STATS = [
        'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'TO',
        'FG', 'FG%', '3P', '3P%', 'FT', 'FT%'
      ];
      console.log(NBA_PLAYER_STATS);

      console.log('\n\nMatching Analysis:');
      NBA_PLAYER_STATS.forEach(key => {
        const found = statGroup.labels.includes(key);
        const index = statGroup.labels.indexOf(key);
        const value = index >= 0 ? samplePlayer.stats[index] : 'N/A';
        console.log(`${key}: ${found ? '✅ FOUND' : '❌ MISSING'} - Value: ${value}`);
      });
    }
  }
}

debugNBAPlayerStats();
