const newsService = require('../services/newsService');

const searchNews = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await newsService.fetchAllSources(query);
    res.json({ success: true, query, results });
  } catch (error) {
    console.error('searchNews error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

const fetchRSSFeed = async (req, res) => {
  try {
    const { source } = req.params;
    const articles = await newsService.fetchFromRSS(source);
    res.json({ success: true, source, articles });
  } catch (error) {
    console.error('fetchRSSFeed error:', error.message);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
};

module.exports = {
  searchNews,
  fetchRSSFeed,
};