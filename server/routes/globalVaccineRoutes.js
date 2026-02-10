import express from 'express';
import GlobalVaccine from '../models/GlobalVaccine.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/global-vaccines
// @desc    Get all global vaccines
// @access  Public (or semi-private)
router.get('/', async (req, res) => {
    try {
        const vaccines = await GlobalVaccine.find({}).sort({ weeks: 1 });
        res.json(vaccines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/global-vaccines
// @desc    Create a new global vaccine
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, description, ageCategory, weeks, mandatory } = req.body;

        const vaccine = await GlobalVaccine.create({
            name,
            description,
            ageCategory,
            weeks,
            mandatory
        });

        res.status(201).json(vaccine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/global-vaccines/:id
// @desc    Update a global vaccine
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const vaccine = await GlobalVaccine.findById(req.params.id);

        if (!vaccine) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        const updatedVaccine = await GlobalVaccine.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedVaccine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/global-vaccines/:id
// @desc    Delete a global vaccine
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const vaccine = await GlobalVaccine.findById(req.params.id);

        if (!vaccine) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        await vaccine.deleteOne();
        res.json({ message: 'Vaccine removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
