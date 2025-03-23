const Manger = require('../model/mangerModel');
const Mission = require("../model/missionModel")
const Market = require("../model/marketModel")
const User = require("../model/userModel")
const Product = require("../model/productModel")
const Representative = require("../model/representativeModel")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getAllManger = async (req, res) => {
    let data = []
    try {
        const mangers = await Manger.find({}, ["id", "name"]);
        for (const manger of mangers) {
            console.log(manger)
            const Missions = await Mission.find({ manger: manger.id })
            console.log(Missions)
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
            return res.status(404).json({ message: "Manger not found" });
        }
        res.status(200).json(manger);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Manger", error });
    }
};
const mangerDashboard = async (req, res) => {
    try {
        // Initialize data object without the undefined variables
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

        // Get top representatives
        const topRepresentatives = await Mission.aggregate([
            // Group by representative
            { $group: { _id: "$representative", missionCount: { $sum: 1 } } },
            // Sort in descending order
            { $sort: { missionCount: -1 } },
            // Take top 5
            { $limit: 5 },
            // Join with representatives collection
            {
                $lookup: {
                    from: "representatives",
                    localField: "_id",
                    foreignField: "_id",
                    as: "repInfo"
                }
            },
            // Simplify the result
            {
                $project: {
                    _id: 0,
                    name: { $arrayElemAt: ["$repInfo.name", 0] },
                    missionCount: 1
                }
            }
        ]);

        // Get top markets
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

        // Add the aggregated data to the response
        data.topRepresentatives = topRepresentatives;
        data.topMarkets = topMarkets;

        res.status(200).json({ message: "تم جلب البيانات بنجاح", data: data });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard data", error });
    }
};
const searchInManger = async (req, res) => {
    console.log(req.params)
    let data = []
    let mangers
    try {
        if (req.params.name == "undefined") {
            mangers = await Manger.find({}, ["name", "id"])
        } else {
            mangers = await Manger.find({ name: { $regex: req.params.name } }, ["name", "id"])
            console.log(mangers)

        }
        for (const manger of mangers) {
            console.log(manger)
            const Missions = await Mission.find({ manger: manger.id })
            console.log(Missions)
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
    const { name, email, password } = req.body;
    try {
        const manger = await Manger.findOne({ email });
        if (manger) {
            return res.status(400).json({ message: "Manger already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newManger = new Manger({ name, email, password: hashedPassword });
        await newManger.save();
        res.status(201).json({ message: "Manger created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating Manger", error });
    }
}
module.exports = {
    getAllManger,
    mangerDashboard,
    searchInManger,
    getMangerById,
    login,
    register,
};