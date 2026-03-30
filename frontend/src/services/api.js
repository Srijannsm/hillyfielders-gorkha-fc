import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const getPlayers = (team) =>
  api.get(`/players/${team ? `?team=${team}` : ''}`).then(r => r.data)

export const getTeams = () =>
  api.get('/players/teams/').then(r => r.data)

export const getFixtures = (team, completed) =>
  api.get(`/fixtures/?team=${team || ''}&completed=${completed ?? ''}`).then(r => r.data)

export const getNews = () =>
  api.get('/news/').then(r => r.data)

export const getArticle = (slug) =>
  api.get(`/news/${slug}/`).then(r => r.data)

export const getSponsors = () =>
  api.get('/sponsors/').then(r => r.data)

export const sendContactMessage = (data) =>
  api.post('/contact/', data).then(r => r.data)

export const getGallery = (category) =>
  api.get(`/gallery/${category ? `?category=${category}` : ''}`).then(r => r.data)

export const getClubProfile = () =>
  api.get('/club/').then(r => r.data)