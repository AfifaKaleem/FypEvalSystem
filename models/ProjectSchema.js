

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
        default: 'rehearse'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const ProjectProposal = mongoose.model('ProjectProposal', projectSchema);

module.exports = ProjectProposal;
