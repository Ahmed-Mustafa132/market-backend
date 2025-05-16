const Market = require("../model/marketModel");
const Mission = require("../model/missionModel");
const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadToGCS, generateSignedUrl } = require("../utils/fileUploader");
const marketDashboard = async (req, res) => {
  let data = {
  }
  try {
    const missions = await Mission.countDocuments({ market: req.user.id });
    const missionComplete = await Mission.countDocuments({ complete: true, market: req.user.id });
    const missionUnComplete = await Mission.countDocuments({ complete: false, market: req.user.id });
    const orders = await Order.countDocuments({ market: req.user.id });
    const market = await Market.findById(req.user.id);
    data = {
      totalMissions: missions,
      completedMissions: missionComplete,
      pendingMissions: missionUnComplete,
      orders: orders,
      accounts: market.accounts,
    };
    res.status(200).json({ message: "تم جلب البيانات بنجاح", data });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في جلب البيانات", error: error });
  }

}
const updataAccount = async (req, res) => {
  const { id, account } = req.body
  try {
    const market = await Market.findById(id, ["accounts"]);
    if (!market) {
      return res.status(404).json({ message: "Representative not found" });
    }
    const totalaccounts = +market.accounts + +account

    // Add await here to execute the query
    const data = await Market.findOneAndUpdate(
      { _id: id },
      { accounts: totalaccounts },
      { new: true }
    );

    // Convert to plain object or select specific fields
    const Data = data.toObject ? data.toObject() : {
      _id: data._id,
      name: data.name,
      accounts: data.accounts
      // Add other fields you need
    };

    res.status(200).json({ message: "Account updated successfully", data: Data });
  } catch (error) {
    res.status(500).json({ message: "Error updating account", error: error.message });
  }
}
const getAllMarket = async (req, res) => {
  let data = []
  let totleSales = 0
  try {

    let Markets = ""
    if (req.params.state == "true") {
      Markets = await Market.find({ approved: 'true' }, ["id", "name"])
    } else {
      Markets = await Market.find({ approved: false }, ["id", "name"])
    }
    for (const market of Markets) {
      const missions = await Mission.find({ market: market.id })
      for (const mission of missions) {
        mission.products.forEach((total) => {
          totleSales += total.quantity
        }, 0);
      }

      const newMarket = {
        id: market.id,
        name: market.name,
        missions: missions.length,
        totleSales: totleSales
      }
      data.push(newMarket)
    }
    res.status(200).json({ massage: "تم جلب المتاجر بنجاح", data: data });
  } catch (error) {

    res.status(500).json({ message: "Error fetching Markets", error: error });
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
      accounts: market.accounts,
      createdAt: market.createdAt,
      updatedAt: market.updatedAt,
    };
    res.status(200).json({ massage: "تم جلب المتاجر بنجاح", data: MarketData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching Market", error });
  }
};
const searchInMarket = async (req, res) => {
  let data = []
  let totleSales = 0
  let missions
  try {
    if (req.params.name == "undefined") {
      Markets = await Market.find({}, ["name", "id"])
    } else {
      Markets = await Market.find({ name: { $regex: req.params.name } }, ["name", "id"])
    } for (const market of Markets) {
      const missions = await Mission.find({ market: market.id })
      for (const mission of missions) {
        mission.products.forEach((total) => {
          totleSales += total.quantity
        }, 0);
      }

      const newMarket = {
        id: market.id,
        name: market.name,
        missions: missions.length,
        totleSales: totleSales
      }
      data.push(newMarket)
    }
    res.status(200).json({ massage: "تم جلب المتاجر بنجاح", data: data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching Markets", error: error });
  }
}
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
    const token = jwt.sign({ email: market.email, id: market._id, role: market.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });

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
      approved: false,
      taxID: {
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
const deleteMarket = async (req, res) => {
  try {
    const deleteMarket = await Market.findById(req.params.id);
    if (!deleteMarket) {
      return res.status(404).json({ message: "Market not found" });
    }
    const market = await Market.findByIdAndDelete(req.params.id);
    const missions = await Mission.deleteMany({ market: req.params.id });
    const orders = await Order.deleteMany({ market: req.params.id });
    const product = await Product.deleteMany({ market: req.params.id });
    res.status(200).json({ message: "Market deleted successfully" });
  } catch (error) {
    console.error("Error deleting Market:", error);
    res.status(500).json({ message: "Error deleting Market", error });
  }
};
const approveData = async (req, res) => {
  try {
    const market = await Market.findByIdAndUpdate(req.params.id, {
      approved: true,
    });
    if (!market) {
      return res.status(404).json({ message: "Market not found" });
    }
    market.approved = true;
    await market.save();
    res.status(200).json({ message: "Market approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error approving Market", error });
  }
};
module.exports = {
  marketDashboard,
  getAllMarket,
  searchInMarket,
  getMarketById,
  login,
  register,
  deleteMarket, updataAccount, approveData
};
