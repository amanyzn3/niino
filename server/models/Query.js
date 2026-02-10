import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  babyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baby',
  },
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  question: {
    type: String,
    required: true,
  },
  response: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'closed'],
    default: 'pending',
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  attachments: [{
    type: String
  }],
}, {
  timestamps: true,
});

const Query = mongoose.model('Query', querySchema);

export default Query;
