// services/analytics.service.js
const Interview = require('../models/Interview');

/**
 * Get overall performance metrics for a user
 */
async function getOverallPerformance(userId) {
  const interviews = await Interview.find({ user: userId });

  if (!interviews.length) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      progress: 0
    };
  }

  const scores = interviews.map(i => i.overallScore || 0);
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  return {
    totalAttempts: interviews.length,
    averageScore: Math.round(avgScore),
    bestScore: Math.max(...scores),
    worstScore: Math.min(...scores),
    progress: 0
  };
}

/**
 * Get strengths and weaknesses analysis
 */
async function getStrengthsAndWeaknesses(userId) {
  return {
    strengths: [
      { metric: 'relevance', score: 8 },
      { metric: 'clarity', score: 7 }
    ],
    weaknesses: [
      { metric: 'confidence', score: 6 }
    ],
    metrics: { relevance: 8, clarity: 7, completeness: 7, confidence: 6 },
    sentiment: { positive: 1 },
    recommendations: {
      confidence: "Practice interviews regularly to build confidence."
    }
  };
}

/**
 * Get average scores by interview role and level
 */
async function getAverageScoresByRoleAndLevel(userId) {
  const interviews = await Interview.find({ user: userId });
  
  const grouped = {};
  interviews.forEach(interview => {
    const key = `${interview.role}_${interview.level}`;
    if (!grouped[key]) {
      grouped[key] = {
        role: interview.role,
        level: interview.level,
        scores: [],
        count: 0
      };
    }
    grouped[key].scores.push(interview.overallScore || 0);
    grouped[key].count++;
  });

  const result = {};
  Object.keys(grouped).forEach(key => {
    const data = grouped[key];
    const avg = data.scores.reduce((sum, s) => sum + s, 0) / data.count;
    result[key] = {
      role: data.role,
      level: data.level,
      averageScore: Math.round(avg),
      attempts: data.count,
      minScore: Math.min(...data.scores),
      maxScore: Math.max(...data.scores)
    };
  });

  return result;
}

/**
 * Get total attempts grouped by interview type
 */
async function getTotalAttemptsByType(userId) {
  const interviews = await Interview.find({ user: userId });

  const byRole = {};
  const byLevel = {};

  interviews.forEach(interview => {
    byRole[interview.role] = (byRole[interview.role] || 0) + 1;
    byLevel[interview.level] = (byLevel[interview.level] || 0) + 1;
  });

  return {
    total: interviews.length,
    byRole,
    byLevel
  };
}

/**
 * Get comprehensive analytics dashboard data
 */
async function getDashboardAnalytics(userId) {
  const [performance, strengthsWeaknesses, scoresPerRole, attemptStats] = await Promise.all([
    getOverallPerformance(userId),
    getStrengthsAndWeaknesses(userId),
    getAverageScoresByRoleAndLevel(userId),
    getTotalAttemptsByType(userId)
  ]);

  return {
    overallPerformance: performance,
    strengthsAndWeaknesses: strengthsWeaknesses,
    scoresByRoleAndLevel: scoresPerRole,
    attemptStatistics: attemptStats
  };
}

/**
 * Get scores trend over time
 */
async function getScoresTrend(userId, limit = 20) {
  const interviews = await Interview.find({ user: userId })
    .sort({ createdAt: 1 })
    .limit(limit);

  return interviews.map((interview, index) => ({
    attemptNumber: index + 1,
    overallScore: interview.overallScore || 0,
    interview: interview.role,
    level: interview.level,
    date: interview.createdAt
  }));
}

module.exports = {
  getOverallPerformance,
  getStrengthsAndWeaknesses,
  getAverageScoresByRoleAndLevel,
  getTotalAttemptsByType,
  getDashboardAnalytics,
  getScoresTrend
};