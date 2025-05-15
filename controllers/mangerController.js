const Manger = require('../model/mangerModel');
const Mission = require("../model/missionModel")
const Market = require("../model/marketModel")
const User = require("../model/userModel")
const Product = require("../model/productModel")
const Representative = require("../model/representativeModel")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {uploadToGCS, generateSignedUrl} = require("../utils/fileUploader");
const getAllManger = async (req, res) => {
    let data = []
    try {
        const mangers = await Manger.find({}, ["id", "name"]);
        for (const manger of mangers) {
            const Missions = await Mission.find({ manger: manger.id })
            const newManger = {
                id: manger.id,
                name: manger.name,
                missions: Missions.length
            }
            data.push(newManger)
        }

        res.status(200).json({ massage: "تم جلب المهام بنجاح", data: data });
    } catch (error) {
        res.status(500).json({ message: "Error fetching mangers", error });
    }
};

const getMangerById = async (req, res) => {
    try {
        const manger = await Manger.findById(req.params.id);
        if (!manger) {
            return res.status(404).json({ message: "Representative not found" });
        }
        const identityFrontSignedUrl = await generateSignedUrl(manger.identityFront.fileName);
        const identityBackSignedUrl = await generateSignedUrl(manger.identityBack.fileName);


        // Create a response object with signed URLs
        const responseData = {
            _id: manger._id,
            name: manger.name,
            email: manger.email,
            phone: manger.phone,
            identityFront: identityFrontSignedUrl,
            identityBack: identityBackSignedUrl,
            accounts: manger.accounts,

        };

        res.status(200).json({massage: "تم جلب المهام بنجاح", data: responseData});
    } catch (error) {
        res.status(500).json({ message: "Error fetching Manger", error });
    }
};
const mangerDashboard = async (req, res) => {
    try {
        let data = {
            dashboardStats: {}
        };

        // Count documents for dashboard statistics
        const manger = await Manger.countDocuments({});
        const missions = await Mission.countDocuments({});
        const Markets = await Market.countDocuments({});
        const Products = await Product.countDocuments({});
        const Users = await User.countDocuments({});
        const Representatives = await Representative.countDocuments({});

        data.dashboardStats = {
            totalMangers: manger,
            totalMissions: missions,
            totalMarkets: Markets,
            totalProducts: Products,
            totalUsers: Users,
            totalRepresentatives: Representatives
        };

        const topRepresentatives = await Mission.aggregate([
            { $group: { _id: "$representative", missionCount: { $sum: 1 } } },
            { $sort: { missionCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "representatives",
                    localField: "_id",
                    foreignField: "_id",
                    as: "repInfo"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: { $arrayElemAt: ["$repInfo.name", 0] },
                    missionCount: 1
                }
            }
        ]);

        const topMarkets = await Mission.aggregate([
            {
                $group: {
                    _id: "$market",
                    missionCount: { $sum: 1 }
                }
            },
            {
                $sort: {
                    missionCount: -1
                }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: "markets",
                    localField: "_id",
                    foreignField: "_id",
                    as: "marketInfo"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: { $arrayElemAt: ["$marketInfo.name", 0] },
                    missionCount: 1
                }
            }
        ]);

        data.topRepresentatives = topRepresentatives;
        data.topMarkets = topMarkets;

        res.status(200).json({ message: "تم جلب البيانات بنجاح", data: data });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard data", error });
    }
};
const searchInManger = async (req, res) => {
    let data = []
    let mangers
    try {
        if (req.params.name == "undefined") {
            mangers = await Manger.find({}, ["name", "id"])
        } else {
            mangers = await Manger.find({ name: { $regex: req.params.name } }, ["name", "id"])

        }
        for (const manger of mangers) {
            const Missions = await Mission.find({ manger: manger.id })
            const newManger = {
                id: manger.id,
                name: manger.name,
                missions: Missions.length
            }
            data.push(newManger)
        }
        res.status(200).json({ massage: "تم جلب المهام بنجاح", data: data });
    } catch (error) {
        res.status(500).json({ message: "Error fetching mangers", error });
    }
}
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const manger = await Manger.findOne({ email });
        if (!manger) {
            return res.status(404).json({ message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, manger.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ id: manger._id, role: manger.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};

const register = async (req, res) => {

    try {
        const { name, email, password, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const manger = await Manger.findOne({ email })
        if(manger) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Upload identity documents and get both public URLs and file names
        const identityFrontUpload = await uploadToGCS(req.files.identityFront[0]);
        const identityBackUpload = await uploadToGCS(req.files.identityBack[0]);

        const mangerData = {
            name,
            email,
            password: hashedPassword,
            phone,
            identityFront: {
                url: identityFrontUpload.publicUrl,
                fileName: identityFrontUpload.fileName
            },
            identityBack: {
                url: identityBackUpload.publicUrl,
                fileName: identityBackUpload.fileName
            }
        };

        const newManger = new Manger(mangerData);
        await newManger.save();

        const token = jwt.sign(
            { email: newManger.email, id: newManger._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Generate signed URLs for the response
        const identityFrontSignedUrl = await generateSignedUrl(identityFrontUpload.fileName);
        const identityBackSignedUrl = await generateSignedUrl(identityBackUpload.fileName);

        // Create a response object with signed URLs
        const responseData = {
            _id: newManger._id,
            name: newManger.name,
            email: newManger.email,
            phone: newManger.phone,
            identityFront: identityFrontSignedUrl,
            identityBack: identityBackSignedUrl,
            token
        };
        res.status(201).json(responseData);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};
const updateAccount = async (req, res) => {
    const { id, account } = req.body
    try {
        const manger = await Manger.findById(id, ["accounts"]);
        if (!manger) {
            return res.status(404).json({ message: "Manger not found" });
        }
        const totalaccounts = +manger.accounts + +account

        // Add await here to execute the query
        const mangerData = await Manger.findOneAndUpdate(
            { _id: id },
            { accounts: totalaccounts },
            { new: true }
        );

        res.status(200).json({ message: "Account updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating account", error: error.message });
    }
}
const deleteManger = async (req, res) => {
    const { id } = req.params;
    try {
        const manger = await Manger.findById(id);
        if (!manger) {
            return res.status(404).json({ message: "Manger not found" });
        }
        await manger.deleteOne();
        res.status(200).json({ message: "Manger deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting manger", error });
    }
};
module.exports = {
    getAllManger,
    mangerDashboard,
    searchInManger,
    getMangerById,
    login,
    register,
    updateAccount, deleteManger

};