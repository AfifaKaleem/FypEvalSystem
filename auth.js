
const passport = require('passport');
//username and password based  designed for authenticaion
//extract username and password from req.body
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(async(username,password,done)=>{
    //authenticate logic here
    try{
        console.log('Received credentials', username, password);
        const user = await LoginSignup.findOne({username, username});
        if(!user)
            return done(null ,false, {message : 'Incorrect username'});

        const isPasswordMatch = user.password === password ?true: fasle;
        if(isPasswordMatch){
            return done(null, user);
        }else{
            return done(null, fasle ,{message :'Incorrect Password'});
        }
    }catch(err){
        return done(err);
    }
}))

module.exports = passport;




// const LocalAuthMiddleware = passport.authenticate('local',{session:true})