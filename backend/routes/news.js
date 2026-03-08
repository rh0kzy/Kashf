const express = require('express');
const router = express.Router();
const { searchNews, fetchRSSFeed } = require('../controllers/newsController');

router.get('/search', searchNews);
router.get('/rss/:source', fetchRSSFeed);

module.exports = router;
