// tools/test_analytics.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TOKEN = process.env.TEST_TOKEN || 'your_jwt_token_here';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

async function testAnalyticsEndpoints() {
  log.info('Starting Analytics API Tests...\n');

  try {
    // Test 1: Overall Performance
    log.info('Test 1: GET /api/analytics/overview');
    try {
      const performanceRes = await axios.get(`${BASE_URL}/analytics/overview`, { headers });
      log.success('Overall Performance endpoint working');
      console.log(JSON.stringify(performanceRes.data, null, 2));
      console.log();
    } catch (error) {
      log.error(`Overall Performance failed: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
      if (error.response?.status === 404) {
        console.log('   → No analytics data yet. Complete an interview first.');
      }
    }

    // Test 2: Strengths and Weaknesses
    log.info('Test 2: GET /api/analytics/strengths-weaknesses');
    try {
      const analysisRes = await axios.get(`${BASE_URL}/analytics/strengths-weaknesses`, { headers });
      log.success('Strengths & Weaknesses endpoint working');
      console.log(JSON.stringify(analysisRes.data, null, 2));
      console.log();
    } catch (error) {
      log.error(`Strengths & Weaknesses failed: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
      if (error.response?.status === 404) {
        console.log('   → No analytics data yet. Complete an interview first.');
      }
    }

    // Test 3: Scores by Role and Level
    log.info('Test 3: GET /api/analytics/scores-by-role');
    try {
      const scoresRes = await axios.get(`${BASE_URL}/analytics/scores-by-role`, { headers });
      log.success('Scores by Role endpoint working');
      console.log(JSON.stringify(scoresRes.data, null, 2));
      console.log();
    } catch (error) {
      log.error(`Scores by Role failed: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
      if (error.response?.status === 404) {
        console.log('   → No analytics data yet. Complete an interview first.');
      }
    }

    // Test 4: Total Attempts
    log.info('Test 4: GET /api/analytics/total-attempts');
    try {
      const attemptsRes = await axios.get(`${BASE_URL}/analytics/total-attempts`, { headers });
      log.success('Total Attempts endpoint working');
      console.log(JSON.stringify(attemptsRes.data, null, 2));
      console.log();
    } catch (error) {
      log.error(`Total Attempts failed: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
      if (error.response?.status === 404) {
        console.log('   → No analytics data yet. Complete an interview first.');
      }
    }

    // Test 5: Scores Trend
    log.info('Test 5: GET /api/analytics/scores-trend?limit=5');
    try {
      const trendRes = await axios.get(`${BASE_URL}/analytics/scores-trend?limit=5`, { headers });
      log.success('Scores Trend endpoint working');
      console.log(JSON.stringify(trendRes.data, null, 2));
      console.log();
    } catch (error) {
      log.error(`Scores Trend failed: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
      if (error.response?.status === 404) {
        console.log('   → No analytics data yet. Complete an interview first.');
      }
    }

    // Test 6: Dashboard (Comprehensive)
    log.info('Test 6: GET /api/analytics/dashboard');
    try {
      const dashboardRes = await axios.get(`${BASE_URL}/analytics/dashboard`, { headers });
      log.success('Dashboard endpoint working');
      console.log(JSON.stringify(dashboardRes.data, null, 2));
      console.log();
    } catch (error) {
      log.error(`Dashboard failed: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
      if (error.response?.status === 404) {
        console.log('   → No analytics data yet. Complete an interview first.');
      }
    }

    log.success('All tests completed!');

  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run tests
testAnalyticsEndpoints().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});

module.exports = { testAnalyticsEndpoints };
