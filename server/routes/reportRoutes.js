import express from 'express';
import mongoose from 'mongoose';
import Report from '../models/Report.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reports
// @desc    Get all reports for a user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/reports (For testing/admin)
// @desc    Create a report
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, type, fileUrl, data } = req.body;
        const report = await Report.create({
            userId: req.user._id,
            title,
            description,
            type,
            fileUrl,
            data
        });
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/reports/summary/:babyId
// @desc    Generate a health summary for a baby
// @access  Private
router.get('/summary/:babyId', protect, async (req, res) => {
    try {
        const { babyId } = req.params;
        // Verify baby belongs to user (optional but good security)

        // Fetch last 30 days of data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const logs = await mongoose.model('HealthLog').find({
            babyId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        // Calculate averages, max, min
        let totalWeight = 0, weightCount = 0;
        let totalSleep = 0, sleepCount = 0;
        let temps = [];

        logs.forEach(log => {
            if (log.weight) { totalWeight += log.weight; weightCount++; }
            if (log.sleepHours) { totalSleep += log.sleepHours; sleepCount++; }
            if (log.temperature) { temps.push(log.temperature); }
        });

        const summary = {
            generatedAt: new Date(),
            period: 'Last 30 Days',
            logsCount: logs.length,
            averageWeight: weightCount ? (totalWeight / weightCount).toFixed(2) : 'N/A',
            averageSleep: sleepCount ? (totalSleep / sleepCount).toFixed(1) : 'N/A',
            maxTemperature: temps.length ? Math.max(...temps) : 'N/A',
            recentLogs: logs.slice(-5) // Last 5 logs
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
