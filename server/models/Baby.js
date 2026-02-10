import mongoose from 'mongoose';

const babySchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    avatar: {
        type: String, // base64
    },
}, {
    timestamps: true,
});

const Baby = mongoose.model('Baby', babySchema);

export default Baby;
