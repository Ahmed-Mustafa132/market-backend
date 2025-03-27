const mongoose = require('mongoose');

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
    rate: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;