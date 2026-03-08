const mistralService = require('../services/mistralService')
const { extractArticle } = require('../services/extractorService')
const axios = require('axios')

const checkWithClaimBuster = async (text) => {
  if (!process.env.CLAIMBUSTER_KEY) return null
  const response = await axios.get(
    `https://idir.uta.edu/claimbuster/api/v2/score/text/${encodeURIComponent(text)}`,
    { headers: { 'x-api-key': process.env.CLAIMBUSTER_KEY } }
  )
  return response.data
}

const checkArticle = async (req, res) => {
  try {
    const { url, title, source, content } = req.body
    if (!content && !url) {
      return res.status(400).json({ error: 'URL or content is required' })
    }
    const [mistralResult, claimBusterResult] = await Promise.allSettled([
      mistralService.detectFakeNews({ url, title, source, content }),
      checkWithClaimBuster(content || title),
    ])
    res.json({
      success: true,
      mistral: mistralResult.status === 'fulfilled' ? mistralResult.value : null,
      claimbuster: claimBusterResult.status === 'fulfilled' ? claimBusterResult.value : null,
    })
  } catch (error) {
    console.error('checkArticle error:', error.message)
    res.status(500).json({ error: 'Failed to fact-check article' })
  }
}

const checkClaim = async (req, res) => {
  try {
    const { claim } = req.body
    if (!claim) return res.status(400).json({ error: 'Claim is required' })
    const response = await axios.get(
      'https://factchecktools.googleapis.com/v1alpha1/claims:search',
      { params: { query: claim, key: process.env.GOOGLE_FACTCHECK_KEY } }
    )
    res.json({ success: true, results: response.data })
  } catch (error) {
    console.error('checkClaim error:', error.message)
    res.status(500).json({ error: 'Failed to check claim' })
  }
}

const extractAndCheck = async (req, res) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'URL is required' })
    const extracted = await extractArticle(url)
    if (!extracted.content) {
      return res.status(422).json({ error: 'Could not extract content from this URL' })
    }
    const [mistralResult, claimBusterResult] = await Promise.allSettled([
      mistralService.detectFakeNews(extracted),
      checkWithClaimBuster(extracted.content),
    ])
    res.json({
      success: true,
      extracted,
      mistral: mistralResult.status === 'fulfilled' ? mistralResult.value : null,
      claimbuster: claimBusterResult.status === 'fulfilled' ? claimBusterResult.value : null,
    })
  } catch (error) {
    console.error('extractAndCheck error:', error.message)
    res.status(error.status || 500).json({ error: error.message || 'Failed to extract and check article' })
  }
}

module.exports = {
  checkArticle,
  checkClaim,
  extractAndCheck,
}