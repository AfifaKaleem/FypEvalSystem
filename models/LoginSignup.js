const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// const server = require('./server');

//define the LoginSignUp Schema 
const LoginSignUpSchema = new mongoose.Schema({
    username :{
        type: String,
        minlength: 3,
        maxlength: 16,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        match: [/(.*@student\.uol\.edu\.pk$|.*@faculty\.uol\.edu\.pk$|.*@admin\.uol\.edu\.pk$)/, 'Invalid email domain']
    },
    password: {
        type:String,
        required : true, 
        unique: true
    },
    
    // confirmpassword:{
    //     type: String,
    //     required: true
    // }
});

LoginSignUpSchema.pre('save', async function(next){
    const user = this;

    //hash the password only if it has been modified( or is new)
    if(!user.isModified('password')) return next();
    try{
        // hash password generate
        //const salt = 'this is salt;  //it will create security issue and this salt is not effective way to use 

        const salt = await bcrypt.genSalt(10);

        //hash password
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();

    }catch(err){
        return next(err);

    }
})

//afifa ---> kdbfihsgifkdrnglndrov^7hfb6778
//login --> wrong password

//kdbfihsgifkdrnglndrov^7hfb6778 ---> extract salt
//salt+ wrong password --> hash --> cshdfisvh cd,cnxjlnvdv;


LoginSignUpSchema.methods.comparePassword  = async function(candidatePassword){
    try{
        //use bycrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

// // Pre-save middleware to validate that password and confirmpassword match
// SignUpSchema.pre('save', function (next) {
//     if (this.password !== this.confirmpassword) {
//       this.invalidate('confirmpassword', 'Password and confirmpassword do not match');
//     }
//     next();
//   });





//create LoginSignup model
const LoginSignup = mongoose.model('LoginSignup', LoginSignUpSchema);
module.exports = LoginSignup;

