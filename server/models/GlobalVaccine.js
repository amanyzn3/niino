import mongoose from 'mongoose';

const globalVaccineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    ageCategory: {
        type: String, // e.g. "6 Weeks"
        required: true
    },
    weeks: {
        type: Number, // Weeks from birth for due date calculation
        required: true
    },
    mandatory: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

const GlobalVaccine = mongoose.model('GlobalVaccine', globalVaccineSchema);

export default GlobalVaccine;
