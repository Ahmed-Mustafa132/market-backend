const Market = require("../model/marketModel");
const Mission = require("../model/missionModel");
const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {uploadImage} = require("../utils/fileUploader");
const sendEmail = require("../utils/sendEmail");
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
    // const BusinessRecordsSignedUrl = await generateSignedUrl(
    //   market.BusinessRecords.fileName
    // );
    // const taxIDSignedUrl = await generateSignedUrl(market.taxID.fileName);

    const MarketData = {
      _id: market._id,
      name: market.name,
      email: market.email,
      phone: market.phone,
      BusinessRecords: market.BusinessRecords,
      taxID: market.taxID,
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
      phone
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!req.files || !req.files.taxID || !req.files.BusinessRecords) {
      return res.status(400).json({ message: "الرجاء ارسال صور للسجل التجاري و البطاقة الضريبية" });
    }
    // Check if the market already exists
    const existingMarket = await Market.findOne({ email });
    if (existingMarket) {
      return res.status(400).json({ message: "هذا المتجر موجود في بالفعل " });
    }
    let taxIDUrl = null;
    let BusinessRecordsUrl = null;
    // Upload tax ID and business records
    try {
      const taxIFResult = await uploadImage(req.files.taxID[0], "uploads/market/taxID");
      taxIDUrl = taxIFResult.publicUrl;
    } catch (error) {
      return res.status(500).json({ message: "فشل تحميل البطاقة الضريبية", error: error.message });
    }
    try {
      const BusinessRecordsResult = await uploadImage(req.files.BusinessRecords[0], "uploads/market/BusinessRecords");
      BusinessRecordsUrl = BusinessRecordsResult.publicUrl;
    }catch (error) {
      return res.status(500).json({ message: "فشل تحميل السجل التجاري", error: error.message });
    }
    // Upload identity documents and get both public URLs and file names
    // const taxIdUpload = await uploadToGCS(req.files.taxID[0]);
    // const BusinessRecordsUpload = await uploadToGCS(
    //   req.files.BusinessRecords[0]
    // );

    const MarketData = {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      approved: false,
      taxID: taxIDUrl,
      BusinessRecords: BusinessRecordsUrl,
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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {

    const market = await Market.findOne({ email });
    if (!market) return res.status(404).json({ message: 'لم يتم العثور علي المتجر' });

    const token = jwt.sign({ id: market._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const resetLink = `http://a-souq/reset-password/markets/${token}`;

    await sendEmail(market.email, 'إعادة تعيين كلمة المرور', `مرحباً ${market.name}،

        نود إعلامك بأننا تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
        
        يرجى النقر على الرابط أدناه لإعادة تعيين كلمة المرور:
        ${resetLink}
        
        هذا الرابط صالح لمدة ساعة واحدة فقط.
        
        إذا لم تقم بطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
        
        مع خالص التحيات،
        فريق a-souq.com`);

    res.json({ message: 'رابط تحديث كلمة السر تم ارساله الي بريدك' });
  } catch (error) {
    console.log(error)
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const market = await Market.findById(decoded.id);
    if (!market) return res.status(404).json({ message: 'لم يتم العثور علي المتجر' });

    const hashedPassword = await bcrypt.hash(password, 10);
    market.password = hashedPassword;
    await market.save();

    res.json({ message: 'تم تحديث كلمة السر بنجاح' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'تم الغاء صلاحية هذا الرابط' });
  }
};

module.exports = {
  marketDashboard,
  getAllMarket,
  searchInMarket,
  getMarketById,
  login,
  register,
  deleteMarket, updataAccount, approveData,
  forgotPassword,
  resetPassword
};
