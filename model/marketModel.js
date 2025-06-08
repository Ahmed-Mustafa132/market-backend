const mongoose = require('mongoose');
const validator = require('validator');
const marketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (value) {
                return value.length >= 7 && value.length <= 64;
            },
            message: 'Password must be between 7 and 64 characters'
        }
    }, phone: {
        type: String,
        trim: true,
        unique: true,
        length: 11,
        required: true,
        validate: {
            validator: function (value) {
                return /^\d{11}$/.test(value);
            },
            message: 'Phone number must be 11 digits'
        }
    },

    BusinessRecords: {
        type: String,
        required: true,
        unique: true
    },
    taxID: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        enum: ['market']
    },
    accounts: {
        type: String,
        default: "0"
    },
    approved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const Market = mongoose.model('Market', marketSchema);
module.exports = Market;