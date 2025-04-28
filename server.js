require('dotenv').config();

const express = require('express')
const fileUpload = require('express-fileupload');


const app = express();
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
const db = require('./db');
const LoginSignup = require('./models/LoginSignup');
// const Announcement = require('./models/Announcement');
const cors = require('cors');
const morgan = require('morgan');

const path = require('path');
const fs = require('fs');



const allowedOrigins = ['http://localhost:3000', 'http://192.168.18.30:3000'];
const multiCorsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      } 
    }
  };
app.use(cors(multiCorsOptions));


// app.use(morgan('tiny'));
// const Fyp = require('./models/Fyp');

const passport = require('passport');

//extract username and password from req.body
const LocalStrategy = require('passport-local').Strategy;

//done is the callback function that is provided by Passport to signal the completion of an authentication attempt

passport.use(new LocalStrategy(async(username,password,done)=>{
    //authenticate logic here
    try{
        //console.log('Received credentials', username, password);
        const user = await LoginSignup.findOne({username, username});
        if(!user)
            return done(null ,false, {message : 'Incorrect username'});

        const isPasswordMatch = await user.comparePassword(password);
        if(isPasswordMatch){
            return done(null, user);
        }else{
            return done(null, false ,{message :'Incorrect Password'});
        }
    }catch(err){
        return done(err);
    }
}))

app.use(passport.initialize());
// const LocalAuthMiddleware = passport.authenticate('local',{session:false})

//middleware function
const logRequest =(req,res,next)=>{
    console.log(`${new Date()} Request Mode to : ${req.originalUrl}`);
    next();
}

//use the middleware function
app.use(logRequest);

//import router files 
const LoginSignupRoutes = require('./routes/LoginSignUpRoutes');
const FypRoutes = require('./routes/FypRoutes');
const EvaluatorRoutes = require('./routes/EvaluatorRoutes');
const DiscussionRoutes = require('./routes/DiscussionRoutes');
const AnnouncementRoutes = require('./routes/AnnouncementRoutes');
const StudentRoutes = require('./routes/StudentRoutes');
const SupervisorRoutes = require('./routes/SupervisorRoutes');



// const studentRoutes = require('./routes/StudentRoutes');
// const supervisorRoutes = require('./routes/SupervisorRoutes');

// app.use('/student', studentRoutes);
// app.use('/supervisor', supervisorRoutes);


//use the routes
app.use('/loginsignup',LoginSignupRoutes);
app.use('/fyp', FypRoutes);
app.use('/evaluator', EvaluatorRoutes);
app.use('/discussion',DiscussionRoutes);
app.use('/announcement',AnnouncementRoutes);
app.use('/student',StudentRoutes);
app.use('/supervisor',SupervisorRoutes);



const fileRoutes = require('./routes/uploadRoutes'); // adjust the path as needed

// Serve static files (optional)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/file", fileRoutes);



//load the env file
const port = process.env.PORT||8080;

//to start the port 
app.listen(port, ()=>{
    console.log('listening to the port');
})
