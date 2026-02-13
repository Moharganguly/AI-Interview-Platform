const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  submitAnswer,
  getInterviewAnalytics,
  getScoresOverTime,
  getStrengthsAndWeaknesses,
  getDashboardChartData
} = require("../controllers/interviewController");



router.post("/answer", protect, submitAnswer);

router.post("/", protect, createInterview);
router.get("/", protect, getInterviews);

// Analytics routes
router.get("/analytics/scores-over-time", protect, getScoresOverTime);
router.get("/analytics/strengths-weaknesses", protect, getStrengthsAndWeaknesses);
router.get("/analytics/dashboard", protect, getDashboardChartData);

// Specific interview routes (must be after analytics routes)
router.get("/:id/analytics", protect, getInterviewAnalytics);
router.get("/:id", protect, getInterviewById);
router.put("/:id", protect, updateInterview);
router.delete("/:id", protect, deleteInterview);




module.exports = router;
