

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    supervisorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supervisor',
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    proposalFile: {
        type: String, // Path to the uploaded file
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'rehearse'],
       
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    projectId: { type: String, default: null },
evaluatorOneEmail: { type: String },
evaluatorTwoEmail: { type: String },
evaluators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evaluator' }]

});

const ProjectProposal = mongoose.model('ProjectProposal', projectSchema);

module.exports = ProjectProposal;
