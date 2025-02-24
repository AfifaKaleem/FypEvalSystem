const mongoose = require('mongoose');

const SupervisorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    domain: [
        {
            type: String,
            required: true
        }
    ],
    office: {
        type: String,
        required: true
    },
    position: {
        type: String
    },
    studentRequests: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student' // ✅ Only ObjectId with Reference (No additional fields here)
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            },
            projectProposal: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'ProjectProposal', // ✅ Correct Reference to ProjectProposal
            }
        }
    ]
});

const Supervisor = mongoose.model('Supervisor', SupervisorSchema);

module.exports = Supervisor;
