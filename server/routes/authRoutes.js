import express from 'express';
import User from '../models/User.js';
import Baby from '../models/Baby.js';
import { generateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  body('role').optional().isIn(['parent', 'practitioner', 'admin']),
  body('specialization').custom((value, { req }) => {
    const role = req.body.role || 'parent';
    if (role === 'practitioner' && !value) {
      throw new Error('Specialization is required for practitioners');
    }
    return true;
  }),
  body('licenseNumber').custom((value, { req }) => {
    const role = req.body.role || 'parent';
    if (role === 'practitioner' && !value) {
      throw new Error('License number is required for practitioners');
    }
    return true;
  }),
  body('qualification').custom((value, { req }) => {
    const role = req.body.role || 'parent';
    if (role === 'practitioner' && !value) {
      throw new Error('Qualification is required for practitioners');
    }
    return true;
  }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, role, phone, gender, dateOfBirth, babyName, specialization, licenseNumber, qualification } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      fullName,
      role: role || 'parent',
      phone,
      gender,
      dateOfBirth,
      babyName,
      specialization,
      licenseNumber,
      qualification,
    });

    // If user is a parent, create a Baby record automatically
    if (user && (role === 'parent' || !role)) {
      if (babyName) {
        await Baby.create({
          parentId: user._id,
          name: babyName,
          gender: gender,
          dateOfBirth: dateOfBirth,
          avatar: null
        });
      }
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        babyName: user.babyName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        specialization: user.specialization,
        licenseNumber: user.licenseNumber,
        qualification: user.qualification,
        avatar: user.avatar,
        experienceYears: user.experienceYears,
        hospital: user.hospital,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {

      // Auto-migrate: If parent has baby details but no Baby record, create one
      if (user.role === 'parent' && user.babyName) {
        try {
          const babyExists = await Baby.findOne({ parentId: user._id });
          if (!babyExists) {
            await Baby.create({
              parentId: user._id,
              name: user.babyName,
              gender: user.gender,
              dateOfBirth: user.dateOfBirth,
              avatar: user.babyAvatar || null
            });
            console.log('Auto-created missing baby record for:', user.email);
          }
        } catch (err) {
          console.error('Error auto-migrating baby:', err);
        }
      }

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        babyName: user.babyName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        specialization: user.specialization,
        licenseNumber: user.licenseNumber,
        qualification: user.qualification,
        avatar: user.avatar,
        experienceYears: user.experienceYears,
        hospital: user.hospital,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
