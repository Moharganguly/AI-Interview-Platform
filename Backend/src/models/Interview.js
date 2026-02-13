const Interview = require('../models/Interview');
const User = require('../models/User');

// @desc Get all interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(interviews);
  } catch (error) {
    console.error("GET ALL INTERVIEWS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const interviews = await Interview.find({ user: req.params.id })
      .sort({ createdAt: -1 });

    const completed = interviews.filter(i => i.status === 'completed');
    const scored = completed.filter(i => i.overallScore !== undefined && i.overallScore !== null);

    const averageScore = scored.length > 0
      ? scored.reduce((sum, i) => sum + i.overallScore, 0) / scored.length
      : 0;

    res.status(200).json({
      user,
      interviews,
      stats: {
        totalInterviews: interviews.length,
        completedInterviews: completed.length,
        averageScore
      }
    });

  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Interview.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'User and all associated data deleted successfully'
    });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
