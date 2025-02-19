// Middleware to validate email based on role

const LoginSignup = require("../models/LoginSignup");

async function validateEmail(req, res, next) {
    const { email, role } = req.body;
    const emailRegex = /(.*@student\.uol\.edu\.pk$|.*@cs\.uol\.edu\.pk$|.*@admin.cs.uol.edu.pk)/;

    // Validate the general domain
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email domain.' });
    }

    // Validate email based on the role
    if (role === 'Student' && !email.endsWith('@student.uol.edu.pk')) {
        return res.status(400).json({ message: 'Invalid email format for Student.' });
    }
    if (['Supervisor', 'Evaluator'].includes(role) && !email.endsWith('@cs.uol.edu.pk')) {
        return res.status(400).json({ message: `Invalid email format for ${role}.` });
    }
    if (role === 'FypHead' && !email.endsWith('@admin.cs.uol.edu.pk')) {
        return res.status(400).json({ message: 'Invalid email format for FypHead.' });
    }

    next();
}

// FypHead validation: Ensure only one FypHead
async function checkFypHead(req, res, next) {
    const { role,email } = req.body;

    if (role === 'FypHead' && email.endsWith('@admin.cs.uol.edu.pk')) {
        const existingFypHead = await LoginSignup.findOne({ role: 'FypHead' });

        if (existingFypHead) {
            return res.status(400).json({ message: 'FypHead already exists.' });
        }
    }

    next();
}

// Export both middlewares
module.exports = {
    validateEmail,
    checkFypHead
};
