const mongoose = require('mongoose'); 
const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true },
    comment: String,
    createdAt: { type: Date, default: Date.now }
});
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        url: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        }
    },
    market: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    approved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;