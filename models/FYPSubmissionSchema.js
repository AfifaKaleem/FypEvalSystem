const mongoose = require('mongoose');

const fypFullDocumentSubmissionSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true },
  supervisorEmail: { type: String },
  EvaluatorEmailOne: { type: String, required: true },
  EvaluatorEmailTwo: { type: String, required: true },
  phaseNumberOne: { type: String },
  phaseNumberTwo: { type: String },
  projectName: { type: String, required: true },
  projectFile: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },

  grading: {
    type: String,
    enum: ['isNotGraded', 'partiallyGraded', 'fullyGraded'],
    default: 'isNotGraded'
  },

  evaluatorOneMarks: { type: Number, default: 0 },
  evaluatorTwoMarks: { type: Number, default: 0 },

  evaluatorOneFeedback: { type: String, default: '' },
  evaluatorTwoFeedback: { type: String, default: '' },

  gradedBy: {
    type: {
      evaluatorOne: { type: Boolean, default: false },
      evaluatorTwo: { type: Boolean, default: false }
    },
    default: () => ({ evaluatorOne: false, evaluatorTwo: false })
  }
});


module.exports = mongoose.model('FypSubmissionSchema', fypFullDocumentSubmissionSchema);
