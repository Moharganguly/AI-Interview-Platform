const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true
    },
    relevance: Number,
    clarity: Number,
    completeness: Number,
    confidence: Number,
    sentiment: String,
    overallScore: Number,
    feedback: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Score", scoreSchema);
