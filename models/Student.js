const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    credit_hours: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluator' },
    isEligible: { type: Boolean, default: false },
    supervisorRequest: {
        supervisor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supervisor',
            username: mongoose.Schema.Types.String,
            email: mongoose.Schema.Types.String
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    }
});



// Middleware to check eligibility
StudentSchema.pre('save', function(next) {
    if (this.credit_hours >= 91 && this.semester >= 6) {
      this.isEligible = true;
    }else {
      this.isEligible = false;
    }

    if(this.credit_hours >=107 && this.semester >=7){
        this.isEligible = true;
    }else{
        this.isEligible = false;
    }

    if(this.credit_hours >=122 || this.credit_hours <130 && this.semester >=8){
        this.isEligible = true;
    }else{
        this.isEligible = false;
    }
    
    next();
  });

const Student = mongoose.model('Student', StudentSchema);
// const proposal = mongoose.model('proposal', proposalSchema);

module.exports = Student;
