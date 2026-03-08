const RSSParser = require('rss-parser')

const parser = new RSSParser({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
})

const INTEL_FEEDS = [
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'breaking', lang: 'en' },
    { name: 'Al Jazeera English', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'breaking', lang: 'en' },
    { name: 'France 24 English', url: 'https://www.france24.com/en/rss', category: 'breaking', lang: 'en' },
    { name: 'War on the Rocks', url: 'https://warontherocks.com/feed/', category: 'conflict', lang: 'en' },
    { name: 'Defense News', url: 'https://www.defensenews.com/arc/outboundfeeds/rss/', category: 'conflict', lang: 'en' },
    { name: 'The Drive War Zone', url: 'https://www.thedrive.com/the-war-zone/rss', category: 'conflict', lang: 'en' },
    { name: 'BBC Arabic', url: 'https://feeds.bbci.co.uk/arabic/rss.xml', category: 'arabic', lang: 'ar' },
    { name: 'France 24 Arabic', url: 'https://www.france24.com/ar/rss', category: 'arabic', lang: 'ar' },
    { name: 'RT Arabic', url: 'https://arabic.rt.com/rss/', category: 'arabic', lang: 'ar' },
    { name: 'DW Arabic', url: 'https://rss.dw.com/rdf/rss-ar-all', category: 'arabic', lang: 'ar' },
]

const fetchFeed = async (feed) => {
    try {
        const result = await parser.parseURL(feed.url)
        return result.items.slice(0, 8).map(item => ({
            id: item.guid || item.link || Math.random().toString(),
            title: item.title || '',
            content: item.contentSnippet || item.content || item.summary || '',
            url: item.link || '',
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            source: feed.name,
            lang: feed.lang,
            category: feed.category,
        }))
    } catch (error) {
        console.warn(`Feed ${feed.name} failed:`, error.message)
        return []
    }
}

const fetchAllTelegramFeeds = async (category = 'all') => {
    const feeds = category === 'all'
        ? INTEL_FEEDS
        : INTEL_FEEDS.filter(f => f.category === category)

    const results = await Promise.allSettled(feeds.map(fetchFeed))

    const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)
        .filter(item => item.title)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return allItems
}

module.exports = { fetchAllTelegramFeeds }
