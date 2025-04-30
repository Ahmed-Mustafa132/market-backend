const Order = require('../model/orderModel');
const Product = require('../model/productModel');
const Market = require('../model/marketModel');
const Representative = require('../model/representativeModel');
const User = require('../model/userModel');


// إنشاء طلب جديد
const createOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'يرجي تسجيل الدخول' });
        }
        let representative = null;
        let custmer = "null";
        if (req.user.role == 'representative' || req.user.role == "manger" || req.user.role == "admin") {
            custmer = req.body.client;
            representative = req.user.id
        }
        if (req.user.role == "user") {
            const user = await User.findById(req.user.id, ["name"]);
            custmer = user.name;
        }
        const { productId, note, phone, address, quantity, } = req.body;
        const product = await Product.findById(productId, ["market", "price", "title"]);
        if (!product) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }
        // حساب المبلغ الإجمالي
        let totalAmount = product.price * quantity;
        const newOrder = new Order({
            client: custmer,
            product: productId,
            totalAmount,
            market: product.market,
            notes: note,
            phone: phone,
            address: address,
            quantity: quantity,
            approved: false,
            ...(representative && { representative })
        });
        await newOrder.save();

        // إرسال إشعار للمتجر
        res.status(201).json({
            message: 'تم إنشاء الطلب بنجاح',
            data: newOrder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};

// الحصول على جميع الطلبات
const getAllOrdersForRep = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'يرجي تسجيل الدخول' });
    }

    try {
        let data = [];
        if (req.user.role == 'representative') {
            const orders = await Order.find({ representative: req.user.id }, ["client", "product", "quantity"])
            for (const order of orders) {
                const product = await Product.findById(order.product, ["title"]);
                const ordardata = {
                    id: order._id,
                    client: order.client,
                    product: product.title,
                    quantity: order.quantity,
                    approved: order.approved,
                }
                data.push(ordardata)
            }
        }
        if (req.user.role == 'market') {
            const orders = await Order.find({ market: req.user.id, approved: true }, ["client", "product", "quantity"])
            console.log({ orders: orders })
            for (const order of orders) {
                const product = await Product.findById(order.product, ["title"]);
                const ordardata = {
                    id: order._id,
                    client: order.client,
                    product: product.title,
                    quantity: order.quantity,
                    approved: order.approved,
                }
                data.push(ordardata)
            }
        }
        if (req.user.role == "admin" || req.user.role == "manger") {
            const orders = await Order.find({ approved: true }, ["client", "product", "quantity"])
            for (const order of orders) {
                const product = await Product.findById(order.product, ["title"]);
                const ordardata = {
                    id: order._id,
                    client: order.client,
                    product: product.title,
                    quantity: order.quantity,
                    approved: order.approved,
                }
                data.push(ordardata)
            }
        }

        console.log(data)
        res.status(200).json({
            message: 'تم جلب الطلبات بنجاح',
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};
const getOrderByState = async (req, res) => {
    let data = [];
    const orders = await Order.find({ approved: req.params.state }, ["client", "product", "quantity"])
    for (const order of orders) {
        const product = await Product.findById(order.product, ["title"]);
        const ordardata = {
            id: order._id,
            client: order.client,
            product: product.title,
            quantity: order.quantity,
        }
        data.push(ordardata)
    }
    res.status(200).json({
        message: 'تم جلب الطلبات بنجاح',
        data: data
    });

}
// الحصول على طلب بواسطة المعرف
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id, ["client", "product", "quantity", "phone", "address", "number", "totalAmount"]);
        const product = await Product.findById(order.product, ["title", "market"]);
        const market = await Market.findById(product.market, ["name"]);
        const ordardata = {
            id: order._id,
            client: order.client,
            product: product.title,
            phone: order.phone,
            address: order.address,
            market: market.name,
            quantity: order.quantity
        }
        console.log(ordardata)

        res.status(200).json({
            message: 'تم جلب الطلب بنجاح',
            data: ordardata
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};

// تحديث حالة الطلب
const getOrderSearch = async (req, res) => {
    try {
        let data = [];
        if (!req.user) {
            return res.status(401).json({ message: 'يرجي تسجيل الدخول' });
        }
        if (req.user.role == "representative") {
            const searchRegex = new RegExp(req.params.search, 'i');

            const orders = await Order.find({
                representative: req.user.id,
                $or: [
                    { client: searchRegex },
                    { phone: searchRegex },
                    { address: searchRegex }
                ]
            }).populate('product', 'title');
            for (const order of orders) {
                const product = await Product.findById(order.product, ["title"]);
                const ordardata = {
                    id: order._id,
                    client: order.client,
                    product: product.title,
                    quantity: order.quantity,
                }
                data.push(ordardata)
            }
        }
        if (req.user.role == "market") {
            const searchRegex = new RegExp(req.params.search, 'i');

            const orders = await Order.find({
                market: req.user.id,
                $or: [
                    { client: searchRegex },
                ]
            }).populate('product', 'title'); console.log(orders)
            for (const order of orders) {
                const product = await Product.findById(order.product, ["title"]);
                const ordardata = {
                    id: order._id,
                    client: order.client,
                    product: product.title,
                    quantity: order.quantity,
                }
                data.push(ordardata)
            }
        }
        if (req.user.role == "admin" || req.user.role == "manger") {
            const searchRegex = new RegExp(req.params.search, 'i');

            const orders = await Order.find({
                $or: [
                    { client: searchRegex },
                ]
            }).populate('product', 'title'); console.log(orders)
            for (const order of orders) {
                const product = await Product.findById(order.product, ["title"]);
                const ordardata = {
                    id: order._id,
                    client: order.client,
                    product: product.title,
                    quantity: order.quantity,
                }
                data.push(ordardata)
            }
        }

        res.status(200).json({
            message: 'تم تحديث حالة الطلب بنجاح',
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};

// حذف طلب
const approveOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );
        res.status(200).json({
            message: 'تم تحديث حالة الطلب بنجاح',
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
}
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }

        res.status(200).json({
            message: 'تم حذف الطلب بنجاح'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createOrder,
    getAllOrdersForRep,
    getOrderById,
    getOrderSearch,
    deleteOrder, getOrderByState, approveOrder
};
