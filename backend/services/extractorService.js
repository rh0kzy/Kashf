const axios = require('axios')
const cheerio = require('cheerio')

const extractArticle = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    const $ = cheerio.load(response.data)

    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, iframe, noscript').remove()

    // Try to get title
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text() ||
      $('title').text() ||
      ''

    // Try to get source
    const source =
      $('meta[property="og:site_name"]').attr('content') ||
      new URL(url).hostname.replace('www.', '') ||
      ''

    // Try to get main content
    const contentSelectors = [
      'article',
      '[class*="article-body"]',
      '[class*="article-content"]',
      '[class*="story-body"]',
      '[class*="post-content"]',
      'main',
      '.content',
    ]

    let content = ''
    for (const selector of contentSelectors) {
      const el = $(selector)
      if (el.length && el.text().trim().length > 200) {
        content = el.text().trim()
        break
      }
    }

    // Fallback to body text
    if (!content) {
      content = $('body').text().trim()
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').slice(0, 5000)

    return { title, source, content, url }
  } catch (error) {
    throw { status: 500, message: `Failed to extract article from URL: ${error.message}` }
  }
}

module.exports = { extractArticle }