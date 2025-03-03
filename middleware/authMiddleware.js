const User = require('../model/userModel');
const validateRegistration = async (req, res, next) => {
    const { email, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    if (role === 'rep' && (!req.files?.identityFront || !req.files?.identityBack)) {
        return res.status(400).json({ message: 'Identity documents required for rep role' });
    }

    next();
};

module.exports = { validateRegistration };
