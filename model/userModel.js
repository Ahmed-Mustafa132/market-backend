const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ['user','rep', 'market','admin'],
        default: 'user'
    },
    phone: {
        type: String,
        trim: true,
        unique: true,
        length: 11,
        required: function () {
            return this.role === 'market' || this.role === 'admin';
        },
        validate: {
            validator: function (value) {
                return /^\d{11}$/.test(value);
            },
            message: 'Phone number must be 11 digits'
        }
    },
    identityFront: {
        type: String,
        required: function () {
            return this.role === 'rep';
        }
    },
    identityBack: {
        type: String,
        required: function () {
            return this.role === 'rep';
        }
    },
    BusinessRecords: {
        type: String,
        required: function () {
            return this.role === 'market';
        }
    },
    taxID: {
        type: String,
        required: function () {
            return this.role === 'market';
        }
    }
}, {
    timestamps: true
});
const User = mongoose.model('User', userSchema);
module.exports = User;