import mongoose from 'mongoose';

const healthLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  babyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baby',
    // required: true, // Make optional for backward compat for now, or require if migrating
  },
  babyName: {
    type: String,
    // required: true,
  },
  weight: {
    type: Number,
  },
  height: {
    type: Number,
  },
  temperature: {
    type: Number,
  },
  sleepHours: {
    type: Number,
  },
  feeding: {
    type: String,
  },
  symptoms: {
    type: String,
  },
  notes: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const HealthLog = mongoose.model('HealthLog', healthLogSchema);

export default HealthLog;
