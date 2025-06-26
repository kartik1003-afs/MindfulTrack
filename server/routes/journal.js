// const express = require('express');
// const router = express.Router();
// const { body, validationResult } = require('express-validator');
// const JournalEntry = require('../models/JournalEntry');
// const auth = require('../middleware/auth');
// const { analyzeSentiment, generateWeeklySummary } = require('../services/aiService');

// // Create new journal entry
// router.post('/', auth, [
//   body('content').trim().notEmpty().withMessage('Content is required')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { content } = req.body;

//     // Get AI analysis

// let analysis;
// try {
//   analysis = await analyzeSentiment(content);
//   console.log('AI Analysis Result:', analysis);
// } catch (aiError) {
//   console.error('AI Analysis Failed:', aiError);
//   return res.status(500).json({ message: 'AI analysis failed', error: aiError.message });
// }




//     // const analysis = await analyzeSentiment(content);
//     // console.log('AI Analysis Result:', analysis);



//     // Create journal entry
//     const entry = new JournalEntry({
//       user: req.user._id,
//       content,
//       mood: analysis.mood,
//       sentimentScore: analysis.sentimentScore,
//       aiFeedback: analysis.aiFeedback,
//       tags: analysis.tags
//     });

//     const savedEntry = await entry.save();
//     console.log('Saved Entry:', savedEntry);

//     res.status(201).json(savedEntry);
//   } catch (error) {
//     console.error('Journal Entry Error:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ message: error.message });
//     }
//     res.status(500).json({ message: 'Failed to create journal entry', error: error.message });
//   }
// });

// // Get all journal entries for user
// router.get('/', auth, async (req, res) => {
//   try {
//     const entries = await JournalEntry.find({ user: req.user._id })
//       .sort({ createdAt: -1 });
//     res.json(entries);
//   } catch (error) {
//     console.error('Fetch Entries Error:', error);
//     res.status(500).json({ message: 'Failed to fetch journal entries', error: error.message });
//   }
// });

// // Get weekly summary
// router.get('/weekly-summary', auth, async (req, res) => {
//   try {
//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//     const entries = await JournalEntry.find({
//       user: req.user._id,
//       createdAt: { $gte: oneWeekAgo }
//     }).sort({ createdAt: 1 });

//     if (entries.length === 0) {
//       return res.json({ message: 'No entries found for the past week' });
//     }

//     const summary = await generateWeeklySummary(entries);
//     res.json({ summary, entries });
//   } catch (error) {
//     console.error('Weekly Summary Error:', error);
//     res.status(500).json({ message: 'Failed to generate weekly summary', error: error.message });
//   }
// });

// // Get entry by ID
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const entry = await JournalEntry.findOne({
//       _id: req.params.id,
//       user: req.user._id
//     });

//     if (!entry) {
//       return res.status(404).json({ message: 'Entry not found' });
//     }

//     res.json(entry);
//   } catch (error) {
//     console.error('Fetch Entry Error:', error);
//     res.status(500).json({ message: 'Failed to fetch journal entry', error: error.message });
//   }
// });

// // Delete entry
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const entry = await JournalEntry.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id
//     });

//     if (!entry) {
//       return res.status(404).json({ message: 'Entry not found' });
//     }

//     res.json({ message: 'Entry deleted successfully' });
//   } catch (error) {
//     console.error('Delete Entry Error:', error);
//     res.status(500).json({ message: 'Failed to delete journal entry', error: error.message });
//   }
// });

// module.exports = router; 








const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const JournalEntry = require('../models/JournalEntry');
const auth = require('../middleware/auth');
const { analyzeSentiment, generateWeeklySummary } = require('../services/aiService');

// Create new journal entry
router.post('/', auth, [
  body('content').trim().notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    // Get AI analysis
    let analysis;
    try {
      analysis = await analyzeSentiment(content);
      console.log('AI Analysis Result:', analysis);

      // Optional: Log if any field is missing
      if (!analysis.mood || !analysis.sentimentScore) {
        console.warn('AI returned incomplete data:', analysis);
      }
    } catch (aiError) {
      console.error('AI Analysis Failed:', aiError);
      return res.status(500).json({ message: 'AI analysis failed', error: aiError.message });
    }

    // Create journal entry with fallback values
    const entry = new JournalEntry({
      user: req.user._id,
      content,
      mood: analysis.mood || 'neutral',
      sentimentScore: analysis.sentimentScore ?? 0,
      aiFeedback: analysis.aiFeedback || 'No feedback available.',
      tags: Array.isArray(analysis.tags) ? analysis.tags : []
    });

    const savedEntry = await entry.save();
    console.log('Saved Entry:', savedEntry);

    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Journal Entry Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create journal entry', error: error.message });
  }
});

// Get all journal entries for user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Fetch Entries Error:', error);
    res.status(500).json({ message: 'Failed to fetch journal entries', error: error.message });
  }
});

// Get weekly summary
router.get('/weekly-summary', auth, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const entries = await JournalEntry.find({
      user: req.user._id,
      createdAt: { $gte: oneWeekAgo }
    }).sort({ createdAt: 1 });

    if (entries.length === 0) {
      return res.json({ message: 'No entries found for the past week' });
    }

    const summary = await generateWeeklySummary(entries);
    res.json({ summary, entries });
  } catch (error) {
    console.error('Weekly Summary Error:', error);
    res.status(500).json({ message: 'Failed to generate weekly summary', error: error.message });
  }
});

// Get entry by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Fetch Entry Error:', error);
    res.status(500).json({ message: 'Failed to fetch journal entry', error: error.message });
  }
});

// Delete entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete Entry Error:', error);
    res.status(500).json({ message: 'Failed to delete journal entry', error: error.message });
  }
});

module.exports = router;
