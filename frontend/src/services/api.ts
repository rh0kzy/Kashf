import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

export const searchNews = (query: string) =>
  api.get(`/api/news/search?query=${query}`)

export const analyzeQuery = (query: string) =>
  api.get(`/api/analysis/query?query=${query}`)

export const analyzeURL = (data: object) =>
  api.post('/api/analysis/url', data)

export const getConflictEvents = () =>
  api.get('/api/conflicts/events')

export const getNewsByLocation = (location: string) =>
  api.get(`/api/conflicts/location/${location}`)

export const checkArticle = (data: object) =>
  api.post('/api/factcheck/article', data)

export const extractAndCheck = (data: { url: string }) =>
  api.post('/api/factcheck/extract', data)

export default api