import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    fileUrl: {
        type: String, // Path to PDF/File if applicable
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
    },
    type: {
        type: String,
        enum: ['growth', 'health', 'vaccination', 'general'],
        default: 'general'
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
