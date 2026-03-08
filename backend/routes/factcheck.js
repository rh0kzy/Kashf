const express = require('express');
const router = express.Router();
const { checkArticle, checkClaim } = require('../controllers/factcheckController');

router.post('/article', checkArticle);
router.post('/claim', checkClaim);

module.exports = router;