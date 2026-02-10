import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['parent', 'practitioner', 'admin'],
    required: true,
  },
  phone: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  dateOfBirth: {
    type: Date,
  },
  // Parent-specific fields
  babyName: {
    type: String,
  },
  babyAvatar: {
    // data URL (base64) or URL for baby's photo
    type: String,
  },
  // Practitioner-specific fields
  specialization: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
  qualification: {
    type: String,
  },
  // Optional profile fields (used by practitioner UI)
  avatar: {
    // data URL (base64) or URL
    type: String,
  },
  experienceYears: {
    type: Number,
    min: 0,
    max: 80,
  },
  hospital: {
    type: String,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
