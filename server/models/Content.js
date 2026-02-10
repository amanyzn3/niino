import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    practitionerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      // matches StatusBadge usage in UI
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Content = mongoose.model('Content', contentSchema);

export default Content;
