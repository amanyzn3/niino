import express from 'express';
import Alert from '../models/Alert.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts for a user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const alerts = await Alert.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }
        if (alert.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        alert.read = true;
        await alert.save();
        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/alerts (For testing/admin)
// @desc    Create an alert
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { type, title, description, time, priority } = req.body;
        const alert = await Alert.create({
            userId: req.user._id,
            type,
            title,
            description,
            time,
            priority
        });
        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;
