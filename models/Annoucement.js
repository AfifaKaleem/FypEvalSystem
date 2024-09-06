const mongoose = require('mongoose');


//define the AnnoucementSchema
const AnnoucementSchema = new mongoose.Schema({
   content :{
    type:String,
    required:true
   },
   DateandTime :{
    type: Date ,
    required: true
   },
   author: {
    type: mongoose.Schema.Types.String,
    ref: "FypHead",
    required: true
   },
   audience: {
    type: [String],
    enum: ["Evaluator", "Students","Supervisors","Admin"],
    required: true
   }

})
//create LoginSignup model
const Annoucement= mongoose.model('AnnoucementSchema', AnnoucementSchema);
module.exports = Annoucement;