// controllers/interviewController.js
const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const Score = require('../models/Score');
const axios = require('axios');

// CREATE INTERVIEW
exports.createInterview = async (req, res) => {
  try {
    const { role, level, questions } = req.body;

    if (!role || !level || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Role, level, and non-empty questions array are required" });
    }

    const newInterview = await Interview.create({
      user: req.user.id,
      role,
      level,
      questions,
    });

    res.status(201).json(newInterview);
  } catch (error) {
    console.error("CREATE INTERVIEW ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET ALL INTERVIEWS
exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ interviews });
  } catch (error) {
    console.error("GET INTERVIEWS ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET INTERVIEW BY ID
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    // Optional: restrict access to owner
    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(interview);
  } catch (error) {
    console.error("GET INTERVIEW BY ID ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE INTERVIEW
exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { role, level, questions } = req.body;

    interview.role = role || interview.role;
    interview.level = level || interview.level;
    interview.questions = questions || interview.questions;

    await interview.save();
    res.status(200).json(interview);
  } catch (error) {
    console.error("UPDATE INTERVIEW ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE INTERVIEW
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await interview.deleteOne();
    res.status(200).json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.error("DELETE INTERVIEW ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// SUBMIT ANSWER & EVALUATE VIA AI
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, question, answerText } = req.body;

    if (!interviewId || !question || !answerText) {
      return res.status(400).json({ message: "interviewId, question, and answerText are required" });
    }

    // Normalize and validate ObjectId format
    const interviewIdStr = String(interviewId);
    if (!mongoose.Types.ObjectId.isValid(interviewIdStr)) {
      return res.status(400).json({ message: "Invalid interviewId format" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Call AI service
    let aiResult;
    try {
      const aiResponse = await axios.post(
        "http://127.0.0.1:8000/ai/evaluate",
        { interviewId, question, answerText }
      );
      aiResult = aiResponse.data;
    } catch (aiError) {
      console.error("AI Service Error:", aiError.message);
      return res.status(502).json({ message: "Failed to evaluate answer via AI service" });
    }

    // Confirm interview exists and belongs to user
    let interviewDoc;
    try {
      interviewDoc = await Interview.findById(interviewIdStr);
    } catch (castErr) {
      return res.status(400).json({ message: "Invalid interviewId format" });
    }
    if (!interviewDoc) return res.status(404).json({ message: "Interview not found" });
    if (interviewDoc.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Save score
    const score = await Score.create({
      user: req.user.id,
      interview: interviewDoc._id,
      relevance: aiResult.relevance || 0,
      clarity: aiResult.clarity || 0,
      completeness: aiResult.completeness || 0,
      confidence: aiResult.confidence || 0,
      sentiment: aiResult.sentiment || "neutral",
      overallScore: aiResult.overallScore || 0,
      feedback: aiResult.feedback || ""
    });

    res.status(201).json({ message: "Answer evaluated and saved successfully", score });
  } catch (error) {
    console.error("SUBMIT ANSWER ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};
exports.getInterviewAnalytics = async (req, res) => {
  try {
    const interviewId = req.params.id;

    const scores = await Score.find({
      interview: interviewId,
      user: req.user.id
    });

    if (!scores.length) {
      return res.status(404).json({ message: "No analytics found" });
    }

    const total = scores.reduce((sum, s) => sum + s.overallScore, 0);
    const averageScore = (total / scores.length).toFixed(1);

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

    Object.keys(metrics).forEach(
      k => (metrics[k] = metrics[k] / scores.length)
    );

    const strengths = Object.keys(metrics).filter(k => metrics[k] >= 7);
    const weaknesses = Object.keys(metrics).filter(k => metrics[k] < 7);

    res.status(200).json({
      attempts: scores.length,
      averageScore,
      strengths,
      weaknesses,
      scores: scores.map(s => ({
        overallScore: s.overallScore,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SCORES OVER TIME (ALL INTERVIEWS)
exports.getScoresOverTime = async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user.id })
      .populate('interview', 'role level')
      .sort({ createdAt: 1 });

    if (!scores.length) {
      return res.status(404).json({ message: "No scores found" });
    }

    // Format data for line chart
    const chartData = scores.map((score, index) => ({
      attempt: index + 1,
      overallScore: score.overallScore,
      relevance: score.relevance,
      clarity: score.clarity,
      completeness: score.completeness,
      confidence: score.confidence,
      interview: score.interview.role,
      level: score.interview.level,
      date: score.createdAt
    }));

    // Calculate trend
    const avgScore = (scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length).toFixed(1);
    const minScore = Math.min(...scores.map(s => s.overallScore));
    const maxScore = Math.max(...scores.map(s => s.overallScore));

    res.status(200).json({
      totalAttempts: scores.length,
      averageScore: avgScore,
      minScore,
      maxScore,
      chartData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET STRENGTHS & WEAKNESSES (ALL INTERVIEWS)
exports.getStrengthsAndWeaknesses = async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user.id });

    if (!scores.length) {
      return res.status(404).json({ message: "No scores found" });
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

    // Sentiment analysis
    const sentimentCounts = {};
    scores.forEach(s => {
      sentimentCounts[s.sentiment] = (sentimentCounts[s.sentiment] || 0) + 1;
    });

    res.status(200).json({
      allMetrics: metrics,
      strengths: strengths.length > 0 ? strengths : ["Keep practicing to identify strengths"],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["All metrics are strong!"],
      sentiment: sentimentCounts,
      recommendations: generateRecommendations(weaknesses)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET CHART-READY DATA (AGGREGATED)
exports.getDashboardChartData = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id });
    const scores = await Score.find({ user: req.user.id }).populate('interview');

    if (!scores.length) {
      return res.status(404).json({ message: "No data available for dashboard" });
    }

    // Average score per interview
    const avgPerInterview = {};
    const countPerInterview = {};

    scores.forEach(score => {
      const interviewId = score.interview._id.toString();
      avgPerInterview[interviewId] = (avgPerInterview[interviewId] || 0) + score.overallScore;
      countPerInterview[interviewId] = (countPerInterview[interviewId] || 0) + 1;
    });

    const interviewStats = Object.keys(avgPerInterview).map(interviewId => {
      const interview = scores.find(s => s.interview._id.toString() === interviewId)?.interview;
      return {
        interviewId,
        role: interview?.role,
        level: interview?.level,
        averageScore: parseFloat((avgPerInterview[interviewId] / countPerInterview[interviewId]).toFixed(1)),
        attempts: countPerInterview[interviewId]
      };
    });

    // Metric trends
    const allScores = scores.map(s => s.overallScore);
    const metricTrends = {
      relevance: (scores.reduce((sum, s) => sum + s.relevance, 0) / scores.length).toFixed(1),
      clarity: (scores.reduce((sum, s) => sum + s.clarity, 0) / scores.length).toFixed(1),
      completeness: (scores.reduce((sum, s) => sum + s.completeness, 0) / scores.length).toFixed(1),
      confidence: (scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length).toFixed(1)
    };

    // Overall progress
    const firstScore = allScores[0];
    const lastScore = allScores[allScores.length - 1];
    const progressPercent = ((lastScore - firstScore) / firstScore * 100).toFixed(1);

    res.status(200).json({
      overallStats: {
        totalAttempts: scores.length,
        averageScore: (scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length).toFixed(1),
        bestScore: Math.max(...allScores),
        progress: parseFloat(progressPercent)
      },
      interviewStats,
      metricTrends,
      recentAttempts: scores.slice(-5).reverse().map(s => ({
        interview: s.interview.role,
        score: s.overallScore,
        date: s.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to generate recommendations
function generateRecommendations(weaknesses) {
  const recommendations = {};
  
  weaknesses.forEach(({ metric }) => {
    switch(metric) {
      case 'relevance':
        recommendations.relevance = "Focus on understanding the question and provide relevant examples";
        break;
      case 'clarity':
        recommendations.clarity = "Practice speaking clearly and organizing your thoughts better";
        break;
      case 'completeness':
        recommendations.completeness = "Provide more detailed answers and cover all aspects of the question";
        break;
      case 'confidence':
        recommendations.confidence = "Practice more to build confidence in your answers";
        break;
      default:
        break;
    }
  });

  return recommendations;
}
