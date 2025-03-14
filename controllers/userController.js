const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getAllUser = async (req, res) => {
    try {
        const users = await user.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};
const getUserById = async (req, res) => {
    try {
        const user = await user.findById(req.params.id, "name");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ user, token });
    } catch (error) {
        atus(500).json({ message: 'Something went wrong', error });
    }
};
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            name, email, password: hashedPassword
        }
        const user = await User.create(userData);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
        console.log(error);
    }
};
module.exports = {
    getAllUser,
    getUserById,
    login,
    register
};
