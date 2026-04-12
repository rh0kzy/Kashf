const RSSParser = require('rss-parser')

const parser = new RSSParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
})

const RSSHUB_INSTANCES = [
  'https://rsshub.rssforever.com',
  'https://hub.slarker.me',
  'https://rsshub.feeded.xyz',
  'https://rsshub.app',
]

const TELEGRAM_CHANNELS = [
  { name: 'Intel Slava Z', channel: 'intelslava', lang: 'en', category: 'conflict' },
  { name: 'War Monitor', channel: 'warmonitor1', lang: 'en', category: 'conflict' },
  { name: 'Ukraine Now', channel: 'UkraineNow', lang: 'en', category: 'conflict' },
  { name: 'Military Summary', channel: 'militarysummary', lang: 'en', category: 'conflict' },
  { name: 'Middle East Eye', channel: 'MiddleEastEye', lang: 'en', category: 'breaking' },
  { name: 'Al Arabiya Breaking', channel: 'AlArabiya_Brk', lang: 'ar', category: 'arabic' },
  { name: 'Al Jazeera Arabic', channel: 'AJArabic', lang: 'ar', category: 'arabic' },
]

const DIRECT_RSS_FEEDS = [
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'breaking', lang: 'en' },
  { name: 'Al Jazeera English', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'breaking', lang: 'en' },
  { name: 'France 24 English', url: 'https://www.france24.com/en/rss', category: 'breaking', lang: 'en' },
  { name: 'War on the Rocks', url: 'https://warontherocks.com/feed/', category: 'conflict', lang: 'en' },
  { name: 'Defense News', url: 'https://www.defensenews.com/arc/outboundfeeds/rss/', category: 'conflict', lang: 'en' },
  { name: 'BBC Arabic', url: 'https://feeds.bbci.co.uk/arabic/rss.xml', category: 'arabic', lang: 'ar' },
  { name: 'France 24 Arabic', url: 'https://www.france24.com/ar/rss', category: 'arabic', lang: 'ar' },
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

const fetchTelegramChannel = async (channel, name, category, lang) => {
  for (const instance of RSSHUB_INSTANCES) {
    try {
      const url = `${instance}/telegram/channel/${channel}`
      const result = await parser.parseURL(url)
      return result.items.slice(0, 6).map(item => ({
        id: item.guid || item.link || Math.random().toString(),
        title: item.title || '',
        content: item.contentSnippet || item.content || '',
        url: item.link || `https://t.me/${channel}`,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        source: name,
        channel,
        lang,
        category,
        isTelegram: true,
      }))
    } catch {
      continue
    }
  }
  console.warn(`All RSSHub instances failed for ${name}`)
  return []
}

const fetchAllTelegramFeeds = async (category = 'all') => {
  const filteredChannels = category === 'all'
    ? TELEGRAM_CHANNELS
    : TELEGRAM_CHANNELS.filter(f => f.category === category)

  const filteredRSS = category === 'all'
    ? DIRECT_RSS_FEEDS
    : DIRECT_RSS_FEEDS.filter(f => f.category === category)

  const [telegramResults, rssResults] = await Promise.all([
    Promise.allSettled(filteredChannels.map(c =>
      fetchTelegramChannel(c.channel, c.name, c.category, c.lang)
    )),
    Promise.allSettled(filteredRSS.map(fetchFeed)),
  ])

  const allItems = [
    ...telegramResults.filter(r => r.status === 'fulfilled').flatMap(r => r.value),
    ...rssResults.filter(r => r.status === 'fulfilled').flatMap(r => r.value),
  ]
    .filter(item => item.title)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return allItems
}

module.exports = { fetchAllTelegramFeeds }
