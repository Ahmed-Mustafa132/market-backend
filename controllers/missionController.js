const Mission = require("../model/missionModel");
const Market = require("../model/marketModel")
const Manger = require("../model/mangerModel")
const Representative = require("../model/representativeModel")
const Product = require("../model/productModel")
const jwt = require("jsonwebtoken");
const getAllMissionsforRepAndMarket = async (req, res) => {
  console.log(req.user)
    const data = [];
    try {
        let missions
        if (req.user.role == "representative") {
            if (req.params.state == "true") {
                missions = await Mission.find({ representative:req.user.id,complete: true });
            }
            if (req.params.state == "false") {
                missions = await Mission.find({ representative: req.user.id, complete: false })
            }
        }
        if (req.user.role == "market") {
            if (req.params.state == "true") {
                missions = await Mission.find({ market: req.user.id, complete: true });
            }
            if (req.params.state == "false") {
                missions = await Mission.find({ market: req.user.id, complete: false })
            }
        }

        
        for (const mission of missions) {
            const products = []
            const marketName = await Market.findById(mission.market, "name");
            const mangerName = await Manger.findById(mission.manger, "name");
            const representativeName = await Representative.findById(mission.representative, "name");
            for (const product of mission.products) {
                
                const productName = await Product.findById(product.product, ["id", "title", "price"])
                const newProduct = {
                    product: productName,
                    quantity: product.quantity
                }
                products.push(newProduct)
            }

            const newMission = {
                id: mission.id,
                market: marketName.name,
                manger: mangerName.name,
                representative: representativeName.name,
                products: products
            };

            data.push(newMission);
        }

        res.status(200).json({ message: "تم جلب المهمات بنجاح", data:data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "حدث خطأ أثناء جلب المهمات" });

    }
}
const getMissionForManger = async (req, res) => {
    const data = [];
    try {
        const missions = await Mission.find({});
        if (!missions) {
            return res.status(404).json({ message: "لا توجد مهام" });
        }
        for (const mission of missions) {
            const products = []
            const marketName = await Market.findById(mission.market, "name");
            const mangerName = await Manger.findById(mission.manger, "name");
            const representativeName = await Representative.findById(mission.representative, "name");
            for (const product of mission.products) {

                const productName = await Product.findById(product.product, ["_id", "title", "price"])
                const newProduct = {
                    product: productName,
                    quantity: product.quantity
                }
                products.push(newProduct)
            }

            const newMission = {
                id: mission.id,
                market: marketName.name,
                manger: mangerName.name,
                representative: representativeName.name,
                products: products,
                complete: mission.complete
            };

            data.push(newMission);
        }
        
        return res.status(200).json({ message: "تم جلب المهمات بنجاح", data: data });
} catch (error) {
        console.log(error)
        return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
};
const getStateMissionForManger = async (req, res) => { const data = [];
    try {
        let missions
        if (req.params.state == "true") {
            missions = await Mission.find({complete: true });
        }
        if (req.params.state == "false") {
            missions = await Mission.find({ complete: false })
        }
        if (!missions) {
            return res.status(404).json({ message: "لا توجد مهام" });
        }
        for (const mission of missions) {
            const products = []
            const marketName = await Market.findById(mission.market, "name");
            const mangerName = await Manger.findById(mission.manger, "name");
            const representativeName = await Representative.findById(mission.representative, "name");
            for (const product of mission.products) {

                const productName = await Product.findById(product.product, ["_id", "title", "price"])
                const newProduct = {
                    product: productName,
                    quantity: product.quantity
                }
                products.push(newProduct)
            }

            const newMission = {
                id: mission.id,
                market: marketName.name,
                manger: mangerName.name,
                representative: representativeName.name,
                products: products,
                complete: mission.complete
            };

            data.push(newMission);
        }
        
        return res.status(200).json({ message: "تم جلب المهمات بنجاح", data: data });
} catch (error) {
        console.log(error)
        return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }}
const getMissionById = async (req, res) => {
    const data = [];
    try {
        const mission = await Mission.findById(req.params.id);
        if (!mission) {
            return res.status(404).json({ message: "لا توجد مهام" });
        }
 
            const products = []
            const marketName = await Market.findById(mission.market, "name");
            const mangerName = await Manger.findById(mission.manger, "name");
            const representativeName = await Representative.findById(mission.representative, "name");
            for (const product of mission.products) {

                const productName = await Product.findById(product.product, ["_id", "title", "price"])
                const newProduct = {
                    product: productName,
                    quantity: product.quantity
                }
                products.push(newProduct)
            }

        const newMission = {
            id: mission.id,
            market: marketName.name,
            manger: mangerName.name,
            representative: representativeName.name,
            products: products,
            complete: mission.complete
        }

            data.push(newMission);
        

        return res.status(200).json({ message: "تم جلب المهمات بنجاح", data: data });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
};
const createMission = async (req, res) => {
    try {
        const { representative, market, products, manger } = req.body;
        
        const missionData = {
            representative,
            market,
            manger:req.user.id,
            products,
            complete:false,
        };
        console.log(missionData)
        const newMission = new Mission(missionData);
        await newMission.save();
        res.status(201).json({message:"تم انشاء المهمة بنجاح"})
    } catch (error) {
        res.status(500).json({
            massaeg: "حدث خطاء اثناء ارسال المهمة الرجاء التاكد من  ",
        });
        console.log(error)
    }
};
const deleteMission = async (req,res)=>{
    try {
        const Delete = await Mission.findByIdAndDelete(req.params.id)
        res.status(200).json({ massaeg: "تم احذف بنجاح", data: Delete })
    } catch (error){
        res.status(500).json({massaeg:"حدث مشكلة اثناء الحذف "})
    }
}
const updateMissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { complete } = req.body;

        const mission = await Mission.findByIdAndUpdate(
            id,
            { complete },
            { new: true }
        );

        if (!mission) {
            return res.status(404).json({ message: "المهمة غير موجودة" });
        }

        return res.status(200).json({
            message: "تم تحديث حالة المهمة بنجاح",
            data: mission
        });
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
    updateMissionStatus
};
