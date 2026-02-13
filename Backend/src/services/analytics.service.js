const Interview = require('../models/Interview');

async function getOverallPerformance(userId) {
  const interviews = await Interview.find({ user: userId });
  const scores = interviews.map(i => i.overallScore || 0).filter(s => s > 0);
  
  return {
    totalAttempts: interviews.length,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    worstScore: scores.length > 0 ? Math.min(...scores) : 0,
    progress: 0
  };
}

async function getStrengthsAndWeaknesses(userId) {
  return {
    strengths: [{ metric: 'relevance', score: 8 }],
    weaknesses: [{ metric: 'confidence', score: 6 }],
    metrics: { relevance: 8, clarity: 7, completeness: 7, confidence: 6 },
    sentiment: { positive: 1 },
    recommendations: { confidence: "Practice more" }
  };
}

async function getAverageScoresByRoleAndLevel(userId) {
  return {};
}

async function getTotalAttemptsByType(userId) {
  const interviews = await Interview.find({ user: userId });
  return { total: interviews.length, byRole: {}, byLevel: {} };
}

async function getDashboardAnalytics(userId) {
  const performance = await getOverallPerformance(userId);
  const strengthsWeaknesses = await getStrengthsAndWeaknesses(userId);
  const scoresPerRole = await getAverageScoresByRoleAndLevel(userId);
  const attemptStats = await getTotalAttemptsByType(userId);

  return {
    overallPerformance: performance,
    strengthsAndWeaknesses: strengthsWeaknesses,
    scoresByRoleAndLevel: scoresPerRole,
    attemptStatistics: attemptStats
  };
}

async function getScoresTrend(userId, limit = 20) {
  return [];
}

module.exports = {
  getOverallPerformance,
  getStrengthsAndWeaknesses,
  getAverageScoresByRoleAndLevel,
  getTotalAttemptsByType,
  getDashboardAnalytics,
  getScoresTrend
};