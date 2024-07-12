const mongoose = require('mongoose');
const EvaluatorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    office:{
        type:String,
        required:true,
    },
    studentsAssigned : [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
                email: mongoose.Schema.Types.String,
                username : mongoose.Schema.Types.String
            },
            status: {
                type: String,
                enum: ['isAssigned', 'isNotAssigned'],
                default: 'isAssigned'
            }
        }
    ]
});

const Evaluator = mongoose.model('Evaluator', EvaluatorSchema);
// Export models
module.exports = Evaluator;