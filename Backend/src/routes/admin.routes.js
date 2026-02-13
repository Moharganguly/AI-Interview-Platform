// Admin Routes
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { 
  getAllUsers, 
  getAllInterviews, 
  getUserById,
  deleteUser,
  getAdminStats,
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  getUsers,
  getAnalytics
} = require('../controllers/admin.controller');

// Admin middleware - checks if user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Admin access required' });
  }
};

// New admin panel routes
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserById);
router.get('/interviews', protect, adminOnly, getAllInterviews);
router.get('/stats', protect, adminOnly, getAdminStats);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// Your existing routes (keep these if they're being used)
router.post('/questions', protect, adminOnly, createQuestion);
router.get('/questions', protect, adminOnly, getQuestions);
router.put('/questions/:id', protect, adminOnly, updateQuestion);
router.delete('/questions/:id', protect, adminOnly, deleteQuestion);
router.get('/analytics', protect, adminOnly, getAnalytics);

module.exports = router;