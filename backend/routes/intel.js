const express = require('express')
const router = express.Router()
const { getIntelFeed } = require('../controllers/telegramController')

router.get('/feed', getIntelFeed)

module.exports = router
