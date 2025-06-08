const mongoose = require('mongoose');
const validator = require('validator');
const mangerSchema = new mongoose.Schema({
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
        validator(value) {
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
    role: {
        type: String,
        required: true,
        enum: ['manger', 'admin'],
        default: 'manger'
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    identityFront: {
        type: String,
        required: true,
        unique: true,
    },
    identityBack: {
        type: String,
        required: true,
        unique: true,
    },
    accounts: {
        type: String,
        default: "0"
    }
}, {
    timestamps: true
});
const Manger = mongoose.model('Manger', mangerSchema);
module.exports = Manger;