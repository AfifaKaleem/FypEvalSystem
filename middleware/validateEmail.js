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
    if (role === 'Admin' && !email.endsWith('@admin.cs.uol.edu.pk')) {
        return res.status(400).json({ message: 'Invalid email format for Admin.' });
    }

    next();
}

// Admin validation: Ensure only one Admin
async function checkAdmin(req, res, next) {
    const { role,email } = req.body;

    if (role === 'Admin' && email.endsWith('@admin.cs.uol.edu.pk')) {
        const existingAdmin = await LoginSignup.findOne({ role: 'Admin' });

        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists.' });
        }
    }

    next();
}

// Export both middlewares
module.exports = {
    validateEmail,
    checkAdmin
};
