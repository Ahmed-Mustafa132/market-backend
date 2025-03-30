const Message = require('../model/massageModel');
const Manger = require('../model/mangerModel');

// إنشاء رسالة جديدة
const createMessagForMarket = async (req, res) => {
    const { id, massage } = req.body;
    try {
        const massageData = {
            from: req.user.id,
            toModel: 'Market',
            to: id,
            content: massage,
        }
        const message = await Message.create(massageData);
        res.status(201).json({
            status: 'success',
            data: message
        });
    } catch (error) {
        console.log(error)
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
            toModel: 'Representative',
            to: id,
            content: massage,
        }
        const message = await Message.create(massageData);
        res.status(201).json({
            status: 'success',
            data: message
        });
    } catch (error) {
        console.log(error)
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
        console.log(massages)
        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// تحديث حالة قراءة الرسالة
markAsRead = async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.messageId,
            { read: true },
            { new: true }
        );

        res.status(200).json({
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
getUnreadMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            to: req.params.userId,
            read: false
        }).sort({ timestamp: -1 });

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};
module.exports = {
    createMessagForMarket,
    createMessagForRep,
    getUserMessages,
    deleteMessage,
    getUnreadMessages
};