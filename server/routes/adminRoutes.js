import express from 'express';
import User from '../models/User.js';
import Content from '../models/Content.js';
import Query from '../models/Query.js';
import Baby from '../models/Baby.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/practitioners
// @desc    Get all practitioners for validation
// @access  Private (Admin)
router.get('/practitioners', protect, adminOnly, async (req, res) => {
    try {
        const practitioners = await User.find({ role: 'practitioner' }).sort({ createdAt: -1 });
        res.json(practitioners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/practitioners/:id/verify
// @desc    Update verification status of a practitioner
// @access  Private (Admin)
router.put('/practitioners/:id/verify', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.verificationStatus = status;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/admin/practitioners/:id
// @desc    Delete a practitioner account
// @access  Private (Admin)
router.delete('/practitioners/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'practitioner') {
            return res.status(404).json({ message: 'Practitioner not found' });
        }
        await user.deleteOne();
        res.json({ message: 'Practitioner deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/content
// @desc    Get all expert content for approval
// @access  Private (Admin)
router.get('/content', protect, adminOnly, async (req, res) => {
    try {
        const content = await Content.find().populate('practitionerId', 'fullName specialization').sort({ createdAt: -1 });
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/detailed-users
// @desc    Get detailed user aggregation (Babies, Parents, Connections)
// @access  Private (Admin)
router.get('/detailed-users', protect, adminOnly, async (req, res) => {
    try {
        const babies = await Baby.find().populate('parentId', 'fullName email phone').sort({ createdAt: -1 });
        const queries = await Query.find()
            .populate('practitionerId', 'fullName specialization')
            .populate('parentId', 'fullName')
            .populate('babyId', 'name')
            .sort({ createdAt: -1 });

        // Aggregate baby data with their consultations
        const detailedData = babies.map(baby => {
            const consultations = queries.filter(q => q.babyId && q.babyId._id.toString() === baby._id.toString());
            return {
                ...baby.toObject(),
                consultations
            };
        });

        res.json(detailedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
