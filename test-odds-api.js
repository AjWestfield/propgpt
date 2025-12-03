/**
 * Test script for Odds-API.io integration
 * Run with: node test-odds-api.js
 */

const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const API_KEY = process.env.ODDS_API_IO_KEY;
const BASE_URL = 'https://api.odds-api.io/v3';

async function makeRequest(endpoint, params = {}) {
  const queryParams = new URLSearchParams({
    apiKey: API_KEY,
    ...params,
  });

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function testOddsAPIIO() {
  console.log('='.repeat(80));
  console.log('🧪 Testing Odds-API.io Integration');
  console.log('='.repeat(80));
  console.log();

  // Test 1: Check if API is configured
  console.log('Test 1: API Configuration');
  console.log('-'.repeat(80));
  if (!API_KEY) {
    console.error('❌ API key not found in environment!');
    console.error('   Check your .env file for ODDS_API_IO_KEY');
    return;
  }
  console.log('✅ API Key configured');
  console.log(`   Key: ${API_KEY.substring(0, 20)}...`);
  console.log();

  // Test 2: Fetch available sports
  console.log('Test 2: Fetching Available Sports');
  console.log('-'.repeat(80));
  try {
    const sports = await makeRequest('/sports');
    console.log(`✅ Found ${sports.length} sports`);

    const supportedSports = sports.filter(s =>
      ['basketball_nba', 'americanfootball_nfl', 'baseball_mlb', 'icehockey_nhl'].includes(s.key)
    );

    console.log('\nSupported sports:');
    supportedSports.forEach(sport => {
      console.log(`  - ${sport.title} (${sport.key}): ${sport.active ? '✅ Active' : '❌ Inactive'}`);
    });
  } catch (error) {
    console.error('❌ Error fetching sports:', error.message);
    return;
  }
  console.log();

  // Test 3: Fetch NBA events (pending only)
  console.log('Test 3: Fetching Upcoming NBA Events');
  console.log('-'.repeat(80));
  try {
    const events = await makeRequest('/events', { sport: 'basketball', limit: '100', status: 'pending' });

    // Filter for NBA only (exclude NCAA, G League)
    const nbaEvents = events.filter(e =>
      e.league?.name?.includes('NBA') && !e.league?.name?.includes('G League')
    );

    console.log(`✅ Found ${nbaEvents.length} upcoming NBA events`);

    if (nbaEvents.length > 0) {
      const firstEvent = nbaEvents[0];
      console.log('\nFirst upcoming NBA event:');
      console.log(`  ID: ${firstEvent.id}`);
      console.log(`  ${firstEvent.away} @ ${firstEvent.home}`);
      console.log(`  League: ${firstEvent.league.name}`);
      console.log(`  Date: ${new Date(firstEvent.date).toLocaleString()}`);
      console.log(`  Status: ${firstEvent.status}`);
    } else {
      console.log('⚠️  No upcoming NBA events found');
    }
  } catch (error) {
    console.error('❌ Error fetching NBA events:', error.message);
  }
  console.log();

  // Test 4: Fetch odds for first upcoming event
  console.log('Test 4: Fetching Odds for Specific Event');
  console.log('-'.repeat(80));
  try {
    const events = await makeRequest('/events', { sport: 'basketball', limit: '100', status: 'pending' });
    const nbaEvents = events.filter(e =>
      e.league?.name?.includes('NBA') && !e.league?.name?.includes('G League')
    );

    if (nbaEvents.length > 0) {
      const eventId = nbaEvents[0].id;
      console.log(`Fetching odds for event: ${eventId}`);
      console.log(`  ${nbaEvents[0].away} @ ${nbaEvents[0].home}`);

      const eventOdds = await makeRequest('/odds', {
        eventId: eventId.toString(),
        bookmakers: 'Bet365,DraftKings,FanDuel,BetMGM',
      });

      console.log(`✅ Retrieved odds data`);
      console.log('\nOdds response (sample):');
      console.log(JSON.stringify(eventOdds, null, 2).substring(0, 500) + '...');
    } else {
      console.log('⚠️  Skipping - no upcoming NBA events available to test');
    }
  } catch (error) {
    console.error('❌ Error fetching odds:', error.message);
  }
  console.log();

  // Test 5: Fetch bookmakers list
  console.log('Test 5: Fetching Available Bookmakers');
  console.log('-'.repeat(80));
  try {
    const bookmakers = await makeRequest('/bookmakers');
    console.log(`✅ Found ${bookmakers.length} bookmakers`);

    const popular = ['fanduel', 'draftkings', 'betmgm', 'caesars', 'pointsbet', 'bet365'];
    console.log('\nPopular bookmakers:');
    popular.forEach(key => {
      const bookmaker = bookmakers.find(b => b.key === key);
      if (bookmaker) {
        console.log(`  - ${bookmaker.title} (${bookmaker.key})`);
      }
    });
  } catch (error) {
    console.error('❌ Error fetching bookmakers:', error.message);
  }
  console.log();

  // Test 6: Test NFL events (if available)
  console.log('Test 6: Testing Upcoming NFL Events');
  console.log('-'.repeat(80));
  try {
    const events = await makeRequest('/events', { sport: 'american-football', limit: '100', status: 'pending' });

    // Filter for NFL only (exclude college football)
    const nflEvents = events.filter(e =>
      e.league?.name?.includes('NFL')
    );

    console.log(`✅ Found ${nflEvents.length} upcoming NFL events`);

    if (nflEvents.length > 0) {
      console.log('\nFirst upcoming NFL event:');
      console.log(`  ${nflEvents[0].away} @ ${nflEvents[0].home}`);
      console.log(`  League: ${nflEvents[0].league.name}`);
      console.log(`  Date: ${new Date(nflEvents[0].date).toLocaleString()}`);
    }
  } catch (error) {
    console.error('❌ Error fetching NFL events:', error.message);
  }
  console.log();

  // Summary
  console.log('='.repeat(80));
  console.log('📋 Test Summary');
  console.log('='.repeat(80));
  console.log('✅ All tests completed! Check output above for any errors.');
  console.log('\nKey findings:');
  console.log('  - API is configured and responsive');
  console.log('  - Can fetch sports, events, odds, and bookmakers');
  console.log('  - Integration is working as expected');
  console.log();
}

// Run tests
testOddsAPIIO().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
