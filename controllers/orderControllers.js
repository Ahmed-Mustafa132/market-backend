const Order = require('../model/orderModel');
const Product = require('../model/productModel');
const Market = require('../model/marketModel');
const Representative = require('../model/representativeModel');

// إنشاء طلب جديد
const createOrder = async (req, res) => {
    try {
        const { customer, products, market, paymentMethod, notes } = req.body;

        // حساب المبلغ الإجمالي
        let totalAmount = 0;
        const orderProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `المنتج غير موجود: ${item.product}` });
            }

            const itemPrice = product.price * item.quantity;
            totalAmount += itemPrice;

            orderProducts.push({
                product: item.product,
                quantity: item.quantity,
                price: product.price
            });
        }

        const newOrder = new Order({
            customer,
            products: orderProducts,
            totalAmount,
            market,
            paymentMethod: paymentMethod || 'cash',
            notes
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
const getAllOrders = async (req, res) => {
    try {
        const { role, id } = req.user;
        let query = {};

        // تحديد الاستعلام بناءً على دور المستخدم
        if (role === 'market') {
            query.market = id;
        } else if (role === 'representative') {
            query.representative = id;
        }

        const orders = await Order.find(query)
            .populate('products.product', 'title price')
            .populate('market', 'name')
            .populate('representative', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'تم جلب الطلبات بنجاح',
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};

// الحصول على طلب بواسطة المعرف
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('products.product', 'title price')
            .populate('market', 'name')
            .populate('representative', 'name');

        if (!order) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }

        res.status(200).json({
            message: 'تم جلب الطلب بنجاح',
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};

// تحديث حالة الطلب
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, representative } = req.body;

        const updateData = { status };
        if (representative) {
            updateData.representative = representative;
        }

        const order = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }

        // إرسال إشعارات بتغيير الحالة

        res.status(200).json({
            message: 'تم تحديث حالة الطلب بنجاح',
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
};

// حذف طلب
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
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};
