import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  babyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baby',
    required: true,
  },
  babyName: {
    type: String,
    required: false, // Legacy or optional if we have babyId
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const Vaccination = mongoose.model('Vaccination', vaccinationSchema);

export default Vaccination;
