const axios = require('axios');

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';

const fetchConflictArticles = async (timespan = '1week') => {
  try {
    const response = await axios.get(GDELT_BASE, {
      params: {
        query: '(conflict OR war OR attack OR airstrike OR bombing OR ceasefire)',
        mode: 'artlist',
        maxrecords: 50,
        timespan,
        sort: 'DateDesc',
        format: 'json',
      },
      timeout: 10000,
    });
    return response.data?.articles || [];
  } catch (error) {
    if (error.response?.status === 429) {
      // Wait 5 seconds and retry once
      await new Promise(resolve => setTimeout(resolve, 5000));
      const retry = await axios.get(GDELT_BASE, {
        params: {
          query: '(conflict OR war OR attack OR airstrike OR bombing OR ceasefire)',
          mode: 'artlist',
          maxrecords: 50,
          timespan,
          sort: 'DateDesc',
          format: 'json',
        },
      });
      return retry.data?.articles || [];
    }
    throw error;
  }
};

const fetchArticlesByLocation = async (location, timespan = '1week') => {
  const response = await axios.get(GDELT_BASE, {
    params: {
      query: `"${location}" (conflict OR war OR attack OR military)`,
      mode: 'artlist',
      maxrecords: 10,
      timespan,
      sort: 'DateDesc',
      format: 'json',
    },
  });
  return response.data?.articles || [];
};

const fetchToneTimeline = async (query, timespan = '1month') => {
  const response = await axios.get(GDELT_BASE, {
    params: {
      query,
      mode: 'timelinetone',
      timespan,
      format: 'json',
    },
  });
  return response.data || {};
};

const fetchVolumeTimeline = async (query, timespan = '1month') => {
  const response = await axios.get(GDELT_BASE, {
    params: {
      query,
      mode: 'timelinevolinfo',
      timespan,
      format: 'json',
    },
  });
  return response.data || {};
};

const fetchConflictByCountry = async (country, timespan = '1week') => {
  const response = await axios.get(GDELT_BASE, {
    params: {
      query: `(conflict OR war OR attack) sourcecountry:${country.replace(/\s/g, '').toLowerCase()}`,
      mode: 'artlist',
      maxrecords: 10,
      timespan,
      sort: 'DateDesc',
      format: 'json',
    },
  });
  return response.data?.articles || [];
};

module.exports = {
  fetchConflictArticles,
  fetchArticlesByLocation,
  fetchToneTimeline,
  fetchVolumeTimeline,
  fetchConflictByCountry,
};