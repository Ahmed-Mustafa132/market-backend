const Representative = require("../model/representativeModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadToGCS } = require("../utils/fileUploader");
const getAllRepresentative = async (req, res) => {
    try {
        const Representatives = await Representative.find({});
        res.status(200).json(Representatives);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Representatives", error });
    }
};
const getRepresentativeById = async (req, res) => {
    try {
        const Representative = await Representative.findById(req.params.id, "name");
        res.status(200).json(Representative);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Representative", error });
    }
};
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
            { email: Representative.email, id: Representative._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        res.status(200).json({ Representative, token });
    } catch (error) {
        status(500).json({ message: "Something went wrong", error });
    }
};
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone, identityFront, identityBack } =
            req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const RepresentativeData = {
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            identityFront,
            identityBack,
        };
        const uploadPromises = [
            uploadToGCS(req.files.identityFront[0]).then(url => RepresentativeData.identityFront = url),
            uploadToGCS(req.files.identityBack[0]).then(url => RepresentativeData.identityBack = url),
        ];
        await Promise.all(uploadPromises);
        const newRepresentative = new Representative(RepresentativeData);
        await newRepresentative.save();
        const token = jwt.sign(
            { email: newRepresentative.email, id: newRepresentative._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        res.status(201).json({ Representative: newRepresentative, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
        console.log(error);
    }
};
module.exports = {
    getAllRepresentative,
    getRepresentativeById,
    login,
    register,
};
