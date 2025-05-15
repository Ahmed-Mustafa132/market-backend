const Representative = require("../model/representativeModel");
const Mission = require("../model/missionModel");
const bcrypt = require("bcrypt");
const Order = require("../model/orderModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { uploadToGCS, generateSignedUrl } = require("../utils/fileUploader");
const repDashboard = async (req, res) => {
    let data = {
    }
    try {
        const missions = await Mission.find({ representative: req.user.id });
        const missionComplete = await Mission.countDocuments({ complete: true, representative: req.user.id });
        const missionUnComplete = await Mission.countDocuments({ complete: false, representative: req.user.id });
        const orders = await Order.countDocuments({ representative: req.user.id });
        const representative = await Representative.findById(req.user.id);
        data = {
            totalMissions: missions.length,
            completedMissions: missionComplete,
            pendingMissions: missionUnComplete,
            orders: orders,
            accounts: representative.accounts,
        };
        res.status(200).json({ message: "تم جلب البيانات بنجاح", data });
    } catch (error) {

        res.status(500).json({ message: "حدث خطأ في جلب البيانات", error: error });
    }
}


const getAllRepresentative = async (req, res) => {
    let data = []
    try {
        let representatives = ""
        if (req.params.state == "true") {
            representatives = await Representative.find({ approved: true }, ["name", "id"]);
        }
        if (req.params.state == "false") {
            representatives = await Representative.find({ approved: false }, ["name", "id"]);
        }

        for (const rep of representatives) {

            const missionComplet = await Mission.countDocuments({ complete: true, representative: rep.id });
            const missionUnComplet = await Mission.countDocuments({ complete: false, representative: rep.id });

            const newRep = {
                id: rep.id,
                name: rep.name,
                missionComplet: missionComplet,
                missionUnComplet: missionUnComplet
            }
            data.push(newRep)
        }
        res.status(200).json({ massage: "تم جلب المندوبين بنجاح", data: data });
    } catch (error) {
        res.status(500).json({ message: "لم نستطع جلب المندوبين", error });
    }
};
const searchInRepresentative = async (req, res) => {
    let data = []
    let representative
    try {

        if (req.params.name == "undefined") {
            representative = await Representative.find({}, ["name", "id"])
        } else {
            representative = await Representative.find({ name: { $regex: req.params.name } }, ["name", "id"])
        }
        for (const rep of representative) {

            const missionComplet = await Mission.countDocuments({ complete: true, representative: rep.id });
            const missionUnComplet = await Mission.countDocuments({ complete: false, representative: rep.id });

            const newRep = {
                id: rep.id,
                name: rep.name,
                missionComplet: missionComplet,
                missionUnComplet: missionUnComplet
            }
            data.push(newRep)
        }
        res.status(200).json({ massage: "تم جلب المندوبين بنجاح", data: data });

    } catch (error) {
        res.status(404).json({ message: "لا يوجد مندوبين بهذا لاسم    ", error });
    }
}
const getRepresentativeById = async (req, res) => {
    try {
        const representative = await Representative.findById(req.params.id);
        if (!representative) {
            return res.status(404).json({ message: "Representative not found" });
        }
        // Generate fresh signed URLs for the identity documents
        const identityFrontSignedUrl = await generateSignedUrl(representative.identityFront.fileName);
        const identityBackSignedUrl = await generateSignedUrl(representative.identityBack.fileName);

        // Create a response object with signed URLs
        const responseData = {
            _id: representative._id,
            name: representative.name,
            email: representative.email,
            phone: representative.phone,
            identityFront: identityFrontSignedUrl,
            identityBack: identityBackSignedUrl,
            location: representative.location,
            accounts: representative.accounts,
            createdAt: representative.createdAt,
            updatedAt: representative.updatedAt

        };

        res.status(200).json(responseData);
    } catch (error) {
        console.log("Error fetching representative:", error);
        res.status(500).json({ message: "Error fetching Representative", error });
    }
};
const uploudLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;


        const representative = await Representative.findById(req.user.id);
        if (!representative) {
            return res.status(404).json({ message: "Representative not found" });
        }
        representative.location = {
            longitude: longitude, latitude: latitude
        };
        await representative.save();
        res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating location", error });
    }
};
const deleteRepresentative = async (req, res) => {
    try {
        const representative = await Representative.findByIdAndDelete(req.params.id);
        if (!representative) {
            return res.status(404).json({ message: "لا يوجد مندوب  " });
        }
        res.status(200).json({ message: "Market deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting Market", error });
    }
}
const updataAccount = async (req, res) => {
    const { id, account } = req.body
    try {
        const representative = await Representative.findById(id, ["accounts"]);
        if (!representative) {
            return res.status(404).json({ message: "Representative not found" });
        }
        const totalaccounts = +representative.accounts + +account

        // Add await here to execute the query
        const rep = await Representative.findOneAndUpdate(
            { _id: id },
            { accounts: totalaccounts },
            { new: true }
        );

        // Convert to plain object or select specific fields
        const repData = rep.toObject ? rep.toObject() : {
            _id: rep._id,
            name: rep.name,
            accounts: rep.accounts
            // Add other fields you need
        };

        res.status(200).json({ message: "Account updated successfully", data: repData });
    } catch (error) {

        res.status(500).json({ message: "Error updating account", error: error.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const rep = await Representative.findOne({ email });
        if (!rep) {
            return res.status(404).json({ message: "Invalid email or password" });
        }
        const isPasswordCorrect = await bcrypt.compare(
            password,
            rep.password
        );
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { email: rep.email, id: rep._id, role: rep.role }, // تصحيح: استخدام rep بدلاً من Representative
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upload identity documents and get both public URLs and file names
        let identityFrontUpload, identityBackUpload;

        try {
            identityFrontUpload = await uploadToGCS(req.files.identityFront[0]);
            identityBackUpload = await uploadToGCS(req.files.identityBack[0]);
        } catch (error) {
            console.error("GCS upload error:", error);
            return res.status(500).json({
                message: "Error uploading identity documents",
                error: error.message
            });
        }
        const representativeData = {
            name,
            email,
            password: hashedPassword,
            role: "representative",
            approved: false,
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

        const newRepresentative = new Representative(representativeData);
        await newRepresentative.save();

        const token = jwt.sign(
            { email: newRepresentative.email, id: newRepresentative._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Generate signed URLs for the response
        const identityFrontSignedUrl = await generateSignedUrl(identityFrontUpload.fileName);
        const identityBackSignedUrl = await generateSignedUrl(identityBackUpload.fileName);
        // Create a response object with signed URLs
        const responseData = {
            _id: newRepresentative._id,
            name: newRepresentative.name,
            email: newRepresentative.email,
            phone: newRepresentative.phone,
            identityFront: identityFrontSignedUrl,
            identityBack: identityBackSignedUrl,
            token
        };

        res.status(201).json(responseData);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });

    }
};
const approveData = async (req, res) => {
    try {
        const rep = await Representative.findByIdAndUpdate(req.params.id, {
            approved: true,
        });
        if (!rep) {
            return res.status(404).json({ message: "Representative not found" });
        }
        rep.approved = true;
        await rep.save();
        res.status(200).json({ message: "Representative approved successfully" });
    } catch (error) {

        res.status(500).json({ message: "Representative approving Market", error });
    }
};

module.exports = {
    repDashboard,
    getAllRepresentative,
    searchInRepresentative,
    getRepresentativeById,
    deleteRepresentative,
    uploudLocation, updataAccount,
    login,
    register, approveData
};
