import express from 'express';
import Baby from '../models/Baby.js';
import HealthLog from '../models/HealthLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/babies
// @desc    Get all babies for current user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const babies = await Baby.find({ parentId: req.user._id }).sort({ createdAt: -1 });
        res.json(babies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/babies
// @desc    Add a new baby
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, dateOfBirth, gender, avatar } = req.body;
        const baby = await Baby.create({
            parentId: req.user._id,
            name,
            dateOfBirth,
            gender,
            avatar
        });
        res.status(201).json(baby);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/babies/:id
// @desc    Update baby
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const baby = await Baby.findById(req.params.id);
        if (!baby || baby.parentId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const updated = await Baby.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/babies/:id
// @desc    Delete baby and their logs
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const baby = await Baby.findById(req.params.id);
        if (!baby || baby.parentId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        // Delete related health logs
        await HealthLog.deleteMany({ babyId: baby._id });
        // Add other cascades (vaccinations etc) later

        await baby.deleteOne();
        res.json({ message: 'Baby profile deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;
