const mistralService = require('../services/mistralService');
const newsService = require('../services/newsService');

const analyzeQuery = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const sources = await newsService.fetchAllSources(query);

    const articles = [
      ...(sources.newsapi || []).slice(0, 2),
      ...(sources.guardian || []).slice(0, 2),
      ...(sources.bbc || []).slice(0, 1),
      ...(sources.aljazeera || []).slice(0, 1),
      ...(sources.rt || []).slice(0, 1),
    ];

    const analyzed = await mistralService.analyzeMultiple(articles);

    res.json({ success: true, query, articles: analyzed });
  } catch (error) {
    console.error('analyzeQuery error:', error.message);
    res.status(500).json({ error: 'Failed to analyze articles' });
  }
};

const analyzeURL = async (req, res) => {
  try {
    const { url, title, source, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Article content is required' });
    }

    const analysis = await mistralService.detectFakeNews({
      url,
      title,
      source,
      content,
    });

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('analyzeURL error:', error.message);
    res.status(500).json({ error: 'Failed to analyze article' });
  }
};

module.exports = {
  analyzeQuery,
  analyzeURL,
};