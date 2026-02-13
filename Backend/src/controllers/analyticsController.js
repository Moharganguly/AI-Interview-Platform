// controllers/analyticsController.js
const analyticsService = require('../services/analytics.service');

/**
 * GET /api/analytics/overview
 * Get overall performance metrics for the authenticated user
 */
exports.getOverallPerformance = async (req, res) => {
  try {
    const performance = await analyticsService.getOverallPerformance(req.user.id);
    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error("GET OVERALL PERFORMANCE ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/analytics/strengths-weaknesses
 * Get strengths and weaknesses analysis
 */
exports.getStrengthsAndWeaknesses = async (req, res) => {
  try {
    const analysis = await analyticsService.getStrengthsAndWeaknesses(req.user.id);
    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error("GET STRENGTHS AND WEAKNESSES ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/analytics/scores-by-role
 * Get average scores grouped by interview role and level
 */
exports.getScoresByRoleAndLevel = async (req, res) => {
  try {
    const scores = await analyticsService.getAverageScoresByRoleAndLevel(req.user.id);
    res.status(200).json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error("GET SCORES BY ROLE ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/analytics/total-attempts
 * Get total attempts grouped by interview type
 */
exports.getTotalAttempts = async (req, res) => {
  try {
    const attempts = await analyticsService.getTotalAttemptsByType(req.user.id);
    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error("GET TOTAL ATTEMPTS ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/analytics/scores-trend
 * Get scores trend over time
 */
exports.getScoresTrend = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const trend = await analyticsService.getScoresTrend(req.user.id, parseInt(limit));
    res.status(200).json({
      success: true,
      data: trend
    });
  } catch (error) {
    console.error("GET SCORES TREND ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/analytics/dashboard
 * Get comprehensive analytics dashboard data
 */
exports.getDashboard = async (req, res) => {
  try {
    const dashboard = await analyticsService.getDashboardAnalytics(req.user.id);
    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
