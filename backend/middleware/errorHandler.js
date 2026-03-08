const rateLimit = (err, req, res, next) => {
  if (err?.response?.status === 429) {
    return res.status(429).json({
      error: 'Too many requests to external API. Please wait a moment and try again.',
      retryAfter: 30,
    })
  }
  next(err)
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const apiErrorHandler = (error, source) => {
  if (error?.response?.status === 429) {
    throw { status: 429, message: `${source} rate limit reached. Try again in 30 seconds.` }
  }
  if (error?.response?.status === 401) {
    throw { status: 401, message: `${source} API key is invalid or missing.` }
  }
  if (error?.response?.status === 403) {
    throw { status: 403, message: `${source} API access forbidden.` }
  }
  if (error?.code === 'ECONNABORTED') {
    throw { status: 504, message: `${source} request timed out.` }
  }
  if (error?.code === 'ENOTFOUND') {
    throw { status: 503, message: `${source} is unreachable. Check your connection.` }
  }
  throw { status: 500, message: `${source} failed: ${error.message}` }
}

module.exports = { rateLimit, asyncHandler, apiErrorHandler }