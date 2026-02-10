import express from 'express';
import HealthLog from '../models/HealthLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/health-logs
// @desc    Get all health logs for a user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.babyId) {
      filter.babyId = req.query.babyId;
    }
    const healthLogs = await HealthLog.find(filter).sort({ date: -1 });
    res.json(healthLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/health-logs
// @desc    Create a new health log
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { babyName, weight, height, temperature, sleepHours, feeding, symptoms, notes } = req.body;

    const healthLog = await HealthLog.create({
      userId: req.user._id,
      babyId: req.body.babyId, // Save babyId
      babyName: babyName || req.user.babyName,
      weight,
      height,
      temperature,
      sleepHours,
      feeding,
      symptoms,
      notes,
    });

    res.status(201).json(healthLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/health-logs/:id
// @desc    Update a health log
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const healthLog = await HealthLog.findById(req.params.id);

    if (!healthLog) {
      return res.status(404).json({ message: 'Health log not found' });
    }

    if (healthLog.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedLog = await HealthLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/health-logs/:id
// @desc    Delete a health log
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const healthLog = await HealthLog.findById(req.params.id);

    if (!healthLog) {
      return res.status(404).json({ message: 'Health log not found' });
    }

    if (healthLog.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await healthLog.deleteOne();
    res.json({ message: 'Health log removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
