const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { uploadToGCS } = require('../utils/fileUploader');
const { validateRegistration } = require('../middleware/authMiddleware');


const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, taxID, BusinessRecords } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name, email, password: hashedPassword,
      role, phone, taxID, BusinessRecords
    };

    if (role === 'rep' && req.files) {
      const uploadPromises = [
        uploadToGCS(req.files.identityFront[0]).then(url => userData.identityFront = url),
        uploadToGCS(req.files.identityBack[0]).then(url => userData.identityBack = url)
      ];
      await Promise.all(uploadPromises);
    }

    const newUser = new User(userData);
    await newUser.save();

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};





module.exports = {
  getUsers,
  login,
  register

};