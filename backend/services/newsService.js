const axios = require('axios');
const RSSParser = require('rss-parser');

const parser = new RSSParser();

const RSS_FEEDS = {
  aljazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
  rt: 'https://www.rt.com/rss/',
  bbc: 'http://feeds.bbci.co.uk/news/world/rss.xml',
  reuters: 'https://feeds.reuters.com/reuters/worldNews',
  france24: 'https://www.france24.com/en/rss',
};

const fetchFromNewsAPI = async (query) => {
  const response = await axios.get('https://newsapi.org/v2/everything', {
    params: {
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 5,
      apiKey: process.env.NEWSAPI_KEY,
    },
  });
  return response.data.articles.map((a) => ({
    source: a.source.name,
    title: a.title,
    summary: a.description,
    url: a.url,
    publishedAt: a.publishedAt,
    image: a.urlToImage,
  }));
};

const fetchFromGNews = async (query) => {
  const response = await axios.get('https://gnews.io/api/v4/search', {
    params: {
      q: query,
      lang: 'en',
      max: 5,
      token: process.env.GNEWS_KEY,
    },
  });
  return response.data.articles.map((a) => ({
    source: a.source.name,
    title: a.title,
    summary: a.description,
    url: a.url,
    publishedAt: a.publishedAt,
    image: a.image,
  }));
};

const fetchFromGuardian = async (query) => {
  const response = await axios.get('https://content.guardianapis.com/search', {
    params: {
      q: query,
      'show-fields': 'trailText,thumbnail',
      'page-size': 5,
      'api-key': process.env.GUARDIAN_API_KEY,
    },
  });
  return response.data.response.results.map((a) => ({
    source: 'The Guardian',
    title: a.webTitle,
    summary: a.fields?.trailText || '',
    url: a.webUrl,
    publishedAt: a.webPublicationDate,
    image: a.fields?.thumbnail || '',
  }));
};

const fetchFromRSS = async (feedName) => {
  const url = RSS_FEEDS[feedName];
  if (!url) return [];
  const feed = await parser.parseURL(url);
  return feed.items.slice(0, 5).map((item) => ({
    source: feed.title || feedName,
    title: item.title,
    summary: item.contentSnippet || item.content || '',
    url: item.link,
    publishedAt: item.pubDate,
    image: null,
  }));
};

const fetchAllSources = async (query) => {
  const results = await Promise.allSettled([
    fetchFromNewsAPI(query),
    fetchFromGNews(query),
    fetchFromGuardian(query),
    fetchFromRSS('bbc'),
    fetchFromRSS('aljazeera'),
    fetchFromRSS('rt'),
  ]);

  return {
    newsapi: results[0].status === 'fulfilled' ? results[0].value : [],
    gnews: results[1].status === 'fulfilled' ? results[1].value : [],
    guardian: results[2].status === 'fulfilled' ? results[2].value : [],
    bbc: results[3].status === 'fulfilled' ? results[3].value : [],
    aljazeera: results[4].status === 'fulfilled' ? results[4].value : [],
    rt: results[5].status === 'fulfilled' ? results[5].value : [],
  };
};

module.exports = {
  fetchFromNewsAPI,
  fetchFromGNews,
  fetchFromGuardian,
  fetchFromRSS,
  fetchAllSources,
};