
const mongoose = require('mongoose');

const ChapterWiseSubmissionSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true
  },
  supervisorEmail: {
    type: String,
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  chapterNumber: {
    type: Number,
    required: true
  },
  chapterFile: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending'
  },
  grading: {
    type: String,
    default: 'isNotGraded'
  },
  marks: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('ChapterWiseSubmission', ChapterWiseSubmissionSchema);
