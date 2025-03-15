const Market = require("../model/marketModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadToGCS, generateSignedUrl } = require("../utils/fileUploader");

const getAllMarket = async (req, res) => {
  try {
    const Markets = await Market.find({});
    res.status(200).json(Markets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Markets", error });
  }
};
const getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) {
      return res.status(404).json({ message: "Market not found" });
    }
    const BusinessRecordsSignedUrl = await generateSignedUrl(
      market.BusinessRecords.fileName
    );
    const taxIDSignedUrl = await generateSignedUrl(market.taxID.fileName);

    const MarketData = {
      _id: market._id,
      name: market.name,
      email: market.email,
      phone: market.phone,
      BusinessRecords: BusinessRecordsSignedUrl,
      taxID: taxIDSignedUrl,
      createdAt: market.createdAt,
      updatedAt: market.updatedAt,
    };
    res.status(200).json(MarketData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Market", error });
    console.log(error);
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const market = await Market.findOne({ email });
    if (!market) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, market.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({email:market.email, id: market._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
    console.log(error);
  }
};
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      taxID,
      BusinessRecords,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload identity documents and get both public URLs and file names
    const taxIdUpload = await uploadToGCS(req.files.taxID[0]);
    const BusinessRecordsUpload = await uploadToGCS(
      req.files.BusinessRecords[0]
    );

    const MarketData = {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      taxID:{
        url: taxIdUpload.publicUrl,
        fileName: taxIdUpload.fileName,
      },
      BusinessRecords: {
        url: BusinessRecordsUpload.publicUrl,
        fileName: BusinessRecordsUpload.fileName,
      },
    };
    

    const newMarket = new Market(MarketData);
    await newMarket.save();

    const token = jwt.sign(
      { email: newMarket.email, id: newMarket._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({ Market: newMarket, token });
  } catch (error) {
    console.error("Error creating Market:", error);
    res
      .status(500)
      .json({ message: "Error creating Market", error: error.message });
  }
};

module.exports = {
  getAllMarket,
  getMarketById,
  login,
  register,
};
