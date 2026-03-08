const { fetchAllTelegramFeeds } = require('../services/telegramService')

const getIntelFeed = async (req, res) => {
    try {
        const { category = 'all' } = req.query
        const items = await fetchAllTelegramFeeds(category)
        res.json({ success: true, items, count: items.length })
    } catch (error) {
        console.error('getIntelFeed error:', error.message)
        res.status(500).json({ error: 'Failed to fetch intel feed' })
    }
}

module.exports = { getIntelFeed }
