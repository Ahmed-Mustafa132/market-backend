// نموذج الطلب (Order Model)
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    client: {
        type: String,
        required: true,

    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
    market: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Market",
        required: true,
    },
    representative: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Representative",

    },
    approved: { type: Boolean, default: false },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
