const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  jobRole: String,
  difficulty: String,
  status: {
    type: String,
    default: 'pending'
  },
  overallScore: Number
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
