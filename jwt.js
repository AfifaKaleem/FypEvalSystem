const jwt = require('jsonwebtoken');

const jwtAuthMiddleware =(req,res,next)=>{
    //first check request headers has authorization or not
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({error: 'Token not found'});
    


    //extract the jwt token from the request headers
    //bearer ncidsfyuebib = bearer token
    const token = req.headers.authorization.split(' ')[1];
    //if token not found then
    if(!token) return res.status(401).json({error : 'Unauthorized'});

    try{
        //verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        //Attach user information to the request object
        req.user = decoded
        next(); 

    }catch(err){
        console.log(err);
        res.status(401).json({error : 'Invalid token'});

    }

}

//function to generate JWT token
const generateToken = (userData)=>{
    //Generate a new JWT token using user data
    return jwt.sign(userData , process.env.JWT_SECRET);//{expireIn: 1hr}
}
module.exports = {jwtAuthMiddleware,generateToken}