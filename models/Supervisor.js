const mongoose = require('mongoose');
const ProjectSchema = require('./ProjectSchema');

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
        type:String,
        // required:true
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
            },
            projectProposal: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectProposal' ,projectName:mongoose.Schema.Types.String,proposalFile:mongoose.Schema.Types.String  },
            remarks: {
                type:String,
                default :'',
            }
        }
    
    ],
    
    

});

const Supervisor = mongoose.model('Supervisor', SupervisorSchema);

module.exports = Supervisor;
