const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

function parsePlayerStats(playerData, sport) {
  if (!playerData || !playerData.statistics) {
    return [];
  }

  const allPlayers = [];

  playerData.statistics.forEach(statGroup => {
    const { labels, athletes } = statGroup;

    if (!athletes || athletes.length === 0) {
      return;
    }

    const players = athletes.map(athlete => {
      const stats = {};

      // Map stat labels to values
      labels.forEach((label, index) => {
        const value = athlete.stats[index];
        stats[label] = value || '0';
      });

      // Calculate percentage stats for NBA
      if (sport === 'NBA') {
        // FG% - Calculate from FG (made-attempted)
        if (stats['FG']) {
          const fg = String(stats['FG']).split('-');
          if (fg.length === 2) {
            const made = parseFloat(fg[0]);
            const attempted = parseFloat(fg[1]);
            stats['FG%'] = attempted > 0 ? ((made / attempted) * 100).toFixed(1) : '0.0';
          }
        }

        // 3PT% - Calculate from 3PT (made-attempted)
        if (stats['3PT']) {
          const threePt = String(stats['3PT']).split('-');
          if (threePt.length === 2) {
            const made = parseFloat(threePt[0]);
            const attempted = parseFloat(threePt[1]);
            stats['3PT%'] = attempted > 0 ? ((made / attempted) * 100).toFixed(1) : '0.0';
          }
        }

        // FT% - Calculate from FT (made-attempted)
        if (stats['FT']) {
          const ft = String(stats['FT']).split('-');
          if (ft.length === 2) {
            const made = parseFloat(ft[0]);
            const attempted = parseFloat(ft[1]);
            stats['FT%'] = attempted > 0 ? ((made / attempted) * 100).toFixed(1) : '0.0';
          }
        }
      }

      return {
        playerId: athlete.athlete.id,
        name: athlete.athlete.displayName,
        stats,
      };
    });

    allPlayers.push(...players);
  });

  return allPlayers;
}

async function verifyNBAPercentages() {
  console.log('Verifying NBA Percentage Stats Calculation...\n');

  const scoreboardUrl = `${ESPN_BASE}/basketball/nba/scoreboard`;
  const scoreboardRes = await fetch(scoreboardUrl);
  const scoreboard = await scoreboardRes.json();

  const gameId = scoreboard.events[0].id;
  console.log('Game:', scoreboard.events[0].shortName, '\n');

  const boxScoreUrl = `${ESPN_BASE}/basketball/nba/summary?event=${gameId}`;
  const boxScoreRes = await fetch(boxScoreUrl);
  const data = await boxScoreRes.json();

  if (data.boxscore && data.boxscore.players) {
    const playerData = data.boxscore.players[0];
    const players = parsePlayerStats(playerData, 'NBA');

    console.log('Team:', playerData.team.displayName);
    console.log('Total Players Parsed:', players.length);

    console.log('\nSample Players with Shooting Stats:\n');

    // Show first 3 players
    players.slice(0, 3).forEach((player, index) => {
      console.log(`${index + 1}. ${player.name}`);
      console.log(`   FG: ${player.stats['FG']} → FG%: ${player.stats['FG%']}`);
      console.log(`   3PT: ${player.stats['3PT']} → 3PT%: ${player.stats['3PT%']}`);
      console.log(`   FT: ${player.stats['FT']} → FT%: ${player.stats['FT%']}`);
      console.log('');
    });

    console.log('✅ Verification Complete!');
    console.log('\nExpected Results:');
    console.log('- FG% should be calculated from FG (e.g., 10-16 → 62.5%)');
    console.log('- 3PT% should be calculated from 3PT (e.g., 0-1 → 0.0%)');
    console.log('- FT% should be calculated from FT (e.g., 13-15 → 86.7%)');
  }
}

verifyNBAPercentages();
