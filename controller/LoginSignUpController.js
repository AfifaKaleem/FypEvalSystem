// controllers/loginSignupController.js
const LoginSignup = require('./../models/LoginSignup');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// Signup
exports.signup = async (req, res) => {
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
exports.login = async (req, res) => {
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

        res.json({ token, email: email, payload: payload });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await LoginSignup.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.loggedIn = false;
        await user.save();
        res.json({ message: 'Logged out successfully', user: user });
        console.log('User logged out successfully');
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await LoginSignup.find();
        console.log('Data fetched');
        res.status(200).json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
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
exports.updateUser = async (req, res) => {
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
exports.updatePassword = async (req, res) => {
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
exports.deleteUser = async (req, res) => {
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
