const SearchHistory = require('../models/SearchHistory');

const getHistory = async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const limit = parseInt(req.query.limit) || 10;

    const history = await SearchHistory.find({ userId })
      .sort({ searchDate: -1 })
      .limit(limit);

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
};

const clearHistory = async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    await SearchHistory.deleteMany({ userId });
    res.json({ message: 'Search history cleared successfully' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
};

module.exports = {
  getHistory,
  clearHistory
};
