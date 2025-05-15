const Message = require('../model/massageModel');
const Manger = require('../model/mangerModel');
const Market = require('../model/marketModel');
const Representative = require('../model/representativeModel');
// إنشاء رسالة جديدة
const createMessagForMarket = async (req, res) => {
    const { id, massage } = req.body;
    try {
        const massageData = {
            from: req.user.id,
            toModel: 'market',
            to: id,
            content: massage,
        }
        const message = await Message.create(massageData);
        res.status(201).json({
            status: 'success',
            data: message
        });
    } catch (error) {
         
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};
const createMessagForRep = async (req, res) => {
    const { id, massage } = req.body;
    try {
        const massageData = {
            from: req.user.id,
            toModel: 'representative',
            to: id,
            content: massage,
        }
        const message = await Message.create(massageData);
        res.status(201).json({
            status: 'success',
            data: message
        });
    } catch (error) {
         
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};
// الحصول على جميع الرسائل لمستخدم معين
const getUserMessages = async (req, res) => {
    const data = []
    try {
        const massages = await Message.find({
            to: req.user.id
        },).sort({ timestamp: -1 });
        for (massage of massages) {
            const manger = await Manger.findById({ _id: massage.from }, "name")
            const addData = {
                massage: massage.content,
                manger: manger
            }
            data.push(addData)
        }
        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
         
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};
// الرد  علي الرسائل من المندوب و المتجر
const createMessagForManger = async (req, res) => {
    const { managerId, massage } = req.body;
    try {
        const massageData = {
            from: req.user.id,
            fromModel: req.user.role,
            toModel: "manager",
            to: managerId,
            content: massage,
        }
        const message = await Message.create(massageData);
        res.status(201).json({
            status: 'success',
            data: message
        });
    } catch (error) {
         
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};
const getMassageForManger = async (req, res) => {
    const data = []
    let from = ""
    try {
        const massages = await Message.find({ to: req.user.id })
        for (const massage of massages) {
            if (massage.fromModel === "market") {
                from = await Market.findById(massage.from, "name")

            }
            if (massage.fromModel === "representative") {
                from = await Representative.findById(massage.from, "name")
            }
            console.log(from)
            const addData = {
                id: massage._id,
                massage: massage.content,
                fromID: massage.from,
                from: from.name,
                fromModel: massage.fromModel,
            }
            data.unshift(addData)
        }
        res.status(200).json({ status: 200, data: data })
    }
    catch (error) {
         
        res.status(400).json({
            status: "fail", message: error.message
        })
    }
}
// حذف رسالة
deleteMessage = async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.messageId);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// الحصول على الرسائل غير المقروءة
module.exports = {
    createMessagForMarket,
    createMessagForRep,
    getUserMessages,
    deleteMessage,
    createMessagForManger,
    getMassageForManger
};