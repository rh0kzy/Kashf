const axios = require('axios');

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const gdeltRequest = async (params, retryCount = 0) => {
  const cacheKey = JSON.stringify(params);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(GDELT_BASE, {
      params,
      timeout: 20000, // Increased timeout
    });
    const data = response.data;
    setCached(cacheKey, data);
    return data;
  } catch (error) {
    if ((error.response?.status === 429 || error.code === 'ECONNABORTED') && retryCount < 2) {
      const delay = 5000 * (retryCount + 1);
      console.log(`GDELT API error (${error.response?.status || 'Timeout'}). Retrying in ${delay / 1000}s... (Attempt ${retryCount + 1}/2)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return gdeltRequest(params, retryCount + 1);
    }
    console.error('GDELT API Request Error:', error.message);
    throw error;
  }
};

const fetchConflictArticles = async (timespan = '1week') => {
  const data = await gdeltRequest({
    query: '(conflict OR war OR attack OR airstrike OR bombing OR ceasefire)',
    mode: 'artlist',
    maxrecords: 50,
    timespan,
    sort: 'DateDesc',
    format: 'json',
  });
  return data?.articles || [];
};

const fetchArticlesByLocation = async (location, timespan = '1week') => {
  const data = await gdeltRequest({
    query: `"${location}" (conflict OR war OR attack OR military)`,
    mode: 'artlist',
    maxrecords: 10,
    timespan,
    sort: 'DateDesc',
    format: 'json',
  });
  return data?.articles || [];
};

const fetchToneTimeline = async (query, timespan = '1month') => {
  const data = await gdeltRequest({
    query,
    mode: 'timelinetone',
    timespan,
    format: 'json',
  });
  return data || {};
};

const fetchVolumeTimeline = async (query, timespan = '1month') => {
  const data = await gdeltRequest({
    query,
    mode: 'timelinevolinfo',
    timespan,
    format: 'json',
  });
  return data || {};
};

const fetchConflictByCountry = async (country, timespan = '1week') => {
  const data = await gdeltRequest({
    query: `(conflict OR war OR attack) sourcecountry:${country.replace(/\s/g, '').toLowerCase()}`,
    mode: 'artlist',
    maxrecords: 10,
    timespan,
    sort: 'DateDesc',
    format: 'json',
  });
  return data?.articles || [];
};

module.exports = {
  fetchConflictArticles,
  fetchArticlesByLocation,
  fetchToneTimeline,
  fetchVolumeTimeline,
  fetchConflictByCountry,
};