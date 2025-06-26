const express = require('express');
const router = express.Router();
const { analyzeSentiment, generateWeeklySummary } = require('../services/aiService');
const auth = require('../middleware/auth');

// Analyze sentiment of a journal entry
router.post('/analyze', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const analysis = await analyzeSentiment(content);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ message: 'Error analyzing sentiment' });
  }
});

// Generate weekly summary
router.get('/weekly-summary', auth, async (req, res) => {
  try {
    const summary = await generateWeeklySummary(req.user._id);
    res.json(summary);
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    res.status(500).json({ message: 'Error generating weekly summary' });
  }
});

module.exports = router; 