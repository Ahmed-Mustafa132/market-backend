const Mission = require("../model/missionModel");
const Market = require("../model/marketModel");
const Manger = require("../model/mangerModel");
const Representative = require("../model/representativeModel");
const Product = require("../model/productModel");
const getAllMissionsforRepAndMarket = async (req, res) => {
    const data = [];
    try {
        let missions;
        if (req.user.role == "representative") {
            if (req.params.state == "true") {
                missions = await Mission.find({
                    representative: req.user.id,
                    complete: true,
                    approved: true
                });
            }
            if (req.params.state == "false") {
                missions = await Mission.find({
                    representative: req.user.id,
                    complete: false,
                    approved: true
                });
            }
        }
        if (req.user.role == "market") {
            if (req.params.state == "true") {
                missions = await Mission.find({ market: req.user.id, complete: true, approved: true });
            }
            if (req.params.state == "false") {
                missions = await Mission.find({ market: req.user.id, complete: false, approved: true });
            }
        }

        for (const mission of missions) {
            const products = [];
            const marketName = await Market.findById(mission.market, "name");
            const mangerName = await Manger.findById(mission.manger, "name");
            const representativeName = await Representative.findById(
                mission.representative,
                "name"
            );
            for (const product of mission.products) {
                const productName = await Product.findById(product.product, [
                    "id",
                    "title",
                    "price",
                ]);
                const newProduct = {
                    product: productName,
                    quantity: product.quantity,
                };
                products.push(newProduct);
            }

            const newMission = {
                id: mission.id,
                market: marketName.name,
                manger: mangerName.name,
                representative: representativeName.name,
                products: products,
            };

            data.push(newMission);
        }

        res.status(200).json({ message: "تم جلب المهمات بنجاح", data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "حدث خطأ أثناء جلب المهمات" });
    }
};
const getMissionForManger = async (req, res) => {
    const data = [];
    let missions;
    try {
        if (req.user.role == "admin") {
            missions = await Mission.find({});
        }
        if (req.user.role == "manger") {
            missions = await Mission.find({ manger: req.user.id });
        }
        if (!missions) {
            return res.status(404).json({ message: "لا توجد مهام" });
        }
        for (const mission of missions) {
            const products = [];
            const marketName = await Market.findById(mission.market, "name");
            const mangerName = await Manger.findById(mission.manger, "name");
            const representativeName = await Representative.findById(
                mission.representative,
                "name"
            );
            for (const product of mission.products) {
                const productName = await Product.findById(product.product, [
                    "_id",
                    "title",
                    "price",
                ]);
                const newProduct = {
                    product: productName,
                    quantity: product.quantity,
                };
                products.push(newProduct);
            }

            const newMission = {
                id: mission.id,
                market: marketName.name,
                manger: mangerName.name,
                representative: representativeName.name,
                products: products,
                complete: mission.complete,
                approved: mission.approved
            };

            data.push(newMission);
        }
        return res
            .status(200)
            .json({ message: "تم جلب المهمات بنجاح", data: data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
};
const getStateMissionForManger = async (req, res) => {
    const data = [];
    let missions;
    try {
        if (req.user.role == "admin") {
            if (req.params.state == "true") {
                missions = await Mission.find({ complete: true });
            }
            if (req.params.state == "false") {
                missions = await Mission.find({ complete: false });
            }
        }
        if (req.user.role == "manger") {
            if (req.params.state == "true") {
                missions = await Mission.find({ manger: req.user.id, complete: true });
            }
            if (req.params.state == "false") {
                missions = await Mission.find({ manger: req.user.id, complete: false });
            }
        }
        for (const mission of missions) {
            const products = [];
            const marketName = await Market.findById(mission.market, "name");
            const mangerName = await Manger.findById(mission.manger, "name");
            const representativeName = await Representative.findById(
                mission.representative,
                "name"
            );
            for (const product of mission.products) {
                const productName = await Product.findById(product.product, [
                    "_id",
                    "title",
                    "price",
                ]);
                const newProduct = {
                    product: productName,
                    quantity: product.quantity,
                };
                products.push(newProduct);
            }

            const newMission = {
                id: mission.id,
                market: marketName.name,
                manger: mangerName.name,
                representative: representativeName.name,
                products: products,
                complete: mission.complete,
                approved: mission.approved
            };

            data.push(newMission);
        }

        return res
            .status(200)
            .json({ message: "تم جلب المهمات بنجاح", data: data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
};
const getMissionById = async (req, res) => {
    const data = [];
    try {
        const mission = await Mission.findById(req.params.id);
        if (!mission) {
            return res.status(404).json({ message: "لا توجد مهام" });
        }

        const products = [];
        const marketName = await Market.findById(mission.market, "name");
        const mangerName = await Manger.findById(mission.manger, "name");
        const representativeName = await Representative.findById(
            mission.representative,
            "name"
        );
        for (const product of mission.products) {
            const productName = await Product.findById(product.product, [
                "_id",
                "title",
                "price",
            ]);
            const newProduct = {
                product: productName,
                quantity: product.quantity,
            };
            products.push(newProduct);
        }

        const newMission = {
            id: mission.id,
            market: marketName.name,
            manger: mangerName.name,
            representative: representativeName.name,
            products: products,
            complete: mission.complete,
        };

        data.push(newMission);

        return res
            .status(200)
            .json({ message: "تم جلب المهمات بنجاح", data: data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
};
const createMission = async (req, res) => {
    try {
        const { representative, market, products, manger } = req.body;

        const missionData = {
            representative,
            market,
            manger: req.user.id,
            products,
            complete: false,
        };
        console.log(missionData);
        const newMission = new Mission(missionData);
        await newMission.save();
        res.status(201).json({ message: "تم انشاء المهمة بنجاح" });
    } catch (error) {
        res.status(500).json({
            massaeg: "حدث خطاء اثناء ارسال المهمة الرجاء التاكد من  ",
        });
        console.log(error);
    }
};
const deleteMission = async (req, res) => {
    try {
        const Delete = await Mission.findByIdAndDelete(req.params.id);
        res.status(200).json({ massaeg: "تم احذف بنجاح", data: Delete });
    } catch (error) {
        res.status(500).json({ massaeg: "حدث مشكلة اثناء الحذف " });
    }
};
const updateMissionStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const mission = await Mission.findByIdAndUpdate(
            id,
            { complete: true },
            { new: true }
        );

        if (!mission) {
            return res.status(404).json({ message: "المهمة غير موجودة" });
        }

        return res.status(200).json({
            message: "تم تحديث حالة المهمة بنجاح",
            data: mission,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
};
const searchMissionByStateAndName = async (req, res) => {
    const { search } = req.query;
    const { state } = req.params;
    const data = [];
    try {
        let missions;
        // Convert state string to boolean
        const completeState = state === "true";

        // Find missions by state and search in market or manager names
        if (req.user.role == "representative") {
            const markets = await Market.find({
                name: { $regex: search, $options: "i" },
            });
            const marketIds = markets.map((market) => market._id);

            const mangers = await Manger.find({
                name: { $regex: search, $options: "i" },
            });
            const mangerIds = mangers.map((manger) => manger._id);

            // Find missions that match the search criteria
            missions = await Mission.find({
                complete: completeState,
                representative: req.user.id,
                $or: [{ market: { $in: marketIds } }, { manger: { $in: mangerIds } }],
            });
        } else if (
            req.user.role == "market" ||
            req.user.role == "manger" ||
            req.user.role == "admin"
        ) {
            const reps = await Representative.find({
                name: { $regex: search, $options: "i" },
            });
            const repIds = reps.map((rep) => rep._id);
            console.log(repIds);

            const mangers = await Manger.find({
                name: { $regex: search, $options: "i" },
            });
            const mangerIds = mangers.map((manger) => manger._id);

            missions = await Mission.find({
                complete: completeState,
                market: req.user.id,
                $or: [
                    { representative: { $in: repIds } },
                    { manger: { $in: mangerIds } },
                ],
            });
        }
        // Format the response data
        for (const mission of missions) {
            const products = [];
            const marketName = await Market.findById(mission.market, "name");
            const mangerName = await Manger.findById(mission.manger, "name");
            const representativeName = await Representative.findById(
                mission.representative,
                "name"
            );

            for (const product of mission.products) {
                const productName = await Product.findById(product.product, [
                    "_id",
                    "title",
                    "price",
                ]);
                const newProduct = {
                    product: productName,
                    quantity: product.quantity,
                };
                products.push(newProduct);
            }

            const newMission = {
                id: mission.id,
                market: marketName.name,
                manger: mangerName.name,
                representative: representativeName.name,
                products: products,
                complete: mission.complete,
            };

            data.push(newMission);
        }

        return res
            .status(200)
            .json({ message: "تم جلب المهمات بنجاح", data: data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
};
const unApproveMission = async (req, res) => {
    try {
        const { id } = req.params;
        const mission = await Mission.findByIdAndUpdate(id, { approved: false }, { new: true });
        res.status(200).json({ message: "تم إلغاء الموافقة على المهمة بنجاح", data: mission });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
};
module.exports = {
    getMissionForManger,
    getStateMissionForManger,
    getAllMissionsforRepAndMarket,
    getMissionById,
    createMission,
    deleteMission,
    updateMissionStatus,
    searchMissionByStateAndName,
    unApproveMission,
};
