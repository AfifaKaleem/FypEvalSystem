const mongoose = require('mongoose');
const Student = require('./Student');

var proposalSchema = new mongoose.Schema({
    fileName: {type: String, default: ''},
    submittedBy: String,
    status: {type: String, default: ''},
    remarks: {type: String, default: ''}
});


var proposalTemplateSchema = new mongoose.Schema({
    fileName:{
        type:String,
        default: " "
    },
    filedownloadedBy:{
        Student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
                username: mongoose.Schema.Types.String,
                email: mongoose.Schema.Types.String
            },
        Supervisor:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supervisors",
            username: mongoose.Schema.Types.String,
            email: mongoose.Schema.Types.String
        },
        Evaluators :{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Evaluators",
            username: mongoose.Schema.Types.String,
            email: mongoose.Schema.Types.String
        }
    },
    DateandTime :{
        type: String,
    },


})
const proposal = mongoose.model('proposal',proposalSchema);
const proposalTemplate = mongooose.model('proposalTemplate',proposalTemplateSchema);
module.exports = {
    proposal,
    proposalTemplate
}
