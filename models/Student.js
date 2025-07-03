

const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  credit_hours: { type: Number, required: true },
  semester: { type: Number, required: true },
  department: { type: String, required: true },
evaluatorOne: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluator' },
evaluatorOneEmail: { type: String },
evaluatorOneName: { type: String },

evaluatorTwo: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluator' },
evaluatorTwoEmail: { type: String },
evaluatorTwoName: { type: String },


  isEligible: { type: Boolean, default: false },

  supervisorRequest: [
    {
      supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor' },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'] },
      projectProposal: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectProposal' }
    }
  ]
});

StudentSchema.pre('save', function (next) {
  this.isEligible = this.credit_hours >= 91 && [6, 7, 8].includes(this.semester);
  next();
});

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;
