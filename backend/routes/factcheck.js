const express = require('express')
const router = express.Router()
const { checkArticle, checkClaim, extractAndCheck } = require('../controllers/factcheckController')

router.post('/article', checkArticle)
router.post('/claim', checkClaim)
router.post('/extract', extractAndCheck)

module.exports = router