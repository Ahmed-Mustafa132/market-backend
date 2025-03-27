const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus, getOrderById, deleteOrder } = require('../controllers/orderControllers');

// إنشاء طلب جديد
router.post('/', createOrder);

// الحصول على جميع الطلبات
router.get('/', getAllOrders);

// الحصول على طلب بواسطة المعرف
router.get('/:id', getOrderById);

// تحديث حالة الطلب
router.patch('/:id/status', updateOrderStatus);

// حذف طلب
router.delete('/:id', deleteOrder);

module.exports = router;
