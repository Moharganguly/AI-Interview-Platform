// services/analytics.service.js
const Score = require('../models/Score');
const Interview = require('../models/Interview');

/**
 * Get overall performance metrics for a user
 */
async function getOverallPerformance(userId) {
  const scores = await Score.find({ user: userId });

  if (!scores.length) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      progress: 0
    };
  }

  const allScores = scores.map(s => s.overallScore);
  const firstScore = allScores[0];
  const lastScore = allScores[allScores.length - 1];
  const progressPercent = firstScore > 0 ? ((lastScore - firstScore) / firstScore * 100).toFixed(1) : 0;

  return {
    totalAttempts: scores.length,
    averageScore: parseFloat((scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length).toFixed(1)),
    bestScore: Math.max(...allScores),
    worstScore: Math.min(...allScores),
    progress: parseFloat(progressPercent)
  };
}

/**
 * Get strengths and weaknesses analysis
 */
async function getStrengthsAndWeaknesses(userId) {
  const scores = await Score.find({ user: userId });

  if (!scores.length) {
    return {
      strengths: [],
      weaknesses: [],
      metrics: {},
      recommendations: {}
    };
  }

  // Calculate average for each metric
  const metrics = {
    relevance: 0,
    clarity: 0,
    completeness: 0,
    confidence: 0
  };

  scores.forEach(s => {
    metrics.relevance += s.relevance;
    metrics.clarity += s.clarity;
    metrics.completeness += s.completeness;
    metrics.confidence += s.confidence;
  });

  Object.keys(metrics).forEach(k => {
    metrics[k] = parseFloat((metrics[k] / scores.length).toFixed(1));
  });

  // Categorize strengths and weaknesses
  const strengths = Object.entries(metrics)
    .filter(([_, score]) => score >= 7)
    .map(([metric, score]) => ({ metric, score }))
    .sort((a, b) => b.score - a.score);

  const weaknesses = Object.entries(metrics)
    .filter(([_, score]) => score < 7)
    .map(([metric, score]) => ({ metric, score }))
    .sort((a, b) => a.score - b.score);

  const sentimentCounts = {};
  scores.forEach(s => {
    sentimentCounts[s.sentiment] = (sentimentCounts[s.sentiment] || 0) + 1;
  });

  return {
    strengths: strengths.length > 0 ? strengths : [],
    weaknesses: weaknesses.length > 0 ? weaknesses : [],
    metrics,
    sentiment: sentimentCounts,
    recommendations: generateRecommendations(weaknesses)
  };
}

/**
 * Get average scores by interview role and level
 */
async function getAverageScoresByRoleAndLevel(userId) {
  const scores = await Score.find({ user: userId }).populate('interview', 'role level');

  if (!scores.length) {
    return {};
  }

  const groupedData = {};

  scores.forEach(score => {
    const key = `${score.interview.role}_${score.interview.level}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        role: score.interview.role,
        level: score.interview.level,
        scores: [],
        count: 0,
        total: 0
      };
    }
    groupedData[key].scores.push(score.overallScore);
    groupedData[key].total += score.overallScore;
    groupedData[key].count += 1;
  });

  const result = {};
  Object.entries(groupedData).forEach(([key, data]) => {
    result[key] = {
      role: data.role,
      level: data.level,
      averageScore: parseFloat((data.total / data.count).toFixed(1)),
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
  const scores = await Score.find({ user: userId }).populate('interview');

  if (!scores.length) {
    return { total: 0, byRole: {}, byLevel: {} };
  }

  const byRole = {};
  const byLevel = {};
  let total = 0;

  scores.forEach(score => {
    const role = score.interview.role;
    const level = score.interview.level;

    byRole[role] = (byRole[role] || 0) + 1;
    byLevel[level] = (byLevel[level] || 0) + 1;
    total += 1;
  });

  return {
    total,
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
  const scores = await Score.find({ user: userId })
    .populate('interview', 'role level')
    .sort({ createdAt: 1 })
    .limit(limit);

  if (!scores.length) {
    return [];
  }

  return scores.map((score, index) => ({
    attemptNumber: index + 1,
    overallScore: score.overallScore,
    relevance: score.relevance,
    clarity: score.clarity,
    completeness: score.completeness,
    confidence: score.confidence,
    interview: score.interview.role,
    level: score.interview.level,
    date: score.createdAt,
    sentiment: score.sentiment
  }));
}

/**
 * Helper function to generate recommendations based on weaknesses
 */
function generateRecommendations(weaknesses) {
  const recommendations = {};

  weaknesses.forEach(({ metric }) => {
    switch (metric) {
      case 'relevance':
        recommendations.relevance = "Focus on understanding the question deeply and provide relevant examples from your experience.";
        break;
      case 'clarity':
        recommendations.clarity = "Practice structuring your thoughts and explaining concepts in a clear, concise manner.";
        break;
      case 'completeness':
        recommendations.completeness = "Provide more detailed answers and ensure you cover all aspects of the question.";
        break;
      case 'confidence':
        recommendations.confidence = "Practice interviews regularly to build confidence. Review past answers to improve.";
        break;
      default:
        break;
    }
  });

  return recommendations;
}

module.exports = {
  getOverallPerformance,
  getStrengthsAndWeaknesses,
  getAverageScoresByRoleAndLevel,
  getTotalAttemptsByType,
  getDashboardAnalytics,
  getScoresTrend
};
