const mongoose = require('mongoose');


//define the AnnoucementSchema
const AnnoucementSchema = new mongoose.Schema({
   

})
//create LoginSignup model
const LoginSignup = mongoose.model('LoginSignup', LoginSignUpSchema);
module.exports = LoginSignup;