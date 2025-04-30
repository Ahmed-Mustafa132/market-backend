const mongoose = require('mongoose');

const massageSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'fromModel',
        required: true,
    },
    fromModel: {
        type: String,
        enum: ['manager', 'representative', 'market'],
        default: 'manager'
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'toModel',
        required: true,
    },
    toModel: {
        type: String,
        enum: ['manager', 'representative', 'market']
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

const Massage = mongoose.model('Massage', massageSchema);

module.exports = Massage;
