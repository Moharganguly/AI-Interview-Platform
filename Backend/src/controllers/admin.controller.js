
const Question = require('../models/Question');
const User = require('../models/User');
const Interview = require('../models/Interview');


exports.createQuestion = async (req, res) => {
  try {
    res.status(201).json({ message: 'Question created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    res.status(200).json({ questions: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    res.status(200).json({ message: 'Question updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    res.status(200).json({ users: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    res.status(200).json({ analytics: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(interviews);
  } catch (error) {
    console.error("GET ALL INTERVIEWS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};




exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const interviews = await Interview.find({ userId: req.params.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      user,
      interviews,
      stats: {
        totalInterviews: interviews.length,
        completedInterviews: interviews.filter(i => i.status === 'completed').length,
        averageScore: interviews.length > 0
          ? interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / interviews.length
          : 0
      }
    });
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Interview.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      message: 'User and all associated data deleted successfully' 
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const completedInterviews = await Interview.countDocuments({ status: 'completed' });
    
    const interviews = await Interview.find({ overallScore: { $ne: null } });
    const avgScore = interviews.length > 0
      ? interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length
      : 0;

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const interviewsByStatus = await Interview.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalUsers,
      totalInterviews,
      completedInterviews,
      averageScore: avgScore.toFixed(2),
      usersByRole,
      interviewsByStatus
    });
  } catch (error) {
    console.error("GET ADMIN STATS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};