import express from 'express';
import Query from '../models/Query.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/queries
// @desc    Get queries (parent gets their own; practitioner can filter)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;

    let queries;
    if (req.user.role === 'practitioner') {
      let filter = { status: 'pending' };

      // supported: pending (default), answered, all
      if (statusParam === 'answered') {
        // Show all answered queries (collaborative view)
        filter = { status: 'answered' };
      } else if (statusParam === 'all') {
        // Show everything (pending + all answered)
        filter = {};
      } else if (statusParam === 'pending' || !statusParam) {
        filter = { status: 'pending' };
      }

      queries = await Query.find(filter)
        .populate('parentId', 'fullName email babyName')
        .populate('practitionerId', 'fullName specialization')
        .sort({ createdAt: -1 });
    } else {
      const filter = { parentId: req.user._id };
      if (req.query.babyId) {
        filter.babyId = req.query.babyId;
      }

      if (statusParam && ['pending', 'answered', 'closed'].includes(statusParam)) {
        filter.status = statusParam;
      }

      queries = await Query.find(filter)
        .populate('practitionerId', 'fullName specialization')
        .sort({ createdAt: -1 });
    }

    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/queries
// @desc    Create a new query (parent only)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can create queries' });
    }

    const { question, babyId } = req.body;

    const query = await Query.create({
      parentId: req.user._id,
      babyId,
      question,
      attachments: req.body.attachments || [],
      status: 'pending',
    });

    res.status(201).json(query);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/queries/:id/respond
// @desc    Respond to a query (practitioner only)
// @access  Private
router.put('/:id/respond', protect, async (req, res) => {
  try {
    if (req.user.role !== 'practitioner') {
      return res.status(403).json({ message: 'Only practitioners can respond to queries' });
    }

    const { response } = req.body;
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    query.response = response;
    query.practitionerId = req.user._id;
    query.status = 'answered';
    query.isApproved = true; // No longer requires approval

    await query.save();

    const populated = await Query.findById(query._id)
      .populate('parentId', 'fullName email babyName')
      .populate('practitionerId', 'fullName specialization');

    res.json(populated || query);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/queries/:id
// @desc    Update a query
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    if (req.user.role === 'parent' && query.parentId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedQuery = await Query.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedQuery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/queries/:id
// @desc    Delete a query
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    if (query.parentId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await query.deleteOne();
    res.json({ message: 'Query removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
