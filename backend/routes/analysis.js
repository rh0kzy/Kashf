const express = require('express');
const router = express.Router();
const { analyzeQuery, analyzeURL } = require('../controllers/analysisController');

router.get('/query', analyzeQuery);
router.post('/url', analyzeURL);

module.exports = router;