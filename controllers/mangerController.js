const Manger = require('../model/mangerModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getAllManger = async (req, res) => {
    try {
        const mangers = await Manger.find({});
        res.status(200).json(mangers);
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
        const token = jwt.sign({ id: manger._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    getMangerById,
    login,
    register,
};