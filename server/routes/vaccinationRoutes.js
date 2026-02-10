import express from 'express';
import Vaccination from '../models/Vaccination.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/vaccinations
// @desc    Get all vaccinations for a user
// @access  Private
// @route   GET /api/vaccinations
// @desc    Get all vaccinations for a user (optionally filtered by babyId)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.babyId) {
      filter.babyId = req.query.babyId;
    }
    const vaccinations = await Vaccination.find(filter).sort({ dueDate: -1 });
    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/vaccinations
// @desc    Create a new vaccination
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { babyId, babyName, name, description, dueDate, completedDate, status } = req.body;

    const vaccination = await Vaccination.create({
      userId: req.user._id,
      babyId,
      babyName: babyName || undefined,
      name,
      description,
      dueDate,
      completedDate,
      status: status || 'pending',
    });

    res.status(201).json(vaccination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/vaccinations/:id
// @desc    Update a vaccination
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);

    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination not found' });
    }

    if (vaccination.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedVaccination = await Vaccination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedVaccination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/vaccinations/:id
// @desc    Delete a vaccination
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);

    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination not found' });
    }

    if (vaccination.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await vaccination.deleteOne();
    res.json({ message: 'Vaccination removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
