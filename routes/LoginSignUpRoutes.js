const express = require('express');
const router = express.Router();
const LoginSignup = require('./../models/LoginSignup');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');

//Post (create a data)
//signup
router.post('/signup', async (req, res) => {
    try {
        const data = req.body //assuming the request body contains the data 
        const newLoginSignup = new LoginSignup(data);
        //save the new id to the database
        const response = await newLoginSignup.save();
        console.log('data saved');

        const payload = {
            id: response.id,
            username : response.username,
            email: response.email,
            password: response.password
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(response.username);
        console.log("Token is" ,token);


        // res.status(200).json(response);
        res.status(200).json({response: response, token: token});

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Internal server Error'
        });
    }
})

//login Route
router.post('/login', async(req,res)=>{
    try{
        //extract email and password
        const{email, password}= req.body;

        //find the emailid by email
        const Email = await LoginSignup.findOne({email,email});
        
        //if email doesnot exist or password does not match, return error
         if(!Email || !(await Email.comparePassword(password))){
            return res.status(401).json({error: 'Invalid email or password .This email doesnot exists'});
         }

         //generate tokens 
         const payload ={
            id : Email.id,
            email : Email.email,
            password: Email.password
         }
         const token = generateToken(payload);

         //return token as response
         res.json({token,Email:email,payload:payload});
         
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server Error'});
    }
})

//logout router
router.post('/logout', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user exists by email
        const user = await LoginSignup.findOne({ email });

        //if user doesnot exist then show the status as user not found
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Here you can perform any necessary logout logic, such as deleting a field in the user record
        // Example: set a 'loggedIn' field to false
        user.loggedIn = false;
        await user.deleteOne();
        res.json({message: 'Logged out successfully' ,user:user});
        console.log('User logged out successfully');
        // res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Get router(fetch the data )
router.get('/',async (req, res) => {
    try {
        const userId = req.params.userId;

        const data = await LoginSignup.find(userId);
        console.log('data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
})

//Profile route
router.get('/profile',jwtAuthMiddleware, async(req,res)=>{
    try{
        const userData = req.user;
        console.log("User Data", userData);

        const userId = userData.id;
        const user = await LoginSignup.findById(userId);

        res.status(200).json({user});

    }catch(err){
        console.log(err);
        res.status(500).json({error: "internal Server Error"});
    }
})

//update router
router.put('/:id',async (req,res)=>{
    try{
        //extract id from url parameter
        const LoginSignUpId = req.params.id;
        //updated data for the person
        const updatedLoginSignUpData = req.body;

        const response = await LoginSignup.findByIdAndUpdate(LoginSignUpId, updatedLoginSignUpData, {
            new:true,// return the updated document 
            runValidators :true, //run mongoose validation
        })

        if(!response){
            return res.status(404).json({error: 'Person not foumd'});
        }

        console.log('data updated');
        res.status(200).json(response);
    }catch(err){
         console.log(err);
         res.status(500).json({error: 'Internal Server Error'});
    }
})

//update only password
router.put('/:id/password',async(req,res)=>{
    try{
        const password = req.params.password;
        const updatePassword = req.password;
        const response = await LoginSignup.findOneAndReplace(password, updatePassword);
        
        if(!response){
            return res.status(404).json({error: "User not found to update password"});
        }
        console.log('Password successfully updated');
        res.status(200).json({response});
    }catch(err){
        console.log(err);
        res.status(500).json({error :"Internal Server Error"});
    }
})



router.delete('/:id',async(req,res)=>{
    try{
        //extract the person's ID from the URL parameter
        const LoginSignUpId = req.params.id;

        //Assuming you have a Person model
        const response = await LoginSignup.findByIdAndDelete(LoginSignUpId);
        
        if(!response){
            return res.status(404).json({error: 'User not foumd'});
        }

        console.log('data deleted');
        res.status(200).json({message : 'User deleted succesfully'}); 
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})



module.exports = router;

