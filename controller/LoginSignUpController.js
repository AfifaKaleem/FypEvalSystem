// controllers/loginSignupController.js
const LoginSignup = require('./../models/LoginSignup');
const { generateToken } = require('./../jwt');


const loggedInUsers = [];
const SignedUpUsers = [];
const LoggedOutUsers =[];
// Signup
module.exports.signup = async (req, res) => {
    try {
        const data = req.body;
        const newLoginSignup = new LoginSignup(data);
        const response = await newLoginSignup.save();
        console.log('Data saved');

        const payload = {
            id: response.id,
            username: response.username,
            email: response.email,
            password: response.password
        };
        // Add user to signed up users list
        SignedUpUsers.push({ username: data.username, email: data.email, password: data.password });
        console.log(JSON.stringify(payload));
        const token = generateToken(response.username);
        console.log("Token is", token);

        res.status(200).json({ response: response, token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Login
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await LoginSignup.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password. This email does not exist' });
        }

        const payload = {
            id: user.id,
            email: user.email,
            password: user.password
        };
        const token = generateToken(payload);
         // Add user to logged-in users list
         loggedInUsers.push({ email: user.email, password: user.password });

        res.json({ token, email: email, payload: payload });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Logout
module.exports.logout = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await LoginSignup.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
         // save user list who have logged out
        LoggedOutUsers.push({ email: user.email, password: user.password });
        user.loggedIn = false;
        await user.save();
        res.json({ message: 'Logged out successfully', user: user });
        console.log('User logged out successfully');
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//Get all users signup data
module.exports.getAllData = async (req, res) => {
    try {
        const users = await LoginSignup.find();
        console.log('Data fetched');
        res.status(200).json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.getAll = async (req, res) => {
    try {
        // Fetch only username and email from all users
        const users = await LoginSignup.find({}, 'username email');
        console.log('Data fetched');
        
        res.status(200).json(users); // Return the array of users with username and email
        console.log(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.getUserPassword = async (req, res) => {
    try {
        const user = await LoginSignup.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Actual Password:', user.password);
        res.status(200).json({ username: user.username, email: user.email, password: user.password });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports.getAllUsers = async(req,res)=>{
    try {
        if (SignedUpUsers.length === 0) {
            return res.status(404).json({ error: 'No lSignedUp users found' });
        }
        res.status(200).json(SignedUpUsers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//get all users login data
module.exports.getLoginusersData = async(req,res)=>{
    try {
        if (loggedInUsers.length === 0) {
            return res.status(404).json({ error: 'No logged-in users found' });
        }
        res.status(200).json(loggedInUsers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//get all users logg out data
module.exports.getLogoutusersData = async(req,res)=>{
    try {
        if (LoggedOutUsers.length === 0) {
            return res.status(404).json({ error: 'No logged-out users found' });
        }
        res.status(200).json(LoggedOutUsers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get user profile
module.exports.getProfile = async (req, res) => {
    try {
        const userData = req.user;
        console.log("User Data", userData);

        const userId = userData.id;
        const user = await LoginSignup.findById(userId);

        res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update user
module.exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedUserData = req.body;

        const response = await LoginSignup.findByIdAndUpdate(userId, updatedUserData, {
            new: true,
            runValidators: true
        });

        if (!response) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update user password
module.exports.updatePassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { password } = req.body;

        const user = await LoginSignup.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.password = password;
        await user.save();

        console.log('Password successfully updated');
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete user
module.exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const response = await LoginSignup.findByIdAndDelete(userId);

        if (!response) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Data deleted');
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};