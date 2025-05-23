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
        reequired: true,
        default: 'user'
    }
}, {
    timestamps: true,
}
);
const User = mongoose.model('User', userSchema);
module.exports = User;