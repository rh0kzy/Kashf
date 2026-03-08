const gdeltService = require('../services/gdeltService');

const getConflictEvents = async (req, res) => {
  try {
    const { timespan = '1week' } = req.query;
    const articles = await gdeltService.fetchConflictArticles(timespan);
    res.json({ success: true, articles });
  } catch (error) {
  console.error('getConflictEvents error:', error.message);
  console.error('Full error:', error.response?.data || error.stack);
  res.status(500).json({ error: 'Failed to fetch conflict events', details: error.message });
}
};

const getNewsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const { timespan = '1week' } = req.query;
    const articles = await gdeltService.fetchArticlesByLocation(location, timespan);
    res.json({ success: true, location, articles });
  } catch (error) {
    console.error('getNewsByLocation error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news for location' });
  }
};

const getToneTimeline = async (req, res) => {
  try {
    const { query, timespan = '1month' } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const data = await gdeltService.fetchToneTimeline(query, timespan);
    res.json({ success: true, data });
  } catch (error) {
    console.error('getToneTimeline error:', error.message);
    res.status(500).json({ error: 'Failed to fetch tone timeline' });
  }
};

const getConflictByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const { timespan = '1week' } = req.query;
    const articles = await gdeltService.fetchConflictByCountry(country, timespan);
    res.json({ success: true, country, articles });
  } catch (error) {
    console.error('getConflictByCountry error:', error.message);
    res.status(500).json({ error: 'Failed to fetch conflict data for country' });
  }
};

module.exports = {
  getConflictEvents,
  getNewsByLocation,
  getToneTimeline,
  getConflictByCountry,
};