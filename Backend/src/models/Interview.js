// @desc    Get all interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('user', 'name email role')  // ← Changed from 'userId'
      .sort({ createdAt: -1 });
    
    res.status(200).json(interviews);
  } catch (error) {
    console.error("GET ALL INTERVIEWS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const interviews = await Interview.find({ user: req.params.id })  // ← Changed from userId
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

// @desc    Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Interview.deleteMany({ user: req.params.id });  // ← Changed from userId
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      message: 'User and all associated data deleted successfully' 
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};