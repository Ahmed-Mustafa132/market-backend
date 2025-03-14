const Market = require('../model/marketModel');
const Representative = require('../model/representativeModel');
const validateMarketRegistration = async (req, res, next) => {
    const { email } = req.body;

    const existingMarket = await Market.findOne({ email });
    if (existingMarket) {
        return res.status(400).json({ message: 'Market already exists' });
    }

    if (!req.files?.BusinessRecords || !req.files?.taxID) {
        return res.status(400).json({ message: 'Identity documents required for rep role' });
    }

    next();
};
const validateRepresentativeRegistration = async (req, res, next) => {
    const { email } = req.body;
    const existingRepresentative = await Representative.findOne({ email });
    if (existingRepresentative) {
        return res.status(400).json({ message: 'Representative already exists' });
    }
    if (!req.files?.identityFront || !req.files?.identityBack) {
        return res.status(400).json({ message: 'Identity documents required for rep role' });
    }
    next();
}

const validateUserRegistration = async (req, res, next) => {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }
    next();
}

module.exports = { validateMarketRegistration, validateRepresentativeRegistration, validateUserRegistration };
