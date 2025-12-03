/**
 * Test script for Odds-API.io integration
 * Run with: npx ts-node test-odds-api.ts
 */

import { OddsAPIIO } from './services/oddsApiIO';
import { OddsAPI } from './services/oddsApi';

// Polyfill for fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

async function testOddsAPIIO() {
  console.log('='.repeat(80));
  console.log('🧪 Testing Odds-API.io Integration');
  console.log('='.repeat(80));
  console.log();

  // Test 1: Check if API is configured
  console.log('Test 1: API Configuration');
  console.log('-'.repeat(80));
  const isConfigured = OddsAPIIO.isConfigured();
  console.log(`✅ API Configured: ${isConfigured}`);
  if (!isConfigured) {
    console.error('❌ API key not found in environment!');
    console.error('   Check your .env file for ODDS_API_IO_KEY');
    return;
  }
  console.log();

  // Test 2: Fetch available sports
  console.log('Test 2: Fetching Available Sports');
  console.log('-'.repeat(80));
  try {
    const sports = await OddsAPIIO.getSports();
    console.log(`✅ Found ${sports.length} sports`);

    const supportedSports = sports.filter(s =>
      ['basketball_nba', 'americanfootball_nfl', 'baseball_mlb', 'icehockey_nhl'].includes(s.key)
    );

    console.log('\nSupported sports:');
    supportedSports.forEach(sport => {
      console.log(`  - ${sport.title} (${sport.key}): ${sport.active ? '✅ Active' : '❌ Inactive'}`);
    });

    const remaining = OddsAPIIO.getRemainingRequests();
    console.log(`\n📊 Remaining requests: ${remaining}/5000`);
  } catch (error: any) {
    console.error('❌ Error fetching sports:', error.message);
    return;
  }
  console.log();

  // Test 3: Fetch NBA events
  console.log('Test 3: Fetching NBA Events');
  console.log('-'.repeat(80));
  try {
    const events = await OddsAPIIO.getEvents('NBA');
    console.log(`✅ Found ${events.length} NBA events`);

    if (events.length > 0) {
      const firstEvent = events[0];
      console.log('\nFirst event:');
      console.log(`  ID: ${firstEvent.id}`);
      console.log(`  Home: ${firstEvent.home_team}`);
      console.log(`  Away: ${firstEvent.away_team}`);
      console.log(`  Start: ${new Date(firstEvent.commence_time).toLocaleString()}`);
    } else {
      console.log('⚠️  No NBA events found (might be off-season or no upcoming games)');
    }

    const remaining = OddsAPIIO.getRemainingRequests();
    console.log(`\n📊 Remaining requests: ${remaining}/5000`);
  } catch (error: any) {
    console.error('❌ Error fetching NBA events:', error.message);
  }
  console.log();

  // Test 4: Fetch odds for first event
  console.log('Test 4: Fetching Odds for Specific Event');
  console.log('-'.repeat(80));
  try {
    const events = await OddsAPIIO.getEvents('NBA');

    if (events.length > 0) {
      const eventId = events[0].id;
      console.log(`Fetching odds for event: ${eventId}`);

      const eventOdds = await OddsAPIIO.getOdds(
        eventId,
        ['h2h', 'spreads', 'totals'],
        OddsAPIIO.getPopularBookmakers()
      );

      console.log(`✅ Retrieved odds from ${eventOdds.bookmakers?.length || 0} bookmakers`);

      if (eventOdds.bookmakers && eventOdds.bookmakers.length > 0) {
        console.log('\nBookmakers with odds:');
        eventOdds.bookmakers.slice(0, 3).forEach(bookmaker => {
          console.log(`  - ${bookmaker.title}`);
          bookmaker.markets.forEach(market => {
            console.log(`    ${market.key}: ${market.outcomes.length} outcomes`);
          });
        });
      }

      const remaining = OddsAPIIO.getRemainingRequests();
      console.log(`\n📊 Remaining requests: ${remaining}/5000`);
    } else {
      console.log('⚠️  Skipping - no events available to test');
    }
  } catch (error: any) {
    console.error('❌ Error fetching odds:', error.message);
  }
  console.log();

  // Test 5: Test hybrid OddsAPI service
  console.log('Test 5: Testing Hybrid OddsAPI Service (ESPN + Odds-API.io)');
  console.log('-'.repeat(80));
  try {
    // This will test the full integration with caching
    const gameOdds = await OddsAPI.getGameOdds('test-game-id', 'NBA');

    if (gameOdds) {
      console.log(`✅ Hybrid service returned ${gameOdds.sportsbooks.length} sportsbooks`);
      console.log('\nSportsbooks:');
      gameOdds.sportsbooks.forEach(sb => {
        console.log(`  - ${sb.name}`);
      });
    } else {
      console.log('⚠️  No odds returned from hybrid service');
    }

    const remaining = OddsAPIIO.getRemainingRequests();
    console.log(`\n📊 Remaining requests: ${remaining}/5000`);
  } catch (error: any) {
    console.error('❌ Error testing hybrid service:', error.message);
  }
  console.log();

  // Test 6: Fetch bookmakers list
  console.log('Test 6: Fetching Available Bookmakers');
  console.log('-'.repeat(80));
  try {
    const bookmakers = await OddsAPIIO.getBookmakers();
    console.log(`✅ Found ${bookmakers.length} bookmakers`);

    const popular = OddsAPIIO.getPopularBookmakers();
    console.log('\nPopular bookmakers configured:');
    popular.forEach(key => {
      const bookmaker = bookmakers.find(b => b.key === key);
      if (bookmaker) {
        console.log(`  - ${bookmaker.title} (${bookmaker.key})`);
      }
    });

    const remaining = OddsAPIIO.getRemainingRequests();
    console.log(`\n📊 Remaining requests: ${remaining}/5000`);
  } catch (error: any) {
    console.error('❌ Error fetching bookmakers:', error.message);
  }
  console.log();

  // Summary
  console.log('='.repeat(80));
  console.log('📋 Test Summary');
  console.log('='.repeat(80));
  const finalRemaining = OddsAPIIO.getRemainingRequests();
  const used = 5000 - (finalRemaining || 0);
  console.log(`Total API calls made: ~${used}`);
  console.log(`Remaining requests: ${finalRemaining}/5000`);
  console.log(`\n✅ All tests completed! Check output above for any errors.`);
  console.log();
}

// Run tests
testOddsAPIIO().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
