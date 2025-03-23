const Massage = require("../model/massageModel")
const Manger = require('../model/mangerModel')
const getMassage = async (req, res) => {
    try {
        let massages = []
        const data = []
        if (req.user.role == "representative") {
            massages = await Massage.find({ to: req.user.id })
        }
        if(req.user.role == "manger"){
            massages = await Massage.find({from: req.user.id})
        }   
        for (const massage of massages) {
            const mangerName = await Manger.find(massage.from,"name")
            const newMassage = {
                id: massage.id,
                manger: mangerName,
                content: massage.content
            }
            data.push(newMassage)
        }
        res.status(200).json({massage: "تم جلب الاشعارات بنجاح ", data: data})
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        })
    }
}

const createMassage = async (req, res) => {
    const { from, to, content } = req.body
    try {
        const massageData = {
            from,
            to,
            content
        }
        const newMassage = new Massage(massageData)
        await newMassage.save()
        res.status(200).json({massage: "تم ارسال الاشعار بنجاح"})
    } catch (error) {
        console.log(error)

        res.status(400).json({
            status: 'fail',
            message: "error.massage"
        })
    }
}
module.exports = { getMassage, createMassage }