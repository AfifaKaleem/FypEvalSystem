// const mongoose = require('mongoose');
// const ProjectSchema = new mongoose.Schema({
//     studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
//     supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "Supervisor", required: true },
//     projectName: { type: String, required: true },
//     proposalFile: { type: String, required: true }, // Path to the uploaded PDF file
//     status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
//     submittedAt: { type: Date, default: Date.now },
//     remarks: {type:mongoose.Schema.Types.String, default:'', ref:"Supervisor"}
// });

// module.exports = mongoose.model("ProjectSchema", ProjectSchema);


const mongoose = require('mongoose');

const projectProposalSchema = new mongoose.Schema({
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
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    remarks: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const ProjectProposal = mongoose.model('ProjectProposal', projectProposalSchema);

module.exports = ProjectProposal;

// var proposalTemplateSchema = new mongoose.Schema({
//     fileName:{
//         type:String,
//         default: " "
//     },
//     filedownloadedBy:{
//         Student: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'Student',
//                 username: mongoose.Schema.Types.String,
//                 email: mongoose.Schema.Types.String
//             },
//         Supervisor:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Supervisors",
//             username: mongoose.Schema.Types.String,
//             email: mongoose.Schema.Types.String
//         },
//         Evaluators :{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Evaluators",
//             username: mongoose.Schema.Types.String,
//             email: mongoose.Schema.Types.String
//         }
//     },
//     DateandTime :{
//         type: String,
//     },


// })

// const proposal = mongoose.model('proposal',proposalSchema);
// const proposalTemplate = mongooose.model('proposalTemplate',proposalTemplateSchema);
// module.exports = {
//     proposal,
//     proposalTemplate
// }


