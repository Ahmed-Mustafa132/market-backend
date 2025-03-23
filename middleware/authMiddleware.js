const jwt = require("jsonwebtoken")

const checkAuth = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        req.isAuthenticated = false;
        return res.status(401).json({ massage: "يرجي تسجيل الدخول" });
    }
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.isAuthenticated = true;
        return res.json(decoded.role);
    }
    catch (error) {
        req.isAuthenticated = false;
        console.log(error);
        return res.status(401).json({ massage: "جلسة غير صالحة" });
    }
}

const isRep = async (req, res, next) => {
    
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('يرجي تسجيل الدخول  ');
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role == "representative") {
            req.user = decoded;
            next();
        }
    } catch (error) {
        return res.status(401).send({ massage: "الرجاء تسجيل الدخول كمندوب " });
    }
}
const verifyMassage = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('يرجي تسجيل الدخول  ');
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role == "representative"|| decoded.role == "manger") {
            req.user = decoded;
            next();
        }
    } catch (error) {
        return res.status(401).send({ massage: "الرجاء تسجيل الدخول كمندوب او مدير " });
    }
}
module.exports = { isRep, checkAuth, verifyMassage }