const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const getUsers = async (req, res) => {
  await res.send('getUsers');
};
const login = async (req, res) => {
  await res.send('login');
};
const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword, role, phone });
    await user.save();
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user, token });
  }catch (error) {
    res.status(500).json({ message: 'Something went wrong',error });
  }
};

module.exports = {
  getUsers,
  login,
  register

};