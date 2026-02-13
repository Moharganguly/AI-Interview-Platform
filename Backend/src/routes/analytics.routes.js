// routes/analytics.routes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getOverallPerformance,
  getStrengthsAndWeaknesses,
  getScoresByRoleAndLevel,
  getTotalAttempts,
  getScoresTrend,
  getDashboard
} = require("../controllers/analyticsController");

/**
 * Analytics Routes
 * All routes require authentication via protect middleware
 */

// Overall performance metrics
router.get("/overview", protect, getOverallPerformance);

// Strengths and weaknesses analysis
router.get("/strengths-weaknesses", protect, getStrengthsAndWeaknesses);

// Average scores by role and level
router.get("/scores-by-role", protect, getScoresByRoleAndLevel);

// Total attempts grouped by type
router.get("/total-attempts", protect, getTotalAttempts);

// Scores trend over time
router.get("/scores-trend", protect, getScoresTrend);

// Comprehensive dashboard
router.get("/dashboard", protect, getDashboard);

module.exports = router;
