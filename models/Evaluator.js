// models/Evaluator.js
const mongoose = require('mongoose');

const EvaluatorSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  office: { type: String },
  domain: [{ type: String }],
  
  studentsAssigned: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      studentName: { type: String },
      studentEmail: { type: String },
      status: {
        type: String,
        enum: ['isAssigned', 'isNotAssigned'],
        default: 'isAssigned'
      }
    }
  ],

  gradingHistory: [
    {
      studentEmail: { type: String, required: true },
      phase: { type: String, required: true },         // e.g., "Phase 1"
      grade: { type: Number, required: true },
      feedback: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Evaluator', EvaluatorSchema);
