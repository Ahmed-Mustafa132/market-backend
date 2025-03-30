const jwt = require("jsonwebtoken")

const checkAuth = async (req, res) => {
    const token = req.header('Authorization');
    if (!token) {
        req.isAuthenticated = false;
        return res.status(401).json({ massage: "يرجي تسجيل الدخول" });
    }
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.isAuthenticated = true;
        console.log(decoded.role)
        return res.json(decoded.role);
    }
    catch (error) {
        req.isAuthenticated = false;
        console.log(error);
        return res.status(401).json({ massage: "جلسة غير صالحة" });
    }
}
const isAuth = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('يرجي تسجيل الدخول  ');
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        
    } catch (error) {
        return res.status(401).send({ massage: "الرجاء تسجيل الدخول كمستخدم " });
    }
}
const isManger = async (req, res, next) => {
    const token = req.header('Authorization');
    
    if (!token) return res.status(401).send('يرجي تسجيل الدخول  ');
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role == "manger" || decoded.role == "admin") {
            req.user = decoded;
            next();
        }
    } catch (error) {
        return res.status(401).send({ massage: "الرجاء تسجيل الدخول كمدير " });
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
const isMarket = async (req, res, next) => {
    const token = req.header('Authorization');
    console.log(token)
    if (!token) return res.status(401).send('يرجي تسجيل الدخول  ');
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role == "market") {
            req.user = decoded;
            next();
        }
    } catch (error) {
        return res.status(401).send({ massage: "الرجاء تسجيل الدخول كمدير " });
    }
}
const isMarketOrRep = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('يرجي تسجيل الدخول  ');
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)
        if (decoded.role == "market" || decoded.role == "representative") {
            req.user = decoded;
            console.log(`this is user${req.user}`)   
            next();
        }
    } catch (error) {
        console.log(error)
        return res.status(401).send({ massage: "الرجاء تسجيل الدخول كمندوب او متجر " });
    }
}
const isRepOrUserOrManger = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('يرجي تسجيل الدخول  ');
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role == "representative" || decoded.role == "user" || decoded.role == "manger" || decoded.role == "admin") {
            req.user = decoded;
            console.log(req.user)
            next(); 
        }
    } catch (error) {
        return res.status(401).send({ massage: "الرجاء تسجيل الدخول كمندوب او مستخدم " });
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
module.exports = { isAuth, isRep, checkAuth, isMarket, isManger, isRepOrUserOrManger,  verifyMassage, isMarketOrRep }