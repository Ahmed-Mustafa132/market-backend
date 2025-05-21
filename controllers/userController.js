const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const sendEmail = require('../utils/sendEmail');


const getAllUser = async (req, res) => {
    try {
        const users = await User.find({},"name");
        res.status(200).json({massage: "تم جلب المتخدمين بنجاح ", data:users});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id, ["name","email"]);
        res.status(200).json({massage:"تم جلب البيانات " , data:user});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "لا يوجد مستخدم  " });
        }
        res.status(200).json({ message: "Market deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting Market", error });
    }
}
const searchInUser = async (req, res) => {
            console.log(req.params.name)
            let users 
            try {
                if (req.params.name == "undefined") {
                    users = await User.find({}, ["name", "id"])
                } else {
                    users = await User.find({ name: { $regex: req.params.name } }, ["name", "id"])    
                }
                res.status(200).json({ massage: "تم جلب المهام بنجاح", data: users });
            } catch (error) {
                res.status(500).json({ message: "Error fetching mangers", error });
            }
}
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ email: user.email, id: user._id,role:user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ user, token });
    } catch (error) {
        atus(500).json({ message: 'Something went wrong', error });
    }
};
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            name, email, password: hashedPassword
        }
        const user = await User.create(userData);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
         
    }
};


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const google = async (req, res) => {
    try {
        const { token } = req.body;
        // التحقق من صحة الـ Token القادم من Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();// معلومات المستخدم
        console.log(payload);
        const { sub, email, name } = payload;
        
        let user = await User.findOne({ email });
        
        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            user = new User({
                name,
                email,
                password: hashedPassword,
                role:"user"
            });
            const res = await user.save();
            user = await User.findOne({ email });
        }
        
        // إنشاء JWT خاص بالتطبيق
        const userToken = jwt.sign(
            { id: user.id, email, name, role:user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        res.json({ token: userToken, user: { email, name } });
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
         
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const resetLink = `http://a-souq/reset-password/user/${token}`;

        await sendEmail(user.email, 'إعادة تعيين كلمة المرور', `مرحباً ${user.name}،

        نود إعلامك بأننا تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
        
        يرجى النقر على الرابط أدناه لإعادة تعيين كلمة المرور:
        ${resetLink}
        
        هذا الرابط صالح لمدة ساعة واحدة فقط.
        
        إذا لم تقم بطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
        
        مع خالص التحيات،
        فريق a-souq.com`);

        res.json({ message: 'رابط تحديث كلمة السر تم ارساله الي بريدك' });
    } catch (error) {
        console.log(error)
    }
};
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'تم تحديث كلمة السر بنجاح' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

module.exports = {
    getAllUser,
    searchInUser,
    getUserById,
    deleteUser,
    login,
    register,
    google,
    forgotPassword,
    resetPassword
};
