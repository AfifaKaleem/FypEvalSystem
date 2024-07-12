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

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
