const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

// Simulating the updated stat categories
const NBA_TEAM_STATS = [
  { key: 'FG', label: 'FG' },
  { key: 'Field Goal %', label: 'FG%' },
  { key: '3PT', label: '3PT' },
  { key: 'Three Point %', label: '3PT%' },
  { key: 'FT', label: 'FT' },
  { key: 'Free Throw %', label: 'FT%' },
  { key: 'Rebounds', label: 'Rebounds' },
  { key: 'Assists', label: 'Assists' },
  { key: 'Steals', label: 'Steals' },
  { key: 'Blocks', label: 'Blocks' },
  { key: 'Turnovers', label: 'Turnovers' },
  { key: 'Fast Break Points', label: 'Fast Break' },
  { key: 'Points in Paint', label: 'Points in Paint' },
];

const NHL_TEAM_STATS = [
  { key: 'Shots', label: 'Shots' },
  { key: 'Power Play Goals', label: 'PP Goals' },
  { key: 'Power Play Opportunities', label: 'PP Opps' },
  { key: 'Power Play Percentage', label: 'PP%' },
  { key: 'Penalty Minutes', label: 'PIM' },
  { key: 'Hits', label: 'Hits' },
  { key: 'Blocked Shots', label: 'Blocked' },
  { key: 'Takeaways', label: 'Takeaways' },
  { key: 'Giveaways', label: 'Giveaways' },
  { key: 'Faceoffs Won', label: 'FO Won' },
  { key: 'Faceoff Win Percent', label: 'FO%' },
];

const NFL_TEAM_STATS = [
  { key: 'Points Per Game', label: 'PPG' },
  { key: 'Total Yards', label: 'Total Yards' },
  { key: 'Yards Passing', label: 'Pass Yards' },
  { key: 'Yards Rushing', label: 'Rush Yards' },
  { key: 'Points Allowed Per Game', label: 'Points Allowed' },
  { key: 'Yards Allowed', label: 'Yards Allowed' },
  { key: 'Pass Yards Allowed', label: 'Pass Yards Allowed' },
  { key: 'Rush Yards Allowed', label: 'Rush Yards Allowed' },
];

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

async function verifySport(sport, sportPath, statCategories) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${sport} Team Stats Verification`);
  console.log('='.repeat(60));

  const scoreboardUrl = `${ESPN_BASE}/${sportPath}/scoreboard`;
  const scoreboardRes = await fetch(scoreboardUrl);
  const scoreboard = await scoreboardRes.json();

  if (!scoreboard.events || scoreboard.events.length === 0) {
    console.log(`❌ No ${sport} games found`);
    return;
  }

  const gameId = scoreboard.events[0].id;
  console.log(`\n✅ Game Found: ${scoreboard.events[0].shortName}`);

  const boxScoreUrl = `${ESPN_BASE}/${sportPath}/summary?event=${gameId}`;
  const boxScoreRes = await fetch(boxScoreUrl);
  const data = await boxScoreRes.json();

  if (data.boxscore && data.boxscore.teams) {
    const team = data.boxscore.teams[0];
    const parsedStats = parseTeamStats(team);

    console.log(`\nTeam: ${parsedStats.teamName}`);
    console.log(`Total stats available: ${Object.keys(parsedStats.stats).length}`);

    console.log('\n📊 Stat Matching Results:');
    console.log('-'.repeat(60));

    let foundCount = 0;
    let missingCount = 0;

    statCategories.forEach(category => {
      const value = parsedStats.stats[category.key];
      const found = value !== undefined;

      if (found) {
        console.log(`✅ ${category.label.padEnd(20)} | Key: "${category.key.padEnd(25)}" | Value: ${value}`);
        foundCount++;
      } else {
        console.log(`❌ ${category.label.padEnd(20)} | Key: "${category.key.padEnd(25)}" | MISSING`);
        missingCount++;
      }
    });

    console.log('\n📈 Summary:');
    console.log(`   Found: ${foundCount}/${statCategories.length} stats`);
    console.log(`   Missing: ${missingCount}/${statCategories.length} stats`);

    if (foundCount === statCategories.length) {
      console.log('\n🎉 ALL TEAM STATS WILL DISPLAY CORRECTLY!');
    } else if (foundCount > 0) {
      console.log('\n⚠️  SOME STATS WILL DISPLAY');
    } else {
      console.log('\n❌ NO STATS WILL DISPLAY - KEYS MISMATCH');
    }
  }
}

async function runVerification() {
  console.log('\n🔍 TEAM STATS FIX VERIFICATION\n');
  console.log('Testing that team stats will now display correctly in the app...\n');

  await verifySport('NBA', 'basketball/nba', NBA_TEAM_STATS);
  await verifySport('NHL', 'hockey/nhl', NHL_TEAM_STATS);
  await verifySport('NFL', 'football/nfl', NFL_TEAM_STATS);

  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION COMPLETE');
  console.log('='.repeat(60));
}

runVerification();
