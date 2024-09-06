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
    studentRequests: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
                email: mongoose.Schema.Types.String,
                username : mongoose.Schema.Types.String
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            }
        }
    
    ]

});

const Supervisor = mongoose.model('Supervisor', SupervisorSchema);

module.exports = Supervisor;
