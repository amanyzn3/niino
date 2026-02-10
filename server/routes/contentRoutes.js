import express from 'express';
import { body, validationResult } from 'express-validator';
import Content from '../models/Content.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/content
// @desc    Get content (practitioner: own content; parent: approved content)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;

    if (req.user.role === 'practitioner') {
      const filter = { practitionerId: req.user._id };
      if (statusParam && ['pending', 'approved', 'rejected'].includes(statusParam)) {
        filter.status = statusParam;
      }

      const items = await Content.find(filter)
        .sort({ createdAt: -1 });
      return res.json(items);
    }

    // parents see approved content only
    const items = await Content.find({ status: 'approved' }).sort({ approvedAt: -1, createdAt: -1 });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/content/:id
// @desc    Get content detail
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Content.findById(req.params.id).populate('practitionerId', 'fullName specialization');
    if (!item) return res.status(404).json({ message: 'Content not found' });

    const canRead =
      req.user.role === 'admin' ||
      (req.user.role === 'practitioner' && item.practitionerId?._id?.toString() === req.user._id.toString()) ||
      (req.user.role === 'parent' && item.status === 'approved');

    if (!canRead) return res.status(403).json({ message: 'Not authorized' });

    const shouldCountView = req.query.view === '1' && item.status === 'approved';
    if (shouldCountView) {
      item.views = (item.views || 0) + 1;
      await item.save();
    }

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/content
// @desc    Create new content
// @access  Private (practitioner)
router.post(
  '/',
  protect,
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('body').notEmpty().trim(),
    body('status').optional().isIn(['pending']),
  ],
  async (req, res) => {
    try {
      if (req.user.role !== 'practitioner') {
        return res.status(403).json({ message: 'Only practitioners can create content' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, body: bodyText } = req.body;

      const created = await Content.create({
        practitionerId: req.user._id,
        title,
        description,
        body: bodyText,
        status: 'pending',
      });

      return res.status(201).json(created);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// @route   PUT /api/content/:id
// @desc    Update content (draft/pending)
// @access  Private (practitioner)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'practitioner') {
      return res.status(403).json({ message: 'Only practitioners can update content' });
    }

    const item = await Content.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });
    if (item.practitionerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowed = ['title', 'description', 'body'];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        item[key] = req.body[key];
      }
    }

    await item.save();
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/content/:id/publish
// @desc    Submit content for admin review (sets pending)
// @access  Private (practitioner)
router.post('/:id/publish', protect, async (req, res) => {
  try {
    if (req.user.role !== 'practitioner') {
      return res.status(403).json({ message: 'Only practitioners can publish content' });
    }

    const item = await Content.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });
    if (item.practitionerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    item.status = 'pending';
    await item.save();

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/content/:id/approve
// @desc    Approve content (admin)
// @access  Private (admin)
router.post('/:id/approve', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve content' });
    }
    const item = await Content.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });
    item.status = 'approved';
    item.approvedAt = new Date();
    await item.save();
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/content/:id/reject
// @desc    Reject content (admin)
// @access  Private (admin)
router.post('/:id/reject', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can reject content' });
    }
    const item = await Content.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });
    item.status = 'rejected';
    await item.save();
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private (practitioner: own; admin: any)
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });

    const canDelete =
      req.user.role === 'admin' ||
      (req.user.role === 'practitioner' && item.practitionerId.toString() === req.user._id.toString());

    if (!canDelete) return res.status(403).json({ message: 'Not authorized' });

    await item.deleteOne();
    return res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

