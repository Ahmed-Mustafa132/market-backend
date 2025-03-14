const Market = require('../model/marketModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { uploadToGCS } = require('../utils/fileUploader');


const getAllMarket = async (req, res) => {
  try {
    const Markets = await Market.find({});
    res.status(200).json(Markets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Markets', error });
  }
};
const getMarketById = async (req, res) => {
  try {
    const Market = await Market.findById(req.params.id, "name");
    res.status(200).json(Market);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Market', error });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const market = await Market.findOne({ email });
    if (!market) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, market.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: market._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
    console.log(error);
  }
};
const register = async (req, res) => {
  console.log('Received file:', req.files);
  console.log('Received body:', req.body); 
  try {

    const { name, email, password, role, phone, taxID, BusinessRecords, identityFront, identityBack } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const MarketData = {
      name, email, password: hashedPassword,
      role, phone, taxID, BusinessRecords
    }
    const uploadPromises = [
      uploadToGCS(req.files.BusinessRecords[0]).then(url => MarketData.BusinessRecords = url),
      uploadToGCS(req.files.taxID[0]).then(url => MarketData.taxID = url)
    ];
    await Promise.all(uploadPromises);

    const newMarket = new Market(MarketData);
    await newMarket.save();

    const token = jwt.sign(
      { email: newMarket.email, id: newMarket._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ Market: newMarket, token });
  } catch (error) {
    console.error('Error creating Market:', error);
    res.status(500).json({ message: 'Error creating Market', error: error.message });
  }
};

module.exports = {
  getAllMarket,
  getMarketById,
  login,
  register
};