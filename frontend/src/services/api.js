import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// List endpoints return paginated { count, next, previous, results: [...] }
const results = r => r.data.results

export const getPlayers = (team) =>
  api.get(`/players/${team ? `?team=${team}` : ''}`).then(results)

export const getTeams = () =>
  api.get('/players/teams/').then(results)

export const getTeamBySlug = (slug) =>
  api.get(`/players/teams/${slug}/`).then(r => r.data)

export const getProgrammes = () =>
  api.get('/players/programmes/').then(results)

export const getFixtures = (team, completed) =>
  api.get(`/fixtures/?team=${team || ''}&completed=${completed ?? ''}`).then(results)

export const getNews = () =>
  api.get('/news/').then(results)

export const getArticle = (slug) =>
  api.get(`/news/${slug}/`).then(r => r.data)

export const getSponsors = () =>
  api.get('/sponsors/').then(results)

export const sendContactMessage = (data) =>
  api.post('/contact/', data).then(r => r.data)

export const getGallery = (category) =>
  api.get(`/gallery/${category ? `?category=${category}` : ''}`).then(results)

export const getClubProfile = () =>
  api.get('/club/').then(r => r.data)