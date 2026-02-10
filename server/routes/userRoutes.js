import express from 'express';
import User from '../models/User.js';
import Baby from '../models/Baby.js';
import HealthLog from '../models/HealthLog.js';
import Vaccination from '../models/Vaccination.js';
import Query from '../models/Query.js';
import Report from '../models/Report.js';
import Alert from '../models/Alert.js';
import Content from '../models/Content.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    // Only allow updating safe profile fields
    const allowedFields = [
      'fullName',
      'phone',
      'gender',
      'dateOfBirth',
      'babyName',
      'babyAvatar',
      'specialization',
      'licenseNumber',
      'qualification',
      'avatar',
      'experienceYears',
      'hospital',
    ];

    const update = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        update[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// @route   DELETE /profile
// @desc    Delete user account and all associated data
// @access  Private
router.delete('/profile', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Delete linked Babies
    // First get baby IDs to be safe if we need them, though cascading usually needs parentId
    // Assuming babySchema has parentId ref to User
    await Baby.deleteMany({ parentId: userId });

    // 2. Delete HealthLogs (userId)
    await HealthLog.deleteMany({ userId: userId });

    // 3. Delete Vaccinations (userId)
    await Vaccination.deleteMany({ userId: userId });

    // 4. Delete Reports (userId)
    await Report.deleteMany({ userId: userId });

    // 5. Delete Alerts (userId)
    await Alert.deleteMany({ userId: userId });

    // 6. Delete Queries (parentId)
    await Query.deleteMany({ parentId: userId });

    // 7. Delete Content (practitionerId) - in case user is a practitioner
    await Content.deleteMany({ practitionerId: userId });

    // 8. Delete User
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error during account deletion' });
  }
});

export default router;
