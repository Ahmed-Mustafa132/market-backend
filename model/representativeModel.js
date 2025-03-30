const mongoose = require('mongoose');
const validator = require('validator');

const representativeSchema = new mongoose.Schema({
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
    },
    phone: {
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
    identityFront: {
        url: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        }
    },
    identityBack: {
        url: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default:"representative"
    },
    location: {
        longitude: {
            type: Number,
            default: 0
        },
        latitude: {
            type: Number,
            default: 0
        }
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
const Representative = mongoose.model('Representative', representativeSchema);
module.exports = Representative;
        