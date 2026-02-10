import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['vaccination', 'health', 'milestone', 'general'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    time: {
        type: String, // e.g. "2 days away", or Date
    },
    priority: {
        type: String, // 'high', 'normal'
        default: 'normal'
    },
    read: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
