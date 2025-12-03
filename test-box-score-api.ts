// Test script for Box Score API
// Run with: npx ts-node test-box-score-api.ts

import { BoxScoreAPI } from './services/boxScoreApi';

async function testAllSports() {
  console.log('='.repeat(60));
  console.log('TESTING BOX SCORE API FOR ALL SPORTS');
  console.log('='.repeat(60));
  console.log('');

  const sports: Array<'NBA' | 'NHL' | 'NFL' | 'MLB'> = ['NBA', 'NHL', 'NFL', 'MLB'];

  for (const sport of sports) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${sport}...`);
    console.log('='.repeat(60));

    try {
      const result = await BoxScoreAPI.testAPI(sport);

      if (result.success) {
        console.log(`✅ SUCCESS: ${result.message}`);
        if (result.sampleGameId) {
          console.log(`   Sample Game ID: ${result.sampleGameId}`);

          // Fetch detailed box score
          console.log(`\n   Fetching detailed box score...`);
          const boxScore = await BoxScoreAPI.getBoxScore(result.sampleGameId, sport);

          if (boxScore) {
            console.log(`   ✅ Box Score Retrieved:`);
            console.log(`      - Game ID: ${boxScore.gameId}`);
            console.log(`      - Sport: ${boxScore.sport}`);
            console.log(`      - Home Team: ${boxScore.teamStats.home.teamName}`);
            console.log(`      - Away Team: ${boxScore.teamStats.away.teamName}`);
            console.log(`      - Home Players: ${boxScore.playerStats.home.length}`);
            console.log(`      - Away Players: ${boxScore.playerStats.away.length}`);

            // Display sample player stats
            if (boxScore.playerStats.home.length > 0) {
              const samplePlayer = boxScore.playerStats.home[0];
              console.log(`\n      Sample Player (${samplePlayer.name}):`);
              console.log(`         Position: ${samplePlayer.position}`);
              console.log(`         Starter: ${samplePlayer.starter}`);
              console.log(`         Stats:`, JSON.stringify(samplePlayer.stats, null, 2).split('\n').slice(0, 5).join('\n         '));
            }

            // Display sample team stats
            console.log(`\n      Home Team Stats Sample:`);
            const homeStats = Object.entries(boxScore.teamStats.home.stats).slice(0, 5);
            homeStats.forEach(([key, value]) => {
              console.log(`         ${key}: ${value}`);
            });
          } else {
            console.log(`   ❌ Failed to retrieve box score`);
          }
        }
      } else {
        console.log(`❌ FAILED: ${result.message}`);
      }
    } catch (error) {
      const err = error as Error;
      console.log(`❌ ERROR: ${err.message}`);
      console.error(error);
    }

    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
}

// Run tests
testAllSports().catch(console.error);
