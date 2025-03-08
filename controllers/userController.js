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
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id,"name");
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
  console.log('Received file:', req.files); // Log the received file
  console.log('Received body:', req.body); // Log the received body
  try {
    
    const { name, email, password, role, phone, taxID, BusinessRecords, identityFront, identityBack } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    let userData 
    if (role === 'rep') {
      userData = {
        name, email, password: hashedPassword,
        role, phone, identityFront, identityBack,
      };

      const uploadPromises = [
        uploadToGCS(req.files.identityFront[0]).then(url => userData.identityFront = url),
        uploadToGCS(req.files.identityBack[0]).then(url => userData.identityBack = url)
      ];
      await Promise.all(uploadPromises);
    } else if (role === 'market') {
      userData = {
        name, email, password: hashedPassword,
        role, phone, taxID, BusinessRecords
      };
      const uploadPromises = [
        uploadToGCS(req.files.BusinessRecords[0]).then(url => userData.BusinessRecords = url),
        uploadToGCS(req.files.taxID[0]).then(url => userData.taxID = url)
      ];
      await Promise.all(uploadPromises);
    }
    console.log('userData:', userData);
    const newUser = new User(userData);
    await newUser.save();

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};





module.exports = {
  getUsers,
  getUserById,
  login,
  register

};